import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  const { user_id } = await req.json()
  if (!user_id) return new Response('Missing user_id', { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', user_id)
    .single()

  if (!profile?.email) return new Response('No email', { status: 200 })

  const from = `Falta 1 <noreply@${Deno.env.get('EMAIL_DOMAIN') ?? 'resend.dev'}>`

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: profile.email,
      subject: `Bienvenido a Falta 1, ${profile.name}`,
      html: buildWelcomeEmail({ name: profile.name }),
    }),
  })

  const body = await resendRes.json()
  console.log('welcome-email:', resendRes.status, JSON.stringify(body))

  return new Response(JSON.stringify({ ok: resendRes.ok }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

function buildWelcomeEmail({ name }: { name: string }) {
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
              <span style="display:inline-flex;align-items:center;gap:6px;background:#A8E6B4;border:2px solid #000;border-radius:999px;padding:5px 14px;font-family:monospace;font-size:11px;font-weight:700;color:#1A1A1A">
                ● Nuevo jugador
              </span>
            </div>

            <!-- Headline -->
            <h1 style="margin:0 0 8px;font-family:monospace;font-size:24px;font-weight:700;color:#1A1A1A;line-height:1.3">
              ¡Hola, ${name}!
            </h1>
            <p style="margin:0 0 24px;font-family:sans-serif;font-size:14px;color:#555;line-height:1.5">
              Ya eres parte de Falta 1. Encuentra jugadores para completar tu partido de pádel, fútbol, tenis o básket en la Región de Valparaíso.
            </p>

            <!-- Steps card -->
            <div style="background:#fff;border:2px solid #000;border-radius:12px;box-shadow:4px 4px 0 #000;padding:16px;margin-bottom:20px">

              <div style="font-family:monospace;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:12px">
                Cómo empezar
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px">
                <tr>
                  <td width="40" valign="top">
                    <div style="width:32px;height:32px;background:#FFC097;border:2px solid #000;border-radius:6px;text-align:center;line-height:32px;font-size:16px">🔍</div>
                  </td>
                  <td valign="top" style="padding-left:10px;padding-top:4px">
                    <div style="font-family:monospace;font-size:13px;font-weight:700;color:#1A1A1A;margin-bottom:2px">Busca un partido</div>
                    <div style="font-family:sans-serif;font-size:12px;color:#888">Filtra por deporte, nivel y ubicación</div>
                  </td>
                </tr>
              </table>
              <div style="height:1px;background:#0000001a;margin-bottom:12px"></div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px">
                <tr>
                  <td width="40" valign="top">
                    <div style="width:32px;height:32px;background:#A8C8F0;border:2px solid #000;border-radius:6px;text-align:center;line-height:32px;font-size:16px">✋</div>
                  </td>
                  <td valign="top" style="padding-left:10px;padding-top:4px">
                    <div style="font-family:monospace;font-size:13px;font-weight:700;color:#1A1A1A;margin-bottom:2px">Únete en un toque</div>
                    <div style="font-family:sans-serif;font-size:12px;color:#888">El organizador recibe tu contacto por WhatsApp</div>
                  </td>
                </tr>
              </table>
              <div style="height:1px;background:#0000001a;margin-bottom:12px"></div>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="40" valign="top">
                    <div style="width:32px;height:32px;background:#C4AEED;border:2px solid #000;border-radius:6px;text-align:center;line-height:32px;font-size:16px">📋</div>
                  </td>
                  <td valign="top" style="padding-left:10px;padding-top:4px">
                    <div style="font-family:monospace;font-size:13px;font-weight:700;color:#1A1A1A;margin-bottom:2px">O crea el tuyo</div>
                    <div style="font-family:sans-serif;font-size:12px;color:#888">Publica un partido y llena los cupos que faltan</div>
                  </td>
                </tr>
              </table>

            </div>

            <!-- CTA -->
            <div style="background:#1A1A1A;border:2px solid #000;border-radius:10px;box-shadow:4px 4px 0 #FFC097;padding:16px;text-align:center">
              <span style="font-family:monospace;font-size:14px;font-weight:700;color:#F5F0E8;letter-spacing:1px">VER PARTIDOS →</span>
            </div>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 24px;border-top:2px solid #0000001a;text-align:center">
            <div style="font-family:monospace;font-size:10px;font-weight:700;color:#888;margin-bottom:4px">Falta 1 · Región de Valparaíso</div>
            <div style="font-family:sans-serif;font-size:10px;color:#aaa">Recibiste este correo porque creaste una cuenta en Falta 1.</div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
