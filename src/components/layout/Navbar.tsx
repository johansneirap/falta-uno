import type { ComponentType } from 'react'
import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: ComponentType
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'HOME', icon: HomeIcon },
  { to: '/crear', label: 'CREAR', icon: PlusIcon },
  { to: '/jugadores', label: 'JUGADORES', icon: UsersIcon },
  { to: '/perfil', label: 'PERFIL', icon: UserIcon },
]

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50
                    flex justify-center px-[21px] pt-3 pb-[21px] bg-cream">
      {/* Pill contenedor */}
      <div className="w-full h-[62px] bg-white border-2 border-black rounded-[36px]
                      shadow-[3px_3px_0px_0px_#000000] flex p-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 rounded-[26px] transition-colors
              ${isActive ? 'bg-primary' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-black' : 'text-gray-400'}>
                  <Icon />
                </span>
                <span className={`font-body font-semibold text-[10px] tracking-[0.5px]
                                  ${isActive ? 'text-black' : 'text-gray-400'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
