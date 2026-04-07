type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps {
  name: string
  size?: AvatarSize
}

const BG_COLORS = [
  'bg-primary', 'bg-secondary', 'bg-blue-400',
  'bg-purple-400', 'bg-pink-400', 'bg-yellow-400',
]

const SIZES: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
}

function getColor(name: string) {
  return BG_COLORS[name.charCodeAt(0) % BG_COLORS.length]
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

export default function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <div
      className={`
        ${SIZES[size]} ${getColor(name)}
        rounded-full border-2 border-black
        flex items-center justify-center
        font-display font-bold text-black flex-shrink-0
      `}
    >
      {getInitials(name)}
    </div>
  )
}
