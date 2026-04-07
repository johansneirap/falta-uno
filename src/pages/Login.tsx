import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { user, signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const { error } = await signInWithEmail(email.trim())
    setLoading(false)
    if (error) {
      setError('No pudimos enviar el link. Intenta nuevamente.')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="app-container flex flex-col bg-cream min-h-screen">

      {/* Status Bar */}
      <div className="flex items-center justify-center h-[62px] px-5">
        <span className="font-display font-semibold text-[15px] text-brutal-black">9:41</span>
      </div>

      {/* Content — centrado verticalmente */}
      <div className="flex flex-col justify-center gap-8 flex-1 px-6 pb-6 pt-10">

        {/* Hero */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-3 text-[32px]">
            <span>⚽</span>
            <span>🎾</span>
            <span>🏀</span>
          </div>
          <h1 className="font-display font-black text-[42px] tracking-[2px] text-brutal-black leading-none">
            FALTA 1
          </h1>
          <p className="font-body font-medium text-[16px] text-gray-500">
            Completa tu partido.
          </p>
        </div>

        {/* Card */}
        {!sent ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white border-[2.5px] border-black rounded-[14px] shadow-brutal p-7 flex flex-col gap-5"
          >
            <div>
              <h2 className="font-display font-bold text-[20px] text-brutal-black">
                Ingresa tu email
              </h2>
              <p className="font-body text-[14px] text-gray-500 leading-relaxed mt-1">
                Te enviaremos un link para entrar.<br />Sin contraseña.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body font-medium text-[14px] text-brutal-black">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full h-[44px] px-4 border-2 border-black rounded-[10px] bg-cream
                           font-body text-brutal-black placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <p className="font-body text-[13px] text-danger">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full h-[48px] flex items-center justify-center gap-2
                         bg-primary border-[2.5px] border-black rounded-[12px]
                         shadow-[3px_3px_0px_0px_#000000]
                         font-display font-extrabold text-[15px] tracking-[0.5px] text-black
                         transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:active:shadow-[3px_3px_0px_0px_#000000]
                         disabled:active:translate-x-0 disabled:active:translate-y-0"
            >
              {loading ? (
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
              ) : (
                <>
                  <SendIcon />
                  ENVIAR LINK
                </>
              )}
            </button>
          </form>
        ) : (
          /* Estado éxito */
          <div className="flex justify-center">
            <div className="w-[330px] bg-white border-[2.5px] border-black rounded-[14px]
                            shadow-brutal flex flex-col items-center gap-4 px-6 pt-8 pb-6">
              <span className="text-[36px]">📬</span>
              <h2 className="font-display font-bold text-[20px] text-brutal-black">
                ¡Revisa tu email!
              </h2>
              <p className="font-body text-[14px] text-gray-500 text-center leading-snug w-[280px]">
                Te enviamos el link a <span className="font-medium text-brutal-black">{email}</span>
              </p>
              <button
                onClick={() => { setSent(false); setError(null) }}
                className="w-full h-[44px] flex items-center justify-center
                           bg-white border-2 border-black rounded-[10px]
                           font-display font-bold text-[14px] text-brutal-black
                           transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
                           shadow-brutal-sm"
              >
                Reenviar link
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="font-body text-[11px] text-gray-400 text-center">
          Al continuar, aceptas nuestros Términos de Servicio.
        </p>
      </div>

      {/* Bottom Tab Bar — inactivo en login */}
      <div className="bg-white border-t-[2.5px] border-black px-4 pt-3 pb-7 flex justify-around">
        {[
          { icon: <HouseIcon />, label: 'Inicio' },
          { icon: <PlusIcon />, label: 'Crear' },
          { icon: <UsersIcon />, label: 'Jugadores' },
          { icon: <UserIcon />, label: 'Perfil' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1 flex-1 opacity-40">
            {icon}
            <span className="font-display font-semibold text-[10px] text-brutal-black">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Iconos ──────────────────────────────────────────────────────────────────

function SendIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
    </svg>
  )
}

function HouseIcon() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
