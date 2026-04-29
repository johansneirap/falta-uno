import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ACHIEVEMENTS, type AchievementWithStatus } from '../lib/achievements'

export function useAchievements(userId: string | undefined) {
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)

      const [joinsRes, createdRes, futbolJoinsRes] = await Promise.all([
        supabase
          .from('game_joins')
          .select('id')
          .eq('user_id', userId),
        supabase
          .from('games')
          .select('id')
          .eq('created_by', userId),
        supabase
          .from('game_joins')
          .select('game_id, games!inner(sport)')
          .eq('user_id', userId)
          .eq('games.sport', 'futbol'),
      ])

      const totalJoins = joinsRes.data?.length ?? 0
      const totalCreated = createdRes.data?.length ?? 0
      const futbolJoins = futbolJoinsRes.data?.length ?? 0

      const result: AchievementWithStatus[] = ACHIEVEMENTS.map(a => {
        switch (a.id) {
          case 'primer_partido':
            return { ...a, unlocked: totalJoins >= 1, progress: { current: Math.min(totalJoins, 1), total: 1 } }
          case 'organizador':
            return { ...a, unlocked: totalCreated >= 1, progress: { current: Math.min(totalCreated, 1), total: 1 } }
          case 'jugador_social':
            return { ...a, unlocked: totalJoins >= 3, progress: { current: Math.min(totalJoins, 3), total: 3 } }
          case 'hat_trick':
            return { ...a, unlocked: futbolJoins >= 3, progress: { current: Math.min(futbolJoins, 3), total: 3 } }
          case 'fijo_del_grupo':
            return { ...a, unlocked: totalJoins >= 10, progress: { current: Math.min(totalJoins, 10), total: 10 } }
          case 'mvp':
            return {
              ...a,
              unlocked: totalCreated >= 5 && totalJoins >= 5,
              progress: {
                current: Math.min(totalCreated, 5) + Math.min(totalJoins, 5),
                total: 10,
              },
            }
          default:
            return { ...a, unlocked: false, progress: { current: 0, total: 1 } }
        }
      })

      setAchievements(result)
      setLoading(false)
    }

    load()
  }, [userId])

  return { achievements, loading }
}
