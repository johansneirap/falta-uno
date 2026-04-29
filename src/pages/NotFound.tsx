import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="app-container flex flex-col items-center justify-center min-h-dvh bg-cream px-6 gap-6 text-center">
      <div className="w-24 h-24 bg-primary border-2 border-black rounded-[24px] shadow-brutal flex items-center justify-center">
        <span className="font-display font-black text-[42px] leading-none">4</span>
        <span className="text-[36px]">🏟️</span>
        <span className="font-display font-black text-[42px] leading-none">4</span>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="font-display font-black text-[28px] text-brutal-black">
          Página no encontrada
        </h1>
        <p className="font-body text-[14px] text-gray-500 max-w-[280px]">
          Esta cancha no existe. Vuelve al feed y encuentra tu partido.
        </p>
      </div>

      <button
        onClick={() => navigate('/')}
        className="btn bg-primary px-6 py-3 text-[14px] text-black"
      >
        Volver al inicio
      </button>
    </div>
  )
}
