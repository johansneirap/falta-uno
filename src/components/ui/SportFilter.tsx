type SportFilter = 'todos' | 'padel' | 'futbol'

interface SportFilterProps {
  value: SportFilter
  onChange: (value: SportFilter) => void
}

const TABS: { value: SportFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'padel', label: 'Pádel' },
  { value: 'futbol', label: 'Fútbol' },
]

export default function SportFilter({ value, onChange }: SportFilterProps) {
  return (
    <div className="flex gap-2">
      {TABS.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`
            px-4 py-2 font-display font-bold text-sm rounded-lg border-2 border-black
            transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
            ${value === tab.value
              ? 'bg-primary shadow-brutal-sm'
              : 'bg-white shadow-brutal-sm hover:bg-cream'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
