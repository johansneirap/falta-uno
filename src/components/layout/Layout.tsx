import type { ReactNode } from 'react'
import Navbar from './Navbar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="app-container">
      <main className="pb-20 min-h-screen">
        {children}
      </main>
      <Navbar />
    </div>
  )
}
