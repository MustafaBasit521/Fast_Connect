import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// FAST-NUCES Lahore campus — approximate center, just used to point the map at the right area by default
export const CAMPUS_CENTER = [31.4822, 74.3033]

const pickerIcon = L.divIcon({
  html: `<div style="background:#d4a853;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.4);border:2px solid white;"></div>`,
  className: "",
  iconSize: [26, 26],
  iconAnchor: [13, 26],
})

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function LocationPicker({ value, onChange, height = "200px" }) {
  return (
    <div style={{ height, borderRadius: "0.5rem", overflow: "hidden" }}>
      <MapContainer
        center={value ? [value.lat, value.lng] : CAMPUS_CENTER}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} />
        {value && <Marker position={[value.lat, value.lng]} icon={pickerIcon} />}
      </MapContainer>
    </div>
  )
}

export default LocationPicker
