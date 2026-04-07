import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { PlayerRequest, Sport, Level } from '../lib/constants'

export interface PlayerRequestWithProfile extends PlayerRequest {
  player: { id: string; name: string; phone: string | null }
}

interface FetchOptions {
  sport?: Sport | 'todos'
  level?: Level | 'todos'
}

export function usePlayerRequests() {
  const [requests, setRequests] = useState<PlayerRequestWithProfile[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchPlayerRequests({ sport, level }: FetchOptions = {}) {
    setLoading(true)
    let query = supabase
      .from('player_requests')
      .select('*, player:profiles!player_requests_user_id_fkey(id, name, phone)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (sport && sport !== 'todos') query = query.eq('sport', sport)
    if (level && level !== 'todos') query = query.eq('level', level)

    const { data } = await query
    setLoading(false)
    setRequests((data ?? []) as PlayerRequestWithProfile[])
  }

  async function createPlayerRequest(data: {
    user_id: string
    sport: Sport
    level: Level
    availability_text?: string
  }) {
    await supabase
      .from('player_requests')
      .update({ status: 'inactive' })
      .eq('user_id', data.user_id)
      .eq('sport', data.sport)
      .eq('status', 'active')

    const { error } = await supabase
      .from('player_requests')
      .insert({ ...data, status: 'active' })
    return { error }
  }

  return { requests, loading, fetchPlayerRequests, createPlayerRequest }
}
