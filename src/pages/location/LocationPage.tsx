import { WORKSHOP } from '@/data/mockData'
import { MapPin, Phone, Mail, Navigation } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Fix leaflet icon issue
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

export default function LocationPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Workshop Location</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card p-6 rounded-xl border h-full">
            <h2 className="text-xl font-bold text-primary mb-6">{WORKSHOP.name}</h2>
            
            <div className="space-y-6">
              <div className="flex gap-3 items-start text-sm">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground leading-relaxed">{WORKSHOP.address}</span>
              </div>
              
              <div className="flex gap-3 items-center text-sm">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span className="text-muted-foreground">{WORKSHOP.phone}</span>
              </div>
              
              <div className="flex gap-3 items-center text-sm">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span className="text-muted-foreground">{WORKSHOP.email}</span>
              </div>
            </div>

            <a 
              href={WORKSHOP.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Navigation className="h-4 w-4" />
              Get Directions
            </a>
          </div>
        </div>

        <div className="md:col-span-2 h-[400px] md:h-full min-h-[400px] bg-card rounded-xl border overflow-hidden">
          <MapContainer 
            center={[WORKSHOP.coordinates.latitude, WORKSHOP.coordinates.longitude]} 
            zoom={15} 
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="map-tiles"
            />
            <Marker position={[WORKSHOP.coordinates.latitude, WORKSHOP.coordinates.longitude]}>
              <Popup>
                <b>{WORKSHOP.name}</b><br/>{WORKSHOP.address}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
