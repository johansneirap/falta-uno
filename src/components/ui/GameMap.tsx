import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface GameMapProps {
  lat: number
  lng: number
  label?: string
}

export default function GameMap({ lat, lng, label }: GameMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    }).setView([lat, lng], 15)

    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    const marker = L.marker([lat, lng]).addTo(map)
    if (label) marker.bindPopup(label).openPopup()

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [lat, lng])

  return (
    <div
      ref={containerRef}
      style={{ height: '160px', width: '100%' }}
      className="rounded-b-[10px] overflow-hidden border-t-[2px] border-black"
    />
  )
}
