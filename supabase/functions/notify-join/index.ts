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
      html: buildJoinEmail({ joinerName: joiner.name, sport, format, location: game.location_text, dateStr, slotsLeft }),
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

function buildJoinEmail({ joinerName, sport, format, location, dateStr, slotsLeft }: {
  joinerName: string
  sport: string
  format: string
  location: string
  dateStr: string
  slotsLeft: number
}) {
  const SPORT_EMOJI: Record<string, string> = {
    'Pádel': '🎾', 'Fútbol': '⚽', 'Tenis': '🎾', 'Básket': '🏀',
  }
  const sportEmoji = SPORT_EMOJI[sport] ?? '🏃'

  const slotsHtml = slotsLeft > 0
    ? `<div style="background:#FFC097;border:2px solid #000;border-radius:10px;box-shadow:3px 3px 0 #000;padding:12px 16px;margin-bottom:16px">
        <span style="font-family:monospace;font-size:13px;font-weight:700;color:#1A1A1A">
          Quedan ${slotsLeft} cupo${slotsLeft > 1 ? 's' : ''} disponible${slotsLeft > 1 ? 's' : ''}
        </span>
       </div>`
    : `<div style="background:#A8E6B4;border:2px solid #000;border-radius:10px;box-shadow:3px 3px 0 #000;padding:12px 16px;margin-bottom:16px">
        <span style="font-family:monospace;font-size:13px;font-weight:700;color:#1A1A1A">
          🏆 ¡Tu partido está completo!
        </span>
       </div>`

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#E8E3DB">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#E8E3DB;padding:24px 0">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#F5F0E8;border:2px solid #000;border-radius:0;box-shadow:5px 5px 0 #000;overflow:hidden">

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
              <span style="display:inline-flex;align-items:center;gap:6px;background:#A8E6B4;border:2px solid #000;border-radius:999px;padding:5px 14px;font-family:monospace;font-size:11px;font-weight:700;color:#1A1A1A">
                ● Nuevo jugador
              </span>
            </div>

            <!-- Headline -->
            <h1 style="margin:0 0 20px;font-family:monospace;font-size:22px;font-weight:700;color:#1A1A1A;line-height:1.3">
              ${joinerName} se unió a tu partido
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

            <!-- Slots -->
            ${slotsHtml}

            <!-- CTA -->
            <div style="background:#1A1A1A;border:2px solid #000;border-radius:10px;box-shadow:4px 4px 0 #FFC097;padding:16px;text-align:center">
              <span style="font-family:monospace;font-size:14px;font-weight:700;color:#F5F0E8;letter-spacing:1px">VER PARTIDO →</span>
            </div>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 24px;border-top:2px solid #0000001a;text-align:center">
            <div style="font-family:monospace;font-size:10px;font-weight:700;color:#888;margin-bottom:4px">Falta 1 · Región de Valparaíso</div>
            <div style="font-family:sans-serif;font-size:10px;color:#aaa">Recibiste este correo porque eres organizador de este partido.</div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
