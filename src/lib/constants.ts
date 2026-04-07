export const SPORTS = [
  { value: 'padel', label: 'Pádel', emoji: '🎾' },
  { value: 'futbol', label: 'Fútbol', emoji: '⚽' },
  { value: 'tenis', label: 'Tenis', emoji: '🎾' },
  { value: 'basket', label: 'Básket', emoji: '🏀' },
] as const

export const LEVELS = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
] as const

export const FORMATS = {
  padel: [
    { value: 'dobles', label: 'Dobles (4 jugadores)' },
    { value: 'singles', label: 'Singles (2 jugadores)' },
  ],
  futbol: [
    { value: '5v5', label: '5 vs 5 (10 jugadores)' },
    { value: '7v7', label: '7 vs 7 (14 jugadores)' },
    { value: '11v11', label: '11 vs 11 (22 jugadores)' },
  ],
  tenis: [
    { value: 'singles', label: 'Singles (2 jugadores)' },
    { value: 'dobles', label: 'Dobles (4 jugadores)' },
  ],
  basket: [
    { value: '3v3', label: '3 vs 3 (6 jugadores)' },
    { value: '5v5', label: '5 vs 5 (10 jugadores)' },
  ],
} as const

export const DEFAULT_SLOTS: Record<string, number> = {
  dobles: 4,
  singles: 2,
  '5v5': 10,
  '7v7': 14,
  '11v11': 22,
  '3v3': 6,
}

// ─── Tipos primitivos ─────────────────────────────────────────────────────────

export type Sport = 'padel' | 'futbol' | 'tenis' | 'basket'
export type Level = 'principiante' | 'intermedio' | 'avanzado'
export type GameStatus = 'open' | 'full' | 'cancelled'
export type PlayerRequestStatus = 'active' | 'inactive'
export type PadelFormat = 'dobles' | 'singles'
export type TenisFormat = 'singles' | 'dobles'
export type FutbolFormat = '5v5' | '7v7' | '11v11'
export type BasketFormat = '3v3' | '5v5'
export type GameFormat = PadelFormat | FutbolFormat | BasketFormat

// ─── Constantes tipadas ───────────────────────────────────────────────────────

export const LEVEL_COLORS: Record<Level, string> = {
  principiante: 'bg-blue-100 text-blue-800',
  intermedio: 'bg-yellow-100 text-yellow-800',
  avanzado: 'bg-red-100 text-red-800',
}

export const GAME_STATUS: Record<GameStatus, string> = {
  open: 'Abierto',
  full: 'Completo',
  cancelled: 'Cancelado',
}

// ─── Tipos de base de datos ───────────────────────────────────────────────────

export interface Profile {
  id: string
  name: string
  phone: string | null
  email: string | null
  padel_level: Level | null
  soccer_level: Level | null
  tenis_level: Level | null
  basket_level: Level | null
  created_at: string
}

export interface Game {
  id: string
  created_by: string
  sport: Sport
  format: GameFormat
  level_required: Level
  datetime: string
  location_text: string
  lat: number | null
  lng: number | null
  slots_total: number
  slots_available: number
  status: GameStatus
  created_at: string
}

export interface GameJoin {
  id: string
  user_id: string
  game_id: string
  created_at: string
}

export interface PlayerRequest {
  id: string
  user_id: string
  sport: Sport
  level: Level
  availability_text: string | null
  availability_date: string | null
  status: PlayerRequestStatus
  created_at: string
}
