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

  const html = buildGameChangeEmail({ isEdit, organizer, sport, format, location: game.location_text, dateStr })

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

function buildGameChangeEmail({ isEdit, organizer, sport, format, location, dateStr }: {
  isEdit: boolean
  organizer: string
  sport: string
  format: string
  location: string
  dateStr: string
}) {
  const SPORT_EMOJI: Record<string, string> = {
    'Pádel': '🎾', 'Fútbol': '⚽', 'Tenis': '🎾', 'Básket': '🏀',
  }
  const sportEmoji = SPORT_EMOJI[sport] ?? '🏃'

  const accentColor = isEdit ? '#FFE599' : '#F4A8B0'
  const badgeLabel = isEdit ? 'Partido modificado' : 'Partido cancelado'
  const headline = isEdit ? `${organizer} actualizó el partido` : 'El partido fue cancelado'
  const alertText = isEdit
    ? 'Revisa los nuevos datos antes de ir. Si no puedes asistir, puedes salir del partido desde la app.'
    : 'Este partido ya no se realizará. Puedes buscar otro partido disponible en la app.'
  const ctaLabel = isEdit ? 'VER PARTIDO →' : 'BUSCAR PARTIDO →'
  const footerNote = isEdit
    ? 'Recibiste este correo porque estás unido a este partido.'
    : 'Recibiste este correo porque estabas unido a este partido.'

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#E8E3DB">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#E8E3DB;padding:24px 0">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#F5F0E8;border:2px solid #000;box-shadow:5px 5px 0 #000;overflow:hidden">

        <!-- Header -->
        <tr>
          <td style="background:#1A1A1A;padding:18px 24px">
            <span style="font-family:monospace;font-size:20px;font-weight:700;color:#F5F0E8;letter-spacing:2px">FALTA 1</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:24px">

            <!-- Badge -->
            <div style="margin-bottom:16px">
              <span style="display:inline-flex;align-items:center;gap:6px;background:${accentColor};border:2px solid #000;border-radius:999px;padding:5px 14px;font-family:monospace;font-size:11px;font-weight:700;color:#1A1A1A">
                ● ${badgeLabel}
              </span>
            </div>

            <!-- Headline -->
            <h1 style="margin:0 0 20px;font-family:monospace;font-size:22px;font-weight:700;color:#1A1A1A;line-height:1.3">
              ${headline}
            </h1>

            <!-- Detail card -->
            <div style="background:#fff;border:2px solid #000;border-radius:12px;box-shadow:4px 4px 0 #000;padding:16px;margin-bottom:16px">

              <!-- Sport row -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px">
                <tr>
                  <td width="40" valign="middle">
                    <div style="width:32px;height:32px;background:#FFC097;border:2px solid #000;border-radius:6px;text-align:center;line-height:32px;font-size:16px">${sportEmoji}</div>
                  </td>
                  <td valign="middle" style="padding-left:10px">
                    <div style="font-family:monospace;font-size:9px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:2px">Deporte</div>
                    <div style="font-family:monospace;font-size:13px;font-weight:700;color:#1A1A1A">${sport} · ${format}</div>
                  </td>
                </tr>
              </table>
              <div style="height:1px;background:#0000001a;margin-bottom:12px"></div>

              <!-- Location row -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px">
                <tr>
                  <td width="40" valign="middle">
                    <div style="width:32px;height:32px;background:#A8C8F0;border:2px solid #000;border-radius:6px;text-align:center;line-height:32px;font-size:16px">📍</div>
                  </td>
                  <td valign="middle" style="padding-left:10px">
                    <div style="font-family:monospace;font-size:9px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:2px">Ubicación</div>
                    <div style="font-family:monospace;font-size:13px;font-weight:700;color:#1A1A1A">${location}</div>
                  </td>
                </tr>
              </table>
              <div style="height:1px;background:#0000001a;margin-bottom:12px"></div>

              <!-- Date row -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="40" valign="middle">
                    <div style="width:32px;height:32px;background:#C4AEED;border:2px solid #000;border-radius:6px;text-align:center;line-height:32px;font-size:16px">📅</div>
                  </td>
                  <td valign="middle" style="padding-left:10px">
                    <div style="font-family:monospace;font-size:9px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:2px">Fecha</div>
                    <div style="font-family:monospace;font-size:13px;font-weight:700;color:#1A1A1A">${dateStr}</div>
                  </td>
                </tr>
              </table>

            </div>

            <!-- Alert -->
            <div style="background:${accentColor};border:2px solid #000;border-radius:10px;box-shadow:3px 3px 0 #000;padding:12px 16px;margin-bottom:16px">
              <span style="font-family:sans-serif;font-size:12px;color:#1A1A1A">${alertText}</span>
            </div>

            <!-- CTA -->
            <div style="background:#1A1A1A;border:2px solid #000;border-radius:10px;box-shadow:4px 4px 0 ${accentColor};padding:16px;text-align:center">
              <span style="font-family:monospace;font-size:14px;font-weight:700;color:#F5F0E8;letter-spacing:1px">${ctaLabel}</span>
            </div>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 24px;border-top:2px solid #0000001a;text-align:center">
            <div style="font-family:monospace;font-size:10px;font-weight:700;color:#888;margin-bottom:4px">Falta 1 · Región de Valparaíso</div>
            <div style="font-family:sans-serif;font-size:10px;color:#aaa">${footerNote}</div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
