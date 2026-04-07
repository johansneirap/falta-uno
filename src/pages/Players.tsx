import { useState, useEffect } from 'react'
import { usePlayerRequests } from '../hooks/usePlayerRequests'
import PlayerCard from '../components/player/PlayerCard'
import type { Sport, Level } from '../lib/constants'
import { LEVELS_BY_SPORT, LEVELS_GENERIC } from '../lib/constants'
import type { SportEntry } from '../components/player/PlayerCard'

type SportFilter = Sport | 'todos'
type LevelFilter = Level | 'todos'

const SPORT_TABS: { value: SportFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'padel', label: 'Pádel' },
  { value: 'futbol', label: 'Fútbol' },
  { value: 'tenis', label: 'Tenis' },
  { value: 'basket', label: 'Básket' },
]

export default function Players() {
  const { requests, loading, fetchPlayerRequests } = usePlayerRequests()
  const [sport, setSport] = useState<SportFilter>('todos')
  const [level, setLevel] = useState<LevelFilter>('todos')
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? requests.filter(r => r.player?.name?.toLowerCase().includes(search.toLowerCase()))
    : requests

  // En "Todos", agrupar por jugador mostrando todos sus deportes en una sola card
  const displayList = sport !== 'todos'
    ? filtered.map(r => ({
        id: r.id,
        name: r.player?.name ?? 'Jugador',
        phone: r.player?.phone ?? null,
        sports: [{ sport: r.sport, level: r.level, availabilityText: r.availability_text }] as SportEntry[],
      }))
    : Object.values(
        filtered.reduce((acc, r) => {
          const key = r.user_id
          if (!acc[key]) {
            acc[key] = {
              id: r.user_id,
              name: r.player?.name ?? 'Jugador',
              phone: r.player?.phone ?? null,
              sports: [],
            }
          }
          acc[key].sports.push({ sport: r.sport, level: r.level, availabilityText: r.availability_text })
          return acc
        }, {} as Record<string, { id: string; name: string; phone: string | null; sports: SportEntry[] }>)
      )

  const levelPills = [
    { value: 'todos' as LevelFilter, label: 'Todos' },
    ...(sport !== 'todos'
      ? LEVELS_BY_SPORT[sport as keyof typeof LEVELS_BY_SPORT]
      : LEVELS_GENERIC
    ),
  ]

  function handleSportChange(value: SportFilter) {
    setSport(value)
    setLevel('todos')
  }

  useEffect(() => {
    fetchPlayerRequests({ sport, level })
  }, [sport, level])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="font-display font-extrabold text-[24px] text-brutal-black">
          Jugadores Disponibles
        </h1>
      </div>

      {/* Search */}
      <div className="px-5 pb-2">
        <div className="flex items-center gap-2 bg-white border-2 border-black rounded-[10px]
                        shadow-[2px_2px_0px_0px_#000000] px-3 h-10">
          <SearchIcon />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar jugador por nombre..."
            className="flex-1 bg-transparent font-body text-[13px] text-brutal-black
                       placeholder:text-gray-400 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 text-lg leading-none">✕</button>
          )}
        </div>
      </div>

      {/* Sport tabs */}
      <div className="px-5 pt-1">
        <div className="flex h-10 border-2 border-black rounded-full overflow-hidden">
          {SPORT_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => handleSportChange(tab.value)}
              className={`flex-1 font-display text-[12px] font-semibold transition-colors
                ${sport === tab.value
                  ? 'bg-primary text-black'
                  : 'text-gray-400 hover:text-brutal-black'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Level pills */}
      <div className="flex gap-2 px-5 pt-3 pb-1 overflow-x-auto scrollbar-none">
        {levelPills.map(pill => (
          <button
            key={pill.value}
            onClick={() => setLevel(pill.value)}
            className={`flex-shrink-0 font-body text-[12px] font-semibold
                        border-2 border-black rounded-full px-3 py-1.5
                        shadow-[2px_2px_0px_0px_#000000]
                        transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
                        ${level === pill.value
                          ? 'bg-brutal-black text-white'
                          : 'bg-white text-brutal-black'}`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Players list */}
      <div className="flex flex-col gap-3 px-5 pt-3 pb-4 overflow-y-auto flex-1">
        {loading && (
          <div className="flex justify-center pt-12">
            <svg className="animate-spin text-primary" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {!loading && displayList.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-16 text-center">
            <span className="text-5xl">🙋</span>
            <p className="font-display font-bold text-[16px] text-brutal-black">
              {search ? 'Sin resultados para esa búsqueda' : 'No hay jugadores disponibles'}
            </p>
            {!search && (
              <p className="font-body text-[13px] text-gray-400">
                Publica tu disponibilidad desde tu perfil
              </p>
            )}
          </div>
        )}

        {!loading && displayList.map(item => (
          <PlayerCard
            key={item.id}
            name={item.name}
            phone={item.phone}
            sports={item.sports}
          />
        ))}
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 flex-shrink-0">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  )
}
