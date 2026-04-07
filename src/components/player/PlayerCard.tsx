import Avatar from '../ui/Avatar'
import type { Sport, Level } from '../../lib/constants'
import { LEVEL_LABEL_MAP, LEVEL_COLOR_MAP } from '../../lib/constants'

const SPORT_EMOJI: Record<string, string> = {
  padel: '🎾', futbol: '⚽', tenis: '🎾', basket: '🏀',
}
const SPORT_LABEL: Record<string, string> = {
  padel: 'Pádel', futbol: 'Fútbol', tenis: 'Tenis', basket: 'Básket',
}

export interface SportEntry {
  sport: Sport
  level: Level
  availabilityText: string | null
}

interface PlayerCardProps {
  name: string
  phone: string | null
  sports: SportEntry[]
}

export default function PlayerCard({ name, phone, sports }: PlayerCardProps) {
  const primarySport = sports[0]

  function handleContact() {
    if (!phone) return
    const sportsList = sports.map(s => SPORT_LABEL[s.sport]).join(' y ')
    const msg = encodeURIComponent(
      `Hola ${name}! Te vi en Falta 1 buscando partido de ${sportsList}. ¿Sigues disponible?`
    )
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`, '_blank')
  }

  const availabilityText = sports
    .map(s => s.availabilityText)
    .find(t => t != null) ?? null

  return (
    <div className="bg-white border-2 border-black rounded-[12px] shadow-brutal p-3.5 flex items-center gap-3 w-full">
      <Avatar name={name} size="md" />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <span className="font-display font-bold text-[14px] text-brutal-black">{name}</span>

        {/* Sports tags */}
        <div className="flex flex-wrap gap-1.5">
          {sports.map(s => (
            <div key={s.sport} className="flex items-center gap-1">
              <span className="font-body text-[12px] text-brutal-black font-medium">
                {SPORT_EMOJI[s.sport]} {SPORT_LABEL[s.sport]}
              </span>
              <span className={`text-[10px] font-display font-bold border-[1.5px] border-black rounded-full px-1.5 py-0.5 ${LEVEL_COLOR_MAP[s.level] ?? 'bg-gray-100 text-gray-800'}`}>
                {LEVEL_LABEL_MAP[s.level] ?? s.level}
              </span>
            </div>
          ))}
        </div>

        {availabilityText && (
          <span className="font-body text-[11px] text-gray-400 truncate">{availabilityText}</span>
        )}
      </div>
      <button
        onClick={handleContact}
        disabled={!phone}
        className="flex items-center gap-1.5 bg-[#25D366] border-2 border-black rounded-full px-3 py-2
                   shadow-[2px_2px_0px_0px_#000000] font-display font-semibold text-[11px] text-white
                   transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
                   disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
      >
        Contactar
      </button>
    </div>
  )
}
