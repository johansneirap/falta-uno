import { useState, useEffect } from 'react'
import { useGames } from '../hooks/useGames'
import GameCard from '../components/game/GameCard'
import type { Sport, Level } from '../lib/constants'
import { LEVELS_BY_SPORT, LEVELS_GENERIC } from '../lib/constants'

type SportFilter = Sport | 'todos'
type LevelFilter = Level | 'todos'

const SPORT_TABS: { value: SportFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'padel', label: 'Pádel' },
  { value: 'futbol', label: 'Fútbol' },
  { value: 'tenis', label: 'Tenis' },
  { value: 'basket', label: 'Básket' },
]

export default function Home() {
  const { games, loading, fetchGames } = useGames()
  const [sport, setSport] = useState<SportFilter>('todos')
  const [level, setLevel] = useState<LevelFilter>('todos')

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
    fetchGames({ sport, level })
  }, [sport, level])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h1 className="font-display font-extrabold text-[28px] text-brutal-black">FALTA 1</h1>
        <BellIcon />
      </div>

      {/* Sport tabs */}
      <div className="px-5 pt-1">
        <div className="flex h-10 border-2 border-black rounded-full overflow-hidden">
          {SPORT_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => handleSportChange(tab.value)}
              className={`flex-1 font-display text-[13px] font-semibold transition-colors
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

      {/* Cards list */}
      <div className="flex flex-col gap-3 px-5 pt-3 pb-4 overflow-y-auto flex-1">
        {loading && (
          <div className="flex justify-center pt-12">
            <svg className="animate-spin text-primary" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {!loading && games.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-16 text-center">
            <span className="text-5xl">🏟️</span>
            <p className="font-display font-bold text-[16px] text-brutal-black">
              No hay partidos disponibles
            </p>
            <p className="font-body text-[13px] text-gray-400">
              ¡Sé el primero en crear uno!
            </p>
          </div>
        )}

        {!loading && games.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}

function BellIcon() {
  return (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-brutal-black">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}
