export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export interface AchievementWithStatus extends Achievement {
  unlocked: boolean
  progress: { current: number; total: number }
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'primer_partido',
    name: 'Primer Partido',
    description: 'Únete a tu primer partido',
    icon: 'primer_partido',
    color: '#FFC097',
  },
  {
    id: 'organizador',
    name: 'Organizador',
    description: 'Crea tu primer partido',
    icon: 'organizador',
    color: '#A8C8F0',
  },
  {
    id: 'jugador_social',
    name: 'Jugador Social',
    description: 'Únete a 3 partidos distintos',
    icon: 'jugador_social',
    color: '#F4A8B0',
  },
  {
    id: 'hat_trick',
    name: 'Hat-trick',
    description: 'Juega 3 partidos de fútbol',
    icon: 'hat_trick',
    color: '#A8E6B4',
  },
  {
    id: 'fijo_del_grupo',
    name: 'Fijo del Grupo',
    description: 'Juega 10 partidos en total',
    icon: 'fijo_del_grupo',
    color: '#C4AEED',
  },
  {
    id: 'mvp',
    name: 'MVP',
    description: 'Crea 5 partidos y únete a 5',
    icon: 'mvp',
    color: '#FFE5A0',
  },
]
