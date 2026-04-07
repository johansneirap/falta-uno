import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { supabase } from './lib/supabase'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import CreateGame from './pages/CreateGame'
import GameDetail from './pages/GameDetail'
import Players from './pages/Players'
import Profile from './pages/Profile'

function AppRoutes() {
  const { user, loading: authLoading } = useAuth()
  const [profileLoading, setProfileLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setProfileLoading(false)
      setHasProfile(false)
      return
    }

    supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setHasProfile(!!data)
        setProfileLoading(false)
      })
  }, [user, authLoading])

  if (authLoading || profileLoading) {
    return (
      <div className="app-container flex items-center justify-center min-h-screen bg-cream">
        <svg className="animate-spin text-primary" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  // No autenticado → solo Login
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Autenticado sin perfil → Onboarding
  if (!hasProfile) {
    return (
      <Routes>
        <Route
          path="*"
          element={<Onboarding onComplete={() => setHasProfile(true)} />}
        />
      </Routes>
    )
  }

  // Autenticado con perfil → App completa
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/crear" element={<Layout><CreateGame /></Layout>} />
      <Route path="/partido/:id" element={<GameDetail />} />
      <Route path="/jugadores" element={<Layout><Players /></Layout>} />
      <Route path="/perfil" element={<Layout><Profile /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
