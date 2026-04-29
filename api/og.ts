const SPORT_LABEL: Record<string, string> = {
  padel: 'Pádel', futbol: 'Fútbol', tenis: 'Tenis', basket: 'Básket',
}
const SPORT_EMOJI: Record<string, string> = {
  padel: '🎾', futbol: '⚽', tenis: '🎾', basket: '🏀',
}
const FORMAT_LABEL: Record<string, string> = {
  dobles: 'Dobles', singles: 'Singles',
  '5v5': '5 vs 5', '7v7': '7 vs 7', '11v11': '11 vs 11', '3v3': '3 vs 3',
}
const LEVEL_LABEL: Record<string, string> = {
  recreacional: 'Recreacional', principiante: 'Principiante',
  intermedio: 'Intermedio', avanzado: 'Avanzado',
  '6ta': '6ª Cat.', '5ta': '5ª Cat.', '4ta': '4ª Cat.',
  '3ra': '3ª Cat.', '2da': '2ª Cat.',
}

const BOT_RE = /whatsapp|facebookexternalhit|twitterbot|linkedinbot|telegrambot|slackbot|discordbot/i

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default async function handler(req: any, res: any) {
  const id = req.query?.id as string | undefined
  if (!id) {
    res.status(400).send('Missing id')
    return
  }

  const ua = (req.headers['user-agent'] as string) ?? ''
  const isBot = BOT_RE.test(ua)

  if (!isBot) {
    res.setHeader('Location', `/partido/${id}`)
    res.status(302).end()
    return
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL!
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!

  let game: any = null
  try {
    const r = await fetch(
      `${supabaseUrl}/rest/v1/games?id=eq.${id}&select=sport,format,level_required,level_max,datetime,location_text,slots_available`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    )
    const data = await r.json()
    game = Array.isArray(data) ? data[0] ?? null : null
  } catch {}

  const host = req.headers['x-forwarded-host'] ?? req.headers['host'] ?? 'faltauno.lat'
  const proto = req.headers['x-forwarded-proto'] ?? 'https'
  const baseUrl = `${proto}://${host}`

  let title = 'Falta 1 — Completa tu partido'
  let description = 'Encuentra jugadores para completar tu partido en la Región de Valparaíso.'

  if (game) {
    const date = new Date(game.datetime)
    const dateStr = date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
    const timeStr = date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    const sport = SPORT_LABEL[game.sport] ?? game.sport
    const format = FORMAT_LABEL[game.format] ?? game.format
    const em = SPORT_EMOJI[game.sport] ?? '🏅'
    const slots = game.slots_available as number
    const levelMin = LEVEL_LABEL[game.level_required] ?? game.level_required
    const levelMax = game.level_max ? LEVEL_LABEL[game.level_max] ?? game.level_max : null
    const levelStr = levelMax ? `${levelMin} – ${levelMax}` : levelMin

    title = `${em} Falta${slots === 1 ? ' 1' : `n ${slots}`} — ${sport} ${format}`
    description = `📍 ${game.location_text} · 📅 ${dateStr} · ${timeStr} · Nivel: ${levelStr}`
  }

  const pageUrl = `${baseUrl}/partido/${id}`
  const ogImage = `${baseUrl}/og-image.svg`

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>${escHtml(title)}</title>
  <meta name="description" content="${escHtml(description)}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="Falta 1"/>
  <meta property="og:title" content="${escHtml(title)}"/>
  <meta property="og:description" content="${escHtml(description)}"/>
  <meta property="og:url" content="${escHtml(pageUrl)}"/>
  <meta property="og:image" content="${escHtml(ogImage)}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:locale" content="es_CL"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${escHtml(title)}"/>
  <meta name="twitter:description" content="${escHtml(description)}"/>
  <meta name="twitter:image" content="${escHtml(ogImage)}"/>
</head>
<body>
  <p><a href="${escHtml(pageUrl)}">${escHtml(title)}</a></p>
  <script>window.location.replace(${JSON.stringify(pageUrl)})</script>
</body>
</html>`

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  res.status(200).send(html)
}
