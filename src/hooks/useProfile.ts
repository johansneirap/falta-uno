import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/constants'

interface ProfileStats {
  gamesCreated: number
  gamesJoined: number
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<ProfileStats>({ gamesCreated: 0, gamesJoined: 0 })
  const [loading, setLoading] = useState(false)

  async function fetchProfile(userId: string) {
    setLoading(true)
    const [profileRes, createdRes, joinedRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('games').select('*', { count: 'exact', head: true }).eq('created_by', userId),
      supabase.from('game_joins').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    ])
    setLoading(false)
    setProfile((profileRes.data as Profile) ?? null)
    setStats({
      gamesCreated: createdRes.count ?? 0,
      gamesJoined: joinedRes.count ?? 0,
    })
  }

  async function upsertProfile(userId: string, data: Partial<Omit<Profile, 'id' | 'created_at'>>) {
    const { data: updated, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...data })
      .select()
      .single()
    if (!error) setProfile(updated as Profile)
    return { error }
  }

  return { profile, stats, loading, fetchProfile, upsertProfile }
}
