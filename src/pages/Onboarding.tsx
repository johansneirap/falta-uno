import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

interface OnboardingProps {
  onComplete: () => void
}

function validatePhone(value: string): string | null {
  if (!value.trim()) return null // opcional
  if (!/^[+\d\s\-().]+$/.test(value)) return 'Solo se permiten números, +, espacios y guiones'
  const digits = value.replace(/\D/g, '')
  if (digits.length < 8) return 'El número es demasiado corto'
  if (digits.length > 15) return 'El número es demasiado largo'
  return null
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handlePhoneChange(value: string) {
    setPhone(value)
    setPhoneError(validatePhone(value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !name.trim()) return
    const phoneValidation = validatePhone(phone)
    if (phoneValidation) {
      setPhoneError(phoneValidation)
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      name: name.trim(),
      phone: phone.trim() || null,
      email: user.email,
    })

    setLoading(false)
    if (error) {
      setError('Hubo un problema. Intenta nuevamente.')
    } else {
      onComplete()
    }
  }

  return (
    <div className="app-container flex flex-col bg-cream" style={{ minHeight: '100dvh' }}>
      {/* Status bar */}
      <div className="flex items-center justify-center h-[62px]">
        <span className="font-display font-semibold text-[15px] text-brutal-black">9:41</span>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center gap-8 flex-1 px-6 pb-10">

        {/* Hero */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-3 text-[32px]">
            <span>⚽</span><span>🎾</span><span>🏀</span>
          </div>
          <h1 className="font-display font-black text-[36px] tracking-[2px] text-brutal-black leading-none">
            FALTA 1
          </h1>
          <p className="font-body font-medium text-[14px] text-gray-500 text-center">
            Cuéntanos quién eres para que otros jugadores puedan contactarte.
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border-[2.5px] border-black rounded-[14px] shadow-brutal p-7 flex flex-col gap-5"
        >
          <h2 className="font-display font-bold text-[20px] text-brutal-black">Completa tu perfil</h2>

          <div className="flex flex-col gap-1.5">
            <label className="font-body font-medium text-sm text-brutal-black">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Tu nombre completo"
              required
              autoFocus
              className="w-full h-[44px] px-4 border-2 border-black rounded-[10px] bg-cream
                         font-body text-brutal-black placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body font-medium text-sm text-brutal-black">
              Teléfono <span className="text-gray-400 font-normal">(para WhatsApp)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => handlePhoneChange(e.target.value)}
              placeholder="+56 9 1234 5678"
              className={`w-full h-[44px] px-4 border-2 rounded-[10px] bg-cream
                         font-body text-brutal-black placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-primary
                         ${phoneError ? 'border-danger' : 'border-black'}`}
            />
            {phoneError
              ? <p className="font-body text-[11px] text-danger">{phoneError}</p>
              : <p className="font-body text-[11px] text-gray-400">Sin teléfono otros jugadores no podrán contactarte.</p>
            }
          </div>

          {error && <p className="font-body text-[13px] text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading || !name.trim() || !!phoneError}
            className="w-full h-[48px] flex items-center justify-center gap-2
                       bg-primary border-[2.5px] border-black rounded-[12px]
                       shadow-[3px_3px_0px_0px_#000000]
                       font-display font-extrabold text-[15px] text-black
                       transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       disabled:active:shadow-[3px_3px_0px_0px_#000000]
                       disabled:active:translate-x-0 disabled:active:translate-y-0"
          >
            {loading ? (
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            ) : '¡Empezar a jugar! 🚀'}
          </button>
        </form>
      </div>
    </div>
  )
}
