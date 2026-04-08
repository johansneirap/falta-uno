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
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  const { game_id, joiner_id } = await req.json()
  if (!game_id || !joiner_id) return new Response('Missing params', { status: 400 })

  const [gameRes, joinerRes] = await Promise.all([
    supabase
      .from('games')
      .select('sport, format, location_text, datetime, slots_available, organizer:profiles!games_created_by_fkey(name, email)')
      .eq('id', game_id)
      .single(),
    supabase
      .from('profiles')
      .select('name')
      .eq('id', joiner_id)
      .single(),
  ])

  const game = gameRes.data as any
  const joiner = joinerRes.data as any
  if (!game || !joiner) return new Response('Not found', { status: 404 })

  const organizerEmail = game.organizer?.email
  if (!organizerEmail) return new Response('No organizer email', { status: 200 })

  const dateStr = new Date(game.datetime).toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long',
  }) + ' a las ' + new Date(game.datetime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })

  const sport = SPORT_LABEL[game.sport] ?? game.sport
  const format = FORMAT_LABEL[game.format] ?? game.format
  const slotsLeft = game.slots_available  // already decremented by join_game RPC

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Falta 1 <noreply@${Deno.env.get('EMAIL_DOMAIN') ?? 'resend.dev'}>`,
      to: organizerEmail,
      subject: `${joiner.name} se unió a tu partido`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="margin:0 0 16px">¡Nuevo jugador en tu partido! 🎉</h2>
          <p style="margin:0 0 8px"><strong>${joiner.name}</strong> se unió a tu partido de <strong>${sport} · ${format}</strong>.</p>
          <p style="margin:0 0 8px">📍 ${game.location_text}</p>
          <p style="margin:0 0 16px">📅 ${dateStr}</p>
          ${slotsLeft > 0
            ? `<p style="margin:0 0 24px">Quedan <strong>${slotsLeft} cupo${slotsLeft > 1 ? 's' : ''}</strong> disponible${slotsLeft > 1 ? 's' : ''}.</p>`
            : `<p style="margin:0 0 24px">🏆 <strong>¡Tu partido está completo!</strong></p>`
          }
          <p style="color:#888;font-size:12px;margin:0">— Falta 1 · Región de Valparaíso</p>
        </div>
      `,
    }),
  })

  const resendBody = await resendRes.json()
  console.log('Resend status:', resendRes.status, JSON.stringify(resendBody))

  // Notificación in-app al organizador
  const organizerId = (await supabase
    .from('games')
    .select('created_by')
    .eq('id', game_id)
    .single()).data?.created_by

  if (organizerId) {
    await supabase.from('notifications').insert({
      user_id: organizerId,
      type: 'join',
      title: `${joiner.name} se unió a tu partido`,
      body: `${sport} · ${format} en ${game.location_text}`,
      game_id,
    })
  }

  return new Response(JSON.stringify({ ok: resendRes.ok, resend: resendBody }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
