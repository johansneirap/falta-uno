import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Game, Sport, Level } from '../lib/constants'

interface FetchGamesOptions {
  sport?: Sport | 'todos'
  level?: Level | 'todos'
}

export function useGames() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchGames({ sport, level }: FetchGamesOptions = {}) {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('games')
      .select('*')
      .eq('status', 'open')
      .gt('datetime', new Date().toISOString())
      .order('datetime', { ascending: true })

    if (sport && sport !== 'todos') query = query.eq('sport', sport)
    if (level && level !== 'todos') query = query.eq('level_required', level)

    const { data, error } = await query
    setLoading(false)
    if (error) {
      setError('Error al cargar partidos')
    } else {
      setGames((data ?? []) as Game[])
    }
  }

  async function createGame(game: Omit<Game, 'id' | 'created_at' | 'status' | 'slots_available'>) {
    const { data, error } = await supabase
      .from('games')
      .insert({ ...game, status: 'open', slots_available: game.slots_total })
      .select()
      .single()
    return { data: data as Game | null, error }
  }

  return { games, loading, error, fetchGames, createGame }
}
