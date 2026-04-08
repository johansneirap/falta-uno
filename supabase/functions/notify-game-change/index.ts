import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const SPORT_LABEL: Record<string, string> = {
  padel: 'Pádel', futbol: 'Fútbol', tenis: 'Tenis', basket: 'Básket',
}
const FORMAT_LABEL: Record<string, string> = {
  dobles: 'Dobles', singles: 'Singles',
  '5v5': '5 vs 5', '7v7': '7 vs 7', '11v11': '11 vs 11', '3v3': '3 vs 3',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  const { game_id, change_type } = await req.json()
  if (!game_id || !change_type) return new Response('Missing params', { status: 400 })

  // Fetch game + organizer name
  const { data: game } = await supabase
    .from('games')
    .select('sport, format, location_text, datetime, organizer:profiles!games_created_by_fkey(name)')
    .eq('id', game_id)
    .single() as { data: any }

  if (!game) return new Response('Game not found', { status: 404 })

  // Fetch all joined players with email
  const { data: joins } = await supabase
    .from('game_joins')
    .select('player:profiles!game_joins_user_id_fkey(id, name, email)')
    .eq('game_id', game_id) as { data: any[] | null }

  const players = (joins ?? [])
    .map((j: any) => j.player)
    .filter((p: any) => p?.email)

  if (players.length === 0) return new Response(null, { status: 200 })

  const sport = SPORT_LABEL[game.sport] ?? game.sport
  const format = FORMAT_LABEL[game.format] ?? game.format
  const dateStr = new Date(game.datetime).toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long',
  }) + ' a las ' + new Date(game.datetime).toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit',
  })
  const organizer = game.organizer?.name ?? 'El organizador'
  const from = `Falta 1 <noreply@${Deno.env.get('EMAIL_DOMAIN') ?? 'resend.dev'}>`

  const isEdit = change_type === 'edited'
  const subject = isEdit
    ? `Cambios en el partido de ${sport}`
    : `Partido de ${sport} cancelado`

  const html = isEdit ? `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 16px">⚠️ El partido fue modificado</h2>
      <p style="margin:0 0 8px"><strong>${organizer}</strong> actualizó los datos del partido de <strong>${sport} · ${format}</strong>.</p>
      <p style="margin:0 0 4px">📍 <strong>${game.location_text}</strong></p>
      <p style="margin:0 0 16px">📅 <strong>${dateStr}</strong></p>
      <p style="margin:0 0 24px;color:#888;font-size:13px">Revisa los nuevos datos antes de ir. Si no puedes asistir, puedes salir del partido desde la app.</p>
      <p style="color:#888;font-size:12px;margin:0">— Falta 1 · Región de Valparaíso</p>
    </div>
  ` : `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 16px">❌ Partido cancelado</h2>
      <p style="margin:0 0 8px"><strong>${organizer}</strong> canceló el partido de <strong>${sport} · ${format}</strong>.</p>
      <p style="margin:0 0 4px">📍 ${game.location_text}</p>
      <p style="margin:0 0 16px">📅 ${dateStr}</p>
      <p style="margin:0 0 24px;color:#888;font-size:13px">Puedes buscar otro partido disponible en Falta 1.</p>
      <p style="color:#888;font-size:12px;margin:0">— Falta 1 · Región de Valparaíso</p>
    </div>
  `

  // Obtener user_ids de los jugadores para notificaciones in-app
  const playerUserIds: string[] = (joins ?? []).map((j: any) => j.player?.id).filter(Boolean)

  const notifTitle = isEdit
    ? `Cambios en el partido de ${sport}`
    : `Partido de ${sport} cancelado`
  const notifBody = isEdit
    ? `${organizer} actualizó el partido en ${game.location_text} · ${dateStr}`
    : `${organizer} canceló el partido en ${game.location_text} · ${dateStr}`

  // Emails + notificaciones in-app en paralelo
  const [emailResults] = await Promise.all([
    Promise.allSettled(
      players.map((player: any) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ from, to: player.email, subject, html }),
        })
      )
    ),
    playerUserIds.length > 0
      ? supabase.from('notifications').insert(
          playerUserIds.map((uid: string) => ({
            user_id: uid,
            type: isEdit ? 'game_edited' : 'game_cancelled',
            title: notifTitle,
            body: notifBody,
            game_id,
          }))
        )
      : Promise.resolve(),
  ])

  const sent = emailResults.filter(r => r.status === 'fulfilled').length
  console.log(`notify-game-change [${change_type}]: ${sent}/${players.length} emails, ${playerUserIds.length} notificaciones in-app`)

  return new Response(JSON.stringify({ sent, total: players.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
