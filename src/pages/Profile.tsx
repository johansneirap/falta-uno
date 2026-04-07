import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { usePlayerRequests } from '../hooks/usePlayerRequests'
import Avatar from '../components/ui/Avatar'
import { supabase } from '../lib/supabase'
import type { Sport, Level } from '../lib/constants'
import { LEVELS_BY_SPORT, LEVEL_LABEL_MAP, LEVEL_COLOR_MAP } from '../lib/constants'

const SPORTS_CONFIG = [
  { key: 'padel', levelKey: 'padel_level', label: 'Pádel', emoji: '🎾' },
  { key: 'futbol', levelKey: 'soccer_level', label: 'Fútbol', emoji: '⚽' },
  { key: 'tenis', levelKey: 'tenis_level', label: 'Tenis', emoji: '🎾' },
  { key: 'basket', levelKey: 'basket_level', label: 'Básket', emoji: '🏀' },
] as const


const SPORTS_OPTIONS: { value: Sport; label: string }[] = [
  { value: 'padel', label: 'Pádel' },
  { value: 'futbol', label: 'Fútbol' },
  { value: 'tenis', label: 'Tenis' },
  { value: 'basket', label: 'Básket' },
]

export default function Profile() {
  const { user, signOut } = useAuth()
  const { profile, stats, loading, fetchProfile, upsertProfile } = useProfile()
  const { createPlayerRequest, deactivateRequest } = usePlayerRequests()

  // Onboarding / edit mode
  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [sportLevels, setSportLevels] = useState<Record<string, Level | ''>>({
    padel_level: '', soccer_level: '', tenis_level: '', basket_level: '',
  })
  const [saving, setSaving] = useState(false)

  // Quiero jugar form
  const [showQuieroForm, setShowQuieroForm] = useState(false)
  const [qSport, setQSport] = useState<Sport>('padel')
  const [qLevel, setQLevel] = useState<Level>('intermedio')
  const [qAvailability, setQAvailability] = useState('')
  const [qSaving, setQSaving] = useState(false)
  const [qSuccess, setQSuccess] = useState(false)

  // Disponibilidades activas del usuario
  const [myRequests, setMyRequests] = useState<{ id: string; sport: Sport; level: Level; availability_text: string | null }[]>([])

  // Historial de partidos
  type HistoryGame = { id: string; sport: string; format: string; location_text: string; datetime: string; status: string; role: 'organizador' | 'jugador' }
  const [history, setHistory] = useState<HistoryGame[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchProfile(user.id)
    supabase
      .from('player_requests')
      .select('id, sport, level, availability_text')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .then(({ data }) => setMyRequests((data ?? []) as typeof myRequests))
  }, [user])

  async function loadHistory() {
    if (!user || historyLoading) return
    setHistoryLoading(true)
    const now = new Date().toISOString()

    const [organizedRes, joinedRes] = await Promise.all([
      supabase
        .from('games')
        .select('id, sport, format, location_text, datetime, status')
        .eq('created_by', user.id)
        .or(`datetime.lt.${now},status.in.(completed,cancelled)`)
        .order('datetime', { ascending: false })
        .limit(30),
      supabase
        .from('game_joins')
        .select('game:games(id, sport, format, location_text, datetime, status, created_by)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30),
    ])

    const organized: HistoryGame[] = (organizedRes.data ?? []).map((g: any) => ({ ...g, role: 'organizador' as const }))
    const organizedIds = new Set(organized.map(g => g.id))

    const joined: HistoryGame[] = (joinedRes.data ?? [])
      .map((j: any) => j.game)
      .filter((g: any) => g && !organizedIds.has(g.id) && (new Date(g.datetime) < new Date() || ['completed', 'cancelled'].includes(g.status)))
      .map((g: any) => ({ ...g, role: 'jugador' as const }))

    const all = [...organized, ...joined].sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    )

    setHistory(all)
    setHistoryLoading(false)
    setShowHistory(true)
  }

  useEffect(() => {
    if (loading) return
    if (!profile) {
      setEditMode(true)
      return
    }
    setName(profile.name ?? '')
    setPhone(profile.phone ?? '')
    setSportLevels({
      padel_level: profile.padel_level ?? '',
      soccer_level: profile.soccer_level ?? '',
      tenis_level: profile.tenis_level ?? '',
      basket_level: profile.basket_level ?? '',
    })
  }, [profile, loading])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !name.trim()) return
    setSaving(true)
    await upsertProfile(user.id, {
      name: name.trim(),
      phone: phone.trim(),
      email: user.email,
      padel_level: (sportLevels.padel_level as Level) || null,
      soccer_level: (sportLevels.soccer_level as Level) || null,
      tenis_level: (sportLevels.tenis_level as Level) || null,
      basket_level: (sportLevels.basket_level as Level) || null,
    })
    setSaving(false)
    setEditMode(false)
  }

  async function handleQuieroJugar(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setQSaving(true)
    const { error } = await createPlayerRequest({
      user_id: user.id,
      sport: qSport,
      level: qLevel,
      availability_text: qAvailability.trim() || undefined,
    })
    setQSaving(false)
    if (!error) {
      setQSuccess(true)
      // Refrescar lista de disponibilidades
      if (user) {
        supabase
          .from('player_requests')
          .select('id, sport, level, availability_text')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .then(({ data }) => setMyRequests((data ?? []) as typeof myRequests))
      }
      setTimeout(() => { setShowQuieroForm(false); setQSuccess(false) }, 1500)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 pt-20">
        <svg className="animate-spin text-primary" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  // ── Onboarding / Edit mode ──────────────────────────────────────────────────
  if (editMode) {
    return (
      <div className="flex flex-col px-5 pt-4 pb-6 gap-6 overflow-y-auto flex-1">
        <h1 className="font-display font-extrabold text-[24px] text-brutal-black">
          {profile ? 'Editar Perfil' : '¡Bienvenido!'}
        </h1>
        {!profile && (
          <p className="font-body text-[14px] text-gray-500 -mt-4">
            Completa tu perfil para empezar a jugar.
          </p>
        )}
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-body font-medium text-sm text-brutal-black">Nombre</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Tu nombre completo"
              required
              className="w-full h-11 px-3 border-2 border-black rounded-[10px] bg-white font-body
                         text-brutal-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary
                         shadow-[3px_3px_0px_0px_#000000]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body font-medium text-sm text-brutal-black">
              Teléfono <span className="text-gray-400">(para WhatsApp)</span>
            </label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+56 9 1234 5678"
              type="tel"
              className="w-full h-11 px-3 border-2 border-black rounded-[10px] bg-white font-body
                         text-brutal-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary
                         shadow-[3px_3px_0px_0px_#000000]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body font-medium text-sm text-brutal-black">Mis Deportes y Nivel</label>
            <div className="flex flex-col gap-2">
              {SPORTS_CONFIG.map(s => (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="text-[18px] w-6 flex-shrink-0">{s.emoji}</span>
                  <span className="font-body text-[13px] text-brutal-black w-14 flex-shrink-0">{s.label}</span>
                  <select
                    value={sportLevels[s.levelKey]}
                    onChange={e => setSportLevels(prev => ({ ...prev, [s.levelKey]: e.target.value as Level | '' }))}
                    className="flex-1 h-10 px-3 border-2 border-black rounded-[10px] bg-white font-body text-brutal-black
                               text-[13px] focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                  >
                    <option value="">Sin nivel</option>
                    {LEVELS_BY_SPORT[s.key as keyof typeof LEVELS_BY_SPORT].map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 flex items-center justify-center
                       bg-primary border-2 border-black rounded-full shadow-[4px_4px_0px_0px_#000000]
                       font-display font-bold text-[16px] text-black mt-2
                       transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
                       disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          {profile && (
            <button type="button" onClick={() => setEditMode(false)}
              className="font-body text-[13px] text-gray-400 text-center">
              Cancelar
            </button>
          )}
        </form>
      </div>
    )
  }

  const displayName = profile?.name ?? user?.email ?? '?'
  const activeSports = SPORTS_CONFIG.filter(s => {
    const lvl = profile?.[s.levelKey as keyof typeof profile]
    return !!lvl
  })

  // ── Profile view ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 px-5 pt-4 pb-6 overflow-y-auto flex-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-[18px] text-brutal-black">Mi Perfil</h1>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 bg-secondary border-2 border-black rounded-full px-3 py-1.5
                     font-display font-semibold text-[12px] text-black
                     shadow-[2px_2px_0px_0px_#000000] transition-all active:shadow-none"
        >
          <LogOutIcon />
          Salir
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-white border-[2.5px] border-black rounded-[14px] shadow-brutal px-5 py-7 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-primary border-[3px] border-black flex items-center justify-center">
            <span className="font-display font-extrabold text-[28px] text-black">
              {displayName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
            </span>
          </div>
          <span className="font-display font-bold text-[22px] text-brutal-black">{displayName}</span>
        </div>
        {profile?.phone && (
          <div className="flex items-center gap-2">
            <PhoneIcon />
            <span className="font-body text-[14px] font-medium text-gray-500">{profile.phone}</span>
          </div>
        )}
        {(profile?.email ?? user?.email) && (
          <div className="flex items-center gap-2">
            <MailIcon />
            <span className="font-body text-[14px] font-medium text-gray-500">
              {profile?.email ?? user?.email}
            </span>
          </div>
        )}
        <button onClick={() => setEditMode(true)}
          className="font-body text-[13px] text-primary font-medium self-end">
          Editar perfil
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        {[
          { num: stats.gamesCreated + stats.gamesJoined, label: 'Partidos' },
          { num: stats.gamesCreated, label: 'Creados' },
          { num: stats.gamesJoined, label: 'Unidos' },
        ].map(({ num, label }) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1 bg-white border-[2.5px] border-black
                                      rounded-[12px] shadow-[3px_3px_0px_0px_#000000] py-4">
            <span className="font-display font-extrabold text-[28px] text-primary">{num}</span>
            <span className="font-body font-semibold text-[11px] text-gray-400 tracking-[0.5px] uppercase">{label}</span>
          </div>
        ))}
      </div>

      {/* Mis Deportes */}
      {activeSports.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="font-display font-bold text-[16px] text-brutal-black">Mis Deportes</span>
          {activeSports.map(s => {
            const lvl = profile?.[s.levelKey as keyof typeof profile] as string
            return (
              <div key={s.key} className="flex items-center gap-3 bg-white border-[2.5px] border-black
                                           rounded-[12px] shadow-[3px_3px_0px_0px_#000000] px-4 py-3.5">
                <span className="text-[24px]">{s.emoji}</span>
                <div className="flex flex-col flex-1">
                  <span className="font-display font-bold text-[14px] text-brutal-black">{s.label}</span>
                </div>
                <span className={`text-[11px] font-display font-bold border-2 border-black rounded-full px-2.5 py-1 ${LEVEL_COLOR_MAP[lvl] ?? 'bg-gray-100 text-gray-800'}`}>
                  {LEVEL_LABEL_MAP[lvl] ?? lvl}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Mi disponibilidad activa */}
      {myRequests.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="font-display font-bold text-[16px] text-brutal-black">Mi disponibilidad</span>
          {myRequests.map(req => (
            <div key={req.id} className="flex items-center gap-3 bg-white border-[2.5px] border-black
                                         rounded-[12px] shadow-[3px_3px_0px_0px_#000000] px-4 py-3">
              <div className="flex flex-col flex-1 gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-[13px] text-brutal-black">
                    {{padel:'🎾 Pádel',futbol:'⚽ Fútbol',tenis:'🎾 Tenis',basket:'🏀 Básket'}[req.sport]}
                  </span>
                  <span className={`text-[11px] font-display font-bold border-[1.5px] border-black rounded-full px-2 py-0.5 ${LEVEL_COLOR_MAP[req.level] ?? 'bg-gray-100 text-gray-800'}`}>
                    {LEVEL_LABEL_MAP[req.level] ?? req.level}
                  </span>
                </div>
                {req.availability_text && (
                  <span className="font-body text-[11px] text-gray-400 truncate">{req.availability_text}</span>
                )}
              </div>
              <button
                onClick={async () => {
                  await deactivateRequest(req.id)
                  setMyRequests(prev => prev.filter(r => r.id !== req.id))
                }}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center
                           bg-danger/10 border-[1.5px] border-danger rounded-full
                           text-danger font-bold text-[16px] leading-none
                           transition-all active:opacity-70"
                title="Quitar disponibilidad"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quiero jugar button / form */}
      {!showQuieroForm ? (
        <button
          onClick={() => setShowQuieroForm(true)}
          className="w-full h-[52px] flex items-center justify-center gap-2
                     bg-primary border-[2.5px] border-black rounded-[14px]
                     shadow-[4px_4px_0px_0px_#000000]
                     font-display font-extrabold text-[16px] tracking-[0.5px] text-black
                     transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
        >
          🤝 ¡QUIERO JUGAR!
        </button>
      ) : (
        <div className="bg-white border-[2.5px] border-black rounded-[14px] shadow-brutal p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-[16px] text-brutal-black">Publicar disponibilidad</span>
            <button onClick={() => setShowQuieroForm(false)} className="text-gray-400 text-xl">✕</button>
          </div>
          {qSuccess ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <span className="text-4xl">✅</span>
              <span className="font-display font-bold text-brutal-black">¡Publicado!</span>
            </div>
          ) : (
            <form onSubmit={handleQuieroJugar} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-body font-medium text-sm text-brutal-black">Deporte</label>
                <select value={qSport} onChange={e => { setQSport(e.target.value as Sport); setQLevel(LEVELS_BY_SPORT[e.target.value as Sport][0].value) }}
                  className="w-full h-11 px-3 border-2 border-black rounded-[10px] bg-white font-body text-brutal-black
                             focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
                  {SPORTS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body font-medium text-sm text-brutal-black">Tu nivel</label>
                <select value={qLevel} onChange={e => setQLevel(e.target.value as Level)}
                  className="w-full h-11 px-3 border-2 border-black rounded-[10px] bg-white font-body text-brutal-black
                             focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
                  {LEVELS_BY_SPORT[qSport].map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body font-medium text-sm text-brutal-black">Disponibilidad</label>
                <input
                  value={qAvailability}
                  onChange={e => setQAvailability(e.target.value)}
                  placeholder="Ej: Disponible fines de semana"
                  className="w-full h-11 px-3 border-2 border-black rounded-[10px] bg-white font-body
                             text-brutal-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button type="submit" disabled={qSaving}
                className="w-full h-11 bg-primary border-2 border-black rounded-full
                           font-display font-bold text-[14px] text-black shadow-[3px_3px_0px_0px_#000000]
                           transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px]
                           disabled:opacity-50">
                {qSaving ? 'Publicando...' : 'Publicar'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Historial */}
      <div className="flex flex-col gap-3">
        <button
          onClick={showHistory ? () => setShowHistory(false) : loadHistory}
          className="w-full flex items-center justify-between px-4 py-3
                     bg-white border-[2.5px] border-black rounded-[12px]
                     shadow-[3px_3px_0px_0px_#000000]
                     transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
        >
          <span className="font-display font-bold text-[15px] text-brutal-black">📋 Historial de partidos</span>
          <span className="font-body text-[13px] text-gray-400">{showHistory ? '▲' : '▼'}</span>
        </button>

        {showHistory && (
          <div className="flex flex-col gap-2">
            {historyLoading && (
              <div className="flex justify-center py-6">
                <svg className="animate-spin text-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
              </div>
            )}
            {!historyLoading && history.length === 0 && (
              <p className="font-body text-[13px] text-gray-400 text-center py-4">
                Aún no tienes partidos en el historial.
              </p>
            )}
            {!historyLoading && history.map(g => (
              <div key={g.id + g.role}
                   className="bg-white border-2 border-black rounded-[10px] px-4 py-3 flex items-center gap-3">
                <span className="text-[20px] flex-shrink-0">
                  {{ padel:'🎾', futbol:'⚽', tenis:'🎾', basket:'🏀' }[g.sport] ?? '🏅'}
                </span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-display font-bold text-[13px] text-brutal-black truncate">
                    {g.location_text}
                  </span>
                  <span className="font-body text-[11px] text-gray-400">
                    {new Date(g.datetime).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <span className={`text-[10px] font-display font-bold border-[1.5px] border-black rounded-full px-2 py-0.5 flex-shrink-0
                  ${g.role === 'organizador' ? 'bg-primary/20 text-brutal-black' : 'bg-secondary/20 text-brutal-black'}`}>
                  {g.role === 'organizador' ? 'Org.' : 'Jugador'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

function LogOutIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}
function PhoneIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 flex-shrink-0">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .9h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.75a16 16 0 006.29 6.29l1.13-1.16a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  )
}
function MailIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 flex-shrink-0">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  )
}
