import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { getErrorMessage } from "../utils/errors"
import { useToast } from "../context/ToastContext"
import { useAuth } from "../context/AuthContext"
import { CAMPUS_CENTER } from "../components/LocationPicker"

const API = "https://fast-connect-bay.vercel.app"

const LOCATION_CATEGORIES = ["Academic", "Facility", "Recreation", "Admin"]

const LOCATION_EMOJI = {
  Academic: "🎓",
  Facility: "🏢",
  Recreation: "🎮",
  Admin: "📋",
}

function authHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
}

function pinIcon(emoji, color) {
  return L.divIcon({
    html: `<div style="background:${color};width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);border:2px solid white;"><span style="transform:rotate(45deg);font-size:14px;">${emoji}</span></div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  })
}

const locationIcons = Object.fromEntries(
  LOCATION_CATEGORIES.map((c) => [c, pinIcon(LOCATION_EMOJI[c], "#2d3a5c")])
)
const eventIcon = pinIcon("🎉", "#d4a853")
const newPinIcon = pinIcon("📍", "#dc2626")

const campusIcon = L.divIcon({
  html: `<div style="background:#2d3a5c;width:40px;height:40px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.5);border:3px solid #d4a853;"><span style="transform:rotate(45deg);font-size:20px;">🎓</span></div>`,
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
})

function AddLocationClickHandler({ active, onPick }) {
  useMapEvents({
    click(e) {
      if (active) onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function AddLocationForm({ position, onSaved, onCancel }) {
  const { addToast } = useToast()
  const [name, setName] = useState("")
  const [category, setCategory] = useState("Academic")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    const response = await fetch(`${API}/locations`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        name,
        category,
        latitude: position.lat,
        longitude: position.lng,
        description: description || null,
      }),
    })
    const data = await response.json()
    setSaving(false)

    if (response.ok) {
      addToast("Location added", "success")
      onSaved(data)
    } else {
      addToast(getErrorMessage(data), "error")
    }
  }

  return (
    <Popup position={[position.lat, position.lng]} eventHandlers={{ remove: onCancel }}>
      <form onSubmit={handleSave} className="flex flex-col gap-2" style={{ minWidth: "180px" }}>
        <input autoFocus placeholder="Location name" value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-2 py-1 text-sm" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded px-2 py-1 text-sm">
          {LOCATION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="border rounded px-2 py-1 text-sm" />
        <button type="submit" disabled={saving} className="bg-black text-white rounded px-2 py-1 text-sm disabled:opacity-50">
          {saving ? "Saving..." : "Save location"}
        </button>
      </form>
    </Popup>
  )
}

function CampusMapPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [locations, setLocations] = useState([])
  const [events, setEvents] = useState([])
  const [activeCategories, setActiveCategories] = useState(new Set(LOCATION_CATEGORIES))
  const [addMode, setAddMode] = useState(false)
  const [pendingPin, setPendingPin] = useState(null)

  useEffect(() => {
    async function load() {
      const [locRes, evRes] = await Promise.all([
        fetch(`${API}/locations`, { headers: authHeaders() }),
        fetch(`${API}/events`, { headers: authHeaders() }),
      ])
      if (locRes.ok) setLocations(await locRes.json())
      if (evRes.ok) {
        const evData = await evRes.json()
        setEvents(evData.filter((e) => e.latitude != null && e.longitude != null))
      }
    }
    load()
  }, [])

  function toggleCategory(cat) {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  async function handleToggleGoing(eventId) {
    const response = await fetch(`${API}/events/${eventId}/going`, { method: "POST", headers: authHeaders() })
    const data = await response.json()
    if (response.ok) {
      setEvents((prev) => prev.map((e) => (e.id === eventId ? data : e)))
    }
  }

  const visibleLocations = locations.filter((loc) => activeCategories.has(loc.category))

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Campus Map</h1>
        {user?.role === "admin" && (
          <button
            onClick={() => { setAddMode((v) => !v); setPendingPin(null) }}
            className="rounded px-4 py-2 text-sm font-semibold"
            style={
              addMode
                ? { backgroundColor: "var(--color-danger)", color: "white" }
                : { backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }
            }
          >
            {addMode ? "Cancel adding" : "+ Add Location (Admin)"}
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {LOCATION_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            className="text-sm px-3 py-1.5 rounded-full border"
            style={
              activeCategories.has(cat)
                ? { backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)", color: "var(--color-bg)" }
                : { borderColor: "var(--color-border)", color: "var(--color-muted)" }
            }
          >
            {LOCATION_EMOJI[cat]} {cat}
          </button>
        ))}
      </div>

      {addMode && (
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>Tap anywhere on the map to place a new location pin.</p>
      )}

      <div className="border rounded-lg overflow-hidden" style={{ borderColor: "var(--color-border)", height: "60vh" }}>
        <MapContainer center={CAMPUS_CENTER} zoom={16} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={CAMPUS_CENTER} icon={campusIcon}>
            <Popup>
              <div className="flex flex-col gap-1" style={{ minWidth: "160px" }}>
                <p className="font-bold">FAST-NUCES Lahore</p>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>This is the university 🎓</p>
              </div>
            </Popup>
          </Marker>

          <AddLocationClickHandler active={addMode} onPick={setPendingPin} />

          {pendingPin && (
            <>
              <Marker position={[pendingPin.lat, pendingPin.lng]} icon={newPinIcon} />
              <AddLocationForm
                position={pendingPin}
                onSaved={(loc) => { setLocations((prev) => [...prev, loc]); setPendingPin(null); setAddMode(false) }}
                onCancel={() => setPendingPin(null)}
              />
            </>
          )}

          {visibleLocations.map((loc) => (
            <Marker key={loc.id} position={[loc.latitude, loc.longitude]} icon={locationIcons[loc.category]}>
              <Popup>
                <div className="flex flex-col gap-1" style={{ minWidth: "160px" }}>
                  <p className="font-bold">{loc.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>Category: {loc.category}</p>
                  {loc.description && <p className="text-sm">{loc.description}</p>}
                </div>
              </Popup>
            </Marker>
          ))}

          {events.map((event) => (
            <Marker key={event.id} position={[event.latitude, event.longitude]} icon={eventIcon}>
              <Popup>
                <div className="flex flex-col gap-1" style={{ minWidth: "160px" }}>
                  <p className="font-bold">{event.title}</p>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>{event.category} • {event.venue_name}</p>
                  {event.description && <p className="text-sm">{event.description}</p>}
                  <button
                    onClick={() => handleToggleGoing(event.id)}
                    className="mt-1 text-sm font-semibold rounded px-2 py-1"
                    style={
                      event.going_by_me
                        ? { backgroundColor: "#2d3a5c", color: "white" }
                        : { border: "1px solid #ccc" }
                    }
                  >
                    {event.going_by_me ? `✓ Going (${event.going_count})` : `Going? (${event.going_count})`}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default CampusMapPage
