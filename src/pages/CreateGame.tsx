import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useGames } from '../hooks/useGames'
import { SPORTS, FORMATS, DEFAULT_SLOTS, LEVELS_BY_SPORT, LEVELS_GENERIC } from '../lib/constants'
import { supabase } from '../lib/supabase'
import type { Sport, Level, GameFormat } from '../lib/constants'
import LocationPicker from '../components/ui/LocationPicker'
import { track } from '../lib/analytics'

export default function CreateGame() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createGame } = useGames()

  const [sport, setSport] = useState<Sport | ''>('')
  const [format, setFormat] = useState<GameFormat | ''>('')
  const [location, setLocation] = useState('')
  const [datetime, setDatetime] = useState('')
  const [slots, setSlots] = useState('')
  const [level, setLevel] = useState<Level | ''>('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeGamesCount, setActiveGamesCount] = useState(0)

  useEffect(() => {
    if (!user) return
    supabase
      .from('games')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', user.id)
      .in('status', ['open', 'full'])
      .gt('datetime', new Date().toISOString())
      .then(({ count }) => setActiveGamesCount(count ?? 0))
  }, [user])

  const formatOptions = sport ? FORMATS[sport as keyof typeof FORMATS] : []
  const levelOptions = sport ? LEVELS_BY_SPORT[sport as keyof typeof LEVELS_BY_SPORT] : LEVELS_GENERIC

  function handleSportChange(value: Sport) {
    setSport(value)
    setFormat('')
    setSlots('')
    setLevel('')
  }

  function handleFormatChange(value: GameFormat) {
    setFormat(value)
    const defaultSlots = DEFAULT_SLOTS[value]
    if (defaultSlots) setSlots(String(Math.max(1, defaultSlots - 1)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !sport || !format || !level) return
    if (new Date(datetime) <= new Date()) {
      setError('La fecha debe ser en el futuro')
      return
    }
    const slotsNum = parseInt(slots)
    if (!slotsNum || slotsNum <= 0) {
      setError('Los cupos deben ser mayor a 0')
      return
    }

    setLoading(true)
    setError(null)
    const slotsTotal = DEFAULT_SLOTS[format as GameFormat] ?? slotsNum
    const { error } = await createGame({
      created_by: user.id,
      sport: sport as Sport,
      format: format as GameFormat,
      level_required: level as Level,
      datetime: new Date(datetime).toISOString(),
      location_text: location,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      slots_total: slotsTotal,
      slots_available: slotsNum,
    })
    setLoading(false)

    if (error) {
      setError('Error al crear el partido. Intenta nuevamente.')
    } else {
      track('game_created', user.id, { sport, format, has_coords: !!coords })
      navigate('/')
    }
  }

  const minDatetime = toLocalDatetimeString(new Date(Date.now() + 30 * 60 * 1000))

  return (
    <div className="flex flex-col h-full">
      {showMap && (
        <LocationPicker
          initialCoords={coords ?? undefined}
          onConfirm={c => { setCoords(c); setShowMap(false) }}
          onClose={() => setShowMap(false)}
        />
      )}
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black rounded-full
                     shadow-[2px_2px_0px_0px_#000000] transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="font-display font-extrabold text-[24px] text-brutal-black">Crear Partido</h1>
      </div>

      {/* Active games warning */}
      {activeGamesCount > 0 && (
        <div className="mx-5 mb-1 flex items-start gap-2.5 bg-yellow-50 border-2 border-yellow-400 rounded-[10px] px-4 py-3">
          <span className="text-[18px] flex-shrink-0">⚠️</span>
          <p className="font-body text-[12px] text-yellow-800">
            Ya tienes <strong>{activeGamesCount} partido{activeGamesCount > 1 ? 's' : ''} abierto{activeGamesCount > 1 ? 's' : ''}</strong>.
            Crea uno nuevo solo si realmente lo necesitas.
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 pt-2 pb-6 overflow-y-auto flex-1">

        {/* Deporte */}
        <div className="flex flex-col gap-1.5">
          <label className="font-body font-medium text-sm text-brutal-black">Deporte</label>
          <select
            value={sport}
            onChange={e => handleSportChange(e.target.value as Sport)}
            required
            className="w-full h-11 px-3 border-2 border-black rounded-[10px] bg-white font-body text-brutal-black
                       focus:outline-none focus:ring-2 focus:ring-primary shadow-[3px_3px_0px_0px_#000000] appearance-none"
          >
            <option value="">Seleccionar deporte</option>
            {SPORTS.map(s => (
              <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>
            ))}
          </select>
        </div>

        {/* Formato */}
        <div className="flex flex-col gap-1.5">
          <label className="font-body font-medium text-sm text-brutal-black">Formato</label>
          <select
            value={format}
            onChange={e => handleFormatChange(e.target.value as GameFormat)}
            required
            disabled={!sport}
            className="w-full h-11 px-3 border-2 border-black rounded-[10px] bg-white font-body text-brutal-black
                       focus:outline-none focus:ring-2 focus:ring-primary shadow-[3px_3px_0px_0px_#000000] appearance-none
                       disabled:opacity-50"
          >
            <option value="">Ej: Dobles, 5v5, 7v7</option>
            {formatOptions.map((f: { value: string; label: string }) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Ubicación */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-body font-medium text-sm text-brutal-black">Ubicación</label>
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="flex items-center gap-1 font-body text-[12px] font-medium text-primary"
            >
              <PinIcon />
              {coords ? '✓ Ubicación en mapa' : 'Marcar en mapa'}
            </button>
          </div>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Nombre de la cancha"
            required
            className="w-full h-11 px-3 border-2 border-black rounded-[10px] bg-white font-body text-brutal-black
                       placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary
                       shadow-[3px_3px_0px_0px_#000000]"
          />
        </div>

        {/* Fecha y Hora */}
        <div className="flex flex-col gap-1.5">
          <label className="font-body font-medium text-sm text-brutal-black">Fecha y Hora</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={e => setDatetime(e.target.value)}
            min={minDatetime}
            required
            className="w-full h-11 px-3 border-2 border-black rounded-[10px] bg-white font-body text-brutal-black
                       focus:outline-none focus:ring-2 focus:ring-primary shadow-[3px_3px_0px_0px_#000000]"
          />
        </div>

        {/* Cupos */}
        <div className="flex flex-col gap-1.5">
          <label className="font-body font-medium text-sm text-brutal-black">Cupos faltantes</label>
          <input
            type="number"
            value={slots}
            onChange={e => setSlots(e.target.value)}
            placeholder="Ej: 2"
            min={1}
            max={30}
            required
            className="w-full h-11 px-3 border-2 border-black rounded-[10px] bg-white font-body text-brutal-black
                       placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary
                       shadow-[3px_3px_0px_0px_#000000]"
          />
        </div>

        {/* Nivel */}
        <div className="flex flex-col gap-1.5">
          <label className="font-body font-medium text-sm text-brutal-black">Nivel requerido</label>
          <select
            value={level}
            onChange={e => setLevel(e.target.value as Level)}
            required
            className="w-full h-11 px-3 border-2 border-black rounded-[10px] bg-white font-body text-brutal-black
                       focus:outline-none focus:ring-2 focus:ring-primary shadow-[3px_3px_0px_0px_#000000] appearance-none"
          >
            <option value="">Seleccionar nivel</option>
            {[...levelOptions].map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {error && (
          <p className="font-body text-[13px] text-danger">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 flex items-center justify-center
                     bg-primary border-2 border-black rounded-full
                     shadow-[4px_4px_0px_0px_#000000]
                     font-display font-bold text-[16px] text-black
                     transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:active:shadow-[4px_4px_0px_0px_#000000]
                     disabled:active:translate-x-0 disabled:active:translate-y-0 mt-2"
        >
          {loading ? (
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          ) : 'Publicar Partido'}
        </button>
      </form>
    </div>
  )
}

function toLocalDatetimeString(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}
function PinIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}
