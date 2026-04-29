import { useEffect, useState } from 'react'

interface AchievementProgressBarProps {
  current: number
  total: number
  color: string
}

export default function AchievementProgressBar({ current, total, color }: AchievementProgressBarProps) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0
    const raf = requestAnimationFrame(() => setWidth(pct))
    return () => cancelAnimationFrame(raf)
  }, [current, total])

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-4 bg-white border-2 border-black rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-display font-bold text-[11px] text-brutal-black whitespace-nowrap">
        {current} / {total}
      </span>
    </div>
  )
}
