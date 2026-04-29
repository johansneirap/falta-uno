import type { SVGProps } from 'react'

const ICONS: Record<string, (props: SVGProps<SVGSVGElement>) => JSX.Element> = {
  primer_partido: (props) => (
    // Ping-pong paddle
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="9" r="6" />
      <path d="M13.5 13.5L20 20" strokeWidth="3" strokeLinecap="round" />
      <path d="M7 9h4M9 7v4" />
    </svg>
  ),
  organizador: (props) => (
    // Clipboard with plus
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11v6M9 14h6" />
    </svg>
  ),
  jugador_social: (props) => (
    // Users
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  hat_trick: (props) => (
    // Soccer ball (circle + pentagon lines)
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 5.66 2.34L14 9h-4L6.34 5.34A9 9 0 0 1 12 3z" />
      <path d="M3.34 14L7 11l2 3-1.5 4.5A9 9 0 0 1 3.34 14z" />
      <path d="M20.66 14a9 9 0 0 1-4.16 4.5L15 14l2-3 3.66 3z" />
      <path d="M9 18l1.5-4.5h3L15 18" />
    </svg>
  ),
  fijo_del_grupo: (props) => (
    // Star
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  mvp: (props) => (
    // Trophy
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  ),
  locked: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
}

interface AchievementBadgeProps {
  name: string
  icon: string
  color: string
  unlocked: boolean
  size?: 'md' | 'lg'
}

export default function AchievementBadge({
  name,
  icon,
  color,
  unlocked,
  size = 'md',
}: AchievementBadgeProps) {
  const outer = size === 'lg' ? 120 : 80
  const inner = size === 'lg' ? 90 : 60
  const offset = (outer - inner) / 2
  const iconSize = size === 'lg' ? 36 : 24
  const pillText = size === 'lg' ? 'text-[10px]' : 'text-[9px]'

  const IconComponent = unlocked ? (ICONS[icon] ?? ICONS.locked) : ICONS.locked

  return (
    <div className={`flex flex-col items-center gap-2 ${!unlocked ? 'opacity-40' : ''}`}>
      {/* Badge circle */}
      <div className="relative" style={{ width: outer, height: outer }}>
        {/* Outer ring with shadow */}
        <div
          className="absolute inset-0 rounded-full border-[3px] border-black"
          style={{
            backgroundColor: color,
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        />
        {/* Inner ring with radial gradient */}
        <div
          className="absolute rounded-full"
          style={{
            width: inner,
            height: inner,
            top: offset,
            left: offset,
            background: `radial-gradient(circle, ${color} 0%, #F5F0E8 100%)`,
          }}
        />
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <IconComponent
            width={iconSize}
            height={iconSize}
            style={{ color: '#111111' }}
          />
        </div>
      </div>

      {/* Pill label */}
      <div
        className={`border-2 border-black rounded-full px-[10px] py-1 font-display font-bold ${pillText} text-black`}
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  )
}
