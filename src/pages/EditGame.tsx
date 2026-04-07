import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import type { Game } from '../lib/constants'

export default function EditGame() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState('')
  const [datetime, setDatetime] = useState('')
  const [slots, setSlots] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        const g = data as Game | null
        setGame(g)
        if (g) {
          setLocation(g.location_text)
          // datetime-local necesita formato "YYYY-MM-DDTHH:MM"
          setDatetime(new Date(g.datetime).toISOString().slice(0, 16))
          setSlots(String(g.slots_available))
        }
        setLoading(false)
      })
  }, [id])

  // Redirigir si el usuario no es el organizador
  useEffect(() => {
    if (!loading && game && game.created_by !== user?.id) {
      navigate(`/partido/${id}`, { replace: true })
    }
  }, [loading, game, user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!game) return
    if (new Date(datetime) <= new Date()) {
      setError('La fecha debe ser en el futuro')
      return
    }
    const slotsNum = parseInt(slots)
    if (!slotsNum || slotsNum <= 0) {
      setError('Los cupos deben ser mayor a 0')
      return
    }

    setSaving(true)
    setError(null)
    const { error: updateError } = await supabase
      .from('games')
      .update({
        location_text: location.trim(),
        datetime: new Date(datetime).toISOString(),
        slots_available: slotsNum,
        // Si hay cupos disponibles, el partido pasa a 'open' (por si estaba full)
        status: slotsNum > 0 ? 'open' : 'full',
      })
      .eq('id', game.id)
    setSaving(false)

    if (updateError) {
      setError('Error al guardar. Intenta nuevamente.')
    } else {
      navigate(`/partido/${game.id}`)
    }
  }

  const minDatetime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)

  if (loading) {
    return (
      <div className="app-container flex items-center justify-center min-h-screen bg-cream">
        <svg className="animate-spin text-primary" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  if (!game) return null

  return (
    <div className="app-container flex flex-col bg-cream min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black rounded-full
                     shadow-[2px_2px_0px_0px_#000000] transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="font-display font-extrabold text-[22px] text-brutal-black">Editar Partido</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 pt-2 pb-10 overflow-y-auto flex-1">

        {/* Ubicación */}
        <div className="flex flex-col gap-1.5">
          <label className="font-body font-medium text-sm text-brutal-black">Ubicación</label>
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
            min={1}
            max={30}
            required
            className="w-full h-11 px-3 border-2 border-black rounded-[10px] bg-white font-body text-brutal-black
                       placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary
                       shadow-[3px_3px_0px_0px_#000000]"
          />
        </div>

        {error && (
          <p className="font-body text-[13px] text-danger">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full h-12 flex items-center justify-center
                     bg-primary border-2 border-black rounded-full
                     shadow-[4px_4px_0px_0px_#000000]
                     font-display font-bold text-[16px] text-black
                     transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:active:shadow-[4px_4px_0px_0px_#000000]
                     disabled:active:translate-x-0 disabled:active:translate-y-0 mt-2"
        >
          {saving ? (
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          ) : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}
