import { LEVEL_COLORS } from '../../lib/constants'
import type { Level } from '../../lib/constants'

const LABELS: Record<Level, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
}

interface LevelBadgeProps {
  level: Level
}

export default function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <span
      className={`
        inline-block px-2 py-0.5 text-xs font-display font-bold
        border-2 border-black rounded-full
        ${LEVEL_COLORS[level] ?? 'bg-gray-100 text-gray-800'}
      `}
    >
      {LABELS[level] ?? level}
    </span>
  )
}
