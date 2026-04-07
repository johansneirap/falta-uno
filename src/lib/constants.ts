export const SPORTS = [
  { value: 'padel', label: 'Pádel', emoji: '🎾' },
  { value: 'futbol', label: 'Fútbol', emoji: '⚽' },
  { value: 'tenis', label: 'Tenis', emoji: '🎾' },
  { value: 'basket', label: 'Básket', emoji: '🏀' },
] as const

// Niveles genéricos (fútbol, tenis, básket)
export const LEVELS_GENERIC = [
  { value: 'recreacional', label: 'Recreacional' },
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
] as const

// Niveles por deporte
export const LEVELS_BY_SPORT = {
  padel: [
    { value: 'recreacional', label: 'Recreacional' },
    { value: '6ta', label: '6ª Categoría' },
    { value: '5ta', label: '5ª Categoría' },
    { value: '4ta', label: '4ª Categoría' },
    { value: '3ra', label: '3ª Categoría' },
    { value: '2da', label: '2ª Categoría' },
  ],
  tenis: LEVELS_GENERIC,
  futbol: LEVELS_GENERIC,
  basket: LEVELS_GENERIC,
} as const satisfies Record<string, readonly { value: string; label: string }[]>

// Mapa label → todos los niveles posibles
export const LEVEL_LABEL_MAP: Record<string, string> = {
  recreacional: 'Recreacional',
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  '6ta': '6ª Cat.',
  '5ta': '5ª Cat.',
  '4ta': '4ª Cat.',
  '3ra': '3ª Cat.',
  '2da': '2ª Cat.',
}

// Mapa color badge → todos los niveles posibles
export const LEVEL_COLOR_MAP: Record<string, string> = {
  recreacional: 'bg-purple-100 text-purple-800',
  principiante: 'bg-blue-100 text-blue-800',
  intermedio: 'bg-yellow-100 text-yellow-800',
  avanzado: 'bg-red-100 text-red-800',
  '6ta': 'bg-green-100 text-green-800',
  '5ta': 'bg-teal-100 text-teal-800',
  '4ta': 'bg-yellow-100 text-yellow-800',
  '3ra': 'bg-orange-100 text-orange-800',
  '2da': 'bg-red-100 text-red-800',
}

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
// Level es string abierto para soportar categorías por deporte (6ta, 5ta…)
export type Level = string
export type GameStatus = 'open' | 'full' | 'cancelled' | 'completed'
export type PlayerRequestStatus = 'active' | 'inactive'
export type PadelFormat = 'dobles' | 'singles'
export type TenisFormat = 'singles' | 'dobles'
export type FutbolFormat = '5v5' | '7v7' | '11v11'
export type BasketFormat = '3v3' | '5v5'
export type GameFormat = PadelFormat | FutbolFormat | BasketFormat

export const GAME_STATUS: Record<GameStatus, string> = {
  open: 'Abierto',
  full: 'Completo',
  cancelled: 'Cancelado',
  completed: 'Jugado',
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
