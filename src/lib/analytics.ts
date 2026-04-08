import { supabase } from './supabase'

type EventName =
  | 'game_created'
  | 'game_joined'
  | 'game_left'
  | 'game_completed'
  | 'game_cancelled'
  | 'availability_posted'
  | 'profile_updated'
  | 'share_tapped'

export function track(
  event: EventName,
  userId: string | undefined,
  properties?: Record<string, unknown>
) {
  // Fire and forget — nunca bloquea el flujo
  supabase.from('analytics_events').insert({
    user_id: userId ?? null,
    event,
    properties: properties ?? null,
  })
}
