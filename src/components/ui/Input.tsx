import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-display font-bold text-sm text-brutal-black">
          {label}
        </label>
      )}
      <input
        className={`
          w-full border-2 border-black rounded-lg px-3 py-2.5
          font-body bg-white focus:outline-none focus:ring-2 focus:ring-primary
          placeholder:text-gray-400 text-brutal-black
          ${error ? 'border-danger' : 'border-black'}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-danger text-xs font-body">{error}</span>}
    </div>
  )
}
