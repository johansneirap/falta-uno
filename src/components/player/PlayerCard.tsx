import Avatar from '../ui/Avatar'
import type { Sport, Level } from '../../lib/constants'

const SPORT_EMOJI: Record<string, string> = {
  padel: '🎾', futbol: '⚽', tenis: '🎾', basket: '🏀',
}
const SPORT_LABEL: Record<string, string> = {
  padel: 'Pádel', futbol: 'Fútbol', tenis: 'Tenis', basket: 'Básket',
}
const LEVEL_LABEL: Record<string, string> = {
  principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado',
}
const LEVEL_BADGE: Record<string, string> = {
  principiante: 'bg-green-100 text-green-800',
  intermedio: 'bg-yellow-100 text-yellow-800',
  avanzado: 'bg-red-100 text-red-800',
}

interface PlayerCardProps {
  name: string
  phone: string | null
  sport: Sport
  level: Level
  availabilityText: string | null
}

export default function PlayerCard({ name, phone, sport, level, availabilityText }: PlayerCardProps) {
  function handleContact() {
    if (!phone) return
    const msg = encodeURIComponent(
      `Hola ${name}! Te vi en Falta 1 buscando partido de ${SPORT_LABEL[sport]}. ¿Seguís disponible?`
    )
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`, '_blank')
  }

  return (
    <div className="bg-white border-2 border-black rounded-[12px] shadow-brutal p-3.5 flex items-center gap-3 w-full">
      <Avatar name={name} size="md" />
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="font-display font-bold text-[14px] text-brutal-black">{name}</span>
        <div className="flex items-center gap-2">
          <span className="text-[13px]">{SPORT_EMOJI[sport]}</span>
          <span className={`text-[11px] font-display font-bold border-[1.5px] border-black rounded-full px-2 py-0.5 ${LEVEL_BADGE[level]}`}>
            {LEVEL_LABEL[level]}
          </span>
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
