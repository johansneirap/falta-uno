import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options?: SelectOption[]
  placeholder?: string
}

export default function Select({
  label,
  error,
  options = [],
  placeholder,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-display font-bold text-sm text-brutal-black">
          {label}
        </label>
      )}
      <select
        className={`
          w-full border-2 border-black rounded-lg px-3 py-2.5
          font-body bg-white focus:outline-none focus:ring-2 focus:ring-primary
          text-brutal-black appearance-none cursor-pointer
          ${error ? 'border-danger' : 'border-black'}
          ${className}
        `}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {error && <span className="text-danger text-xs font-body">{error}</span>}
    </div>
  )
}
