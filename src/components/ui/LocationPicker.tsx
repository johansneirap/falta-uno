import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons (Leaflet + Vite issue)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface LocationPickerProps {
  initialCoords?: { lat: number; lng: number }
  onConfirm: (coords: { lat: number; lng: number }) => void
  onClose: () => void
}

// Centro de Valparaíso por defecto
const DEFAULT_CENTER: [number, number] = [-33.047, -71.6127]
const DEFAULT_ZOOM = 13

export default function LocationPicker({ initialCoords, onConfirm, onClose }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const center: [number, number] = initialCoords
      ? [initialCoords.lat, initialCoords.lng]
      : DEFAULT_CENTER

    const map = L.map(containerRef.current).setView(center, DEFAULT_ZOOM)
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    const marker = L.marker(center, { draggable: true }).addTo(map)
    markerRef.current = marker

    marker.bindPopup('Arrastra el pin a la cancha').openPopup()

    map.on('click', (e) => {
      marker.setLatLng(e.latlng)
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  function handleConfirm() {
    if (!markerRef.current) return
    const { lat, lng } = markerRef.current.getLatLng()
    onConfirm({ lat, lng })
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/60" onClick={onClose}>
      <div
        className="mt-auto w-full bg-cream rounded-t-[20px] overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <span className="font-display font-bold text-[16px] text-brutal-black">📍 Marcar ubicación</span>
          <button onClick={onClose} className="text-gray-400 text-xl leading-none">✕</button>
        </div>
        <p className="font-body text-[12px] text-gray-500 px-5 pb-2">
          Toca el mapa o arrastra el pin para marcar la cancha.
        </p>

        {/* Map */}
        <div ref={containerRef} style={{ height: '340px', width: '100%' }} />

        {/* Confirm button */}
        <div className="px-5 py-4">
          <button
            onClick={handleConfirm}
            className="w-full h-12 flex items-center justify-center
                       bg-primary border-2 border-black rounded-full
                       shadow-[4px_4px_0px_0px_#000000]
                       font-display font-bold text-[15px] text-black
                       transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            Confirmar ubicación
          </button>
        </div>
      </div>
    </div>
  )
}
