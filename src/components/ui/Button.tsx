import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-black',
  secondary: 'bg-secondary text-black',
  outline: 'bg-white text-black',
  danger: 'bg-danger text-white',
}

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-6 py-4 text-lg w-full',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
  size?: Size
  loading?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-display font-bold border-2 border-black rounded-lg shadow-brutal
        transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
        cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:shadow-brutal
        disabled:active:translate-x-0 disabled:active:translate-y-0
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="animate-spin">⟳</span> : null}
      {children}
    </button>
  )
}
