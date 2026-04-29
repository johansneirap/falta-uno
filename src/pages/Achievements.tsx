import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAchievements } from '../hooks/useAchievements'
import AchievementBadge from '../components/ui/AchievementBadge'
import AchievementProgressBar from '../components/ui/AchievementProgressBar'

export default function Achievements() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { achievements, loading } = useAchievements(user?.id)

  const featured = achievements.find(a => a.unlocked) ?? achievements[0]
  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div className="app-container flex flex-col min-h-dvh bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b-2 border-black bg-cream sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center border-2 border-black rounded-[10px] shadow-brutal-sm
                     bg-white transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        >
          <BackIcon />
        </button>
        <h1 className="font-display font-bold text-[18px] text-brutal-black flex-1">Logros</h1>
        <span className="font-display font-bold text-[13px] text-brutal-black border-2 border-black rounded-full px-3 py-1 bg-white shadow-brutal-sm">
          {unlockedCount} / {achievements.length}
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <svg className="animate-spin text-primary" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        </div>
      ) : (
        <div className="flex flex-col gap-6 px-5 py-6 pb-10">
          {/* Featured badge */}
          {featured && (
            <div className="bg-white border-2 border-black rounded-[16px] shadow-brutal p-5 flex flex-col items-center gap-4">
              <AchievementBadge
                name={featured.name}
                icon={featured.icon}
                color={featured.color}
                unlocked={featured.unlocked}
                size="lg"
              />
              <div className="w-full flex flex-col gap-1 items-center">
                <span className="font-body text-[13px] text-gray-500 text-center">{featured.description}</span>
              </div>
              <div className="w-full">
                <AchievementProgressBar
                  current={featured.progress.current}
                  total={featured.progress.total}
                  color={featured.color}
                />
              </div>
            </div>
          )}

          {/* All achievements grid */}
          <div className="flex flex-col gap-3">
            <h2 className="font-display font-bold text-[14px] text-brutal-black">Todos los logros</h2>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map(a => (
                <div
                  key={a.id}
                  className="bg-white border-2 border-black rounded-[14px] shadow-brutal p-4 flex flex-col items-center gap-3"
                >
                  <AchievementBadge
                    name={a.name}
                    icon={a.icon}
                    color={a.color}
                    unlocked={a.unlocked}
                    size="md"
                  />
                  <span className="font-body text-[11px] text-gray-400 text-center leading-tight">{a.description}</span>
                  <AchievementProgressBar
                    current={a.progress.current}
                    total={a.progress.total}
                    color={a.color}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}
