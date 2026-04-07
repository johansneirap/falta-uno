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
  const [joinedGameIds, setJoinedGameIds] = useState<Set<string>>(new Set())

  async function fetchGames({ sport, level }: FetchGamesOptions = {}) {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('games')
      .select('*')
      .in('status', ['open', 'full'])
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

  async function createGame(game: Omit<Game, 'id' | 'created_at' | 'status'>) {
    const { data, error } = await supabase
      .from('games')
      .insert({ ...game, status: 'open' })
      .select()
      .single()
    return { data: data as Game | null, error }
  }

  async function fetchJoinedGameIds(userId: string) {
    const { data } = await supabase
      .from('game_joins')
      .select('game_id')
      .eq('user_id', userId)
    setJoinedGameIds(new Set((data ?? []).map((r: { game_id: string }) => r.game_id)))
  }

  async function cancelGame(gameId: string) {
    const { error } = await supabase
      .from('games')
      .update({ status: 'cancelled' })
      .eq('id', gameId)
    return { error }
  }

  async function completeGame(gameId: string) {
    const { error } = await supabase
      .from('games')
      .update({ status: 'completed' })
      .eq('id', gameId)
    return { error }
  }

  return { games, loading, error, joinedGameIds, fetchGames, fetchJoinedGameIds, createGame, cancelGame, completeGame }
}
