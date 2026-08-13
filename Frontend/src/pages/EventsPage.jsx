import { useState, useEffect } from "react"
import { getErrorMessage } from "../utils/errors"
import { useToast } from "../context/ToastContext"
import { useAuth } from "../context/AuthContext"
import { EmptyState } from "../components/EmptyState"
import LocationPicker from "../components/LocationPicker"

const API = "https://fast-connect-bay.vercel.app"

const CATEGORIES = ["Tech", "Sports", "Academic", "Social"]

const CATEGORY_COLORS = {
  Tech: "#2563eb",
  Sports: "#16a34a",
  Academic: "#7c3aed",
  Social: "#e07a5f",
}

function authHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
}

function formatDateTime(iso) {
  const date = new Date(iso)
  return {
    day: date.toLocaleDateString(undefined, { day: "2-digit" }),
    month: date.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
    time: date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
  }
}

function EventCard({ event, onToggleGoing, onDelete, isMine }) {
  const start = formatDateTime(event.start_time)
  const end = formatDateTime(event.end_time)

  return (
    <div className="post-card border rounded-lg p-4 flex flex-col gap-3" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="text-center rounded-lg px-2 py-1 shrink-0" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
            <p className="text-xs font-bold" style={{ color: "var(--color-danger)" }}>{start.month}</p>
            <p className="text-lg font-bold leading-none">{start.day}</p>
          </div>
          <div>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: CATEGORY_COLORS[event.category] || "var(--color-primary)" }}
            >
              {event.category}
            </span>
            <h3 className="font-bold mt-1">{event.title}</h3>
          </div>
        </div>

        {isMine && (
          <button onClick={() => onDelete(event.id)} className="text-xs shrink-0" style={{ color: "var(--color-danger)" }}>
            Delete
          </button>
        )}
      </div>

      {event.description && (
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>{event.description}</p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: "var(--color-muted)" }}>
        <span>🕒 {start.time} – {end.time}</span>
        <span>📍 {event.venue_name}</span>
        <span>👤 {event.organizer_name}</span>
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="text-sm" style={{ color: "var(--color-muted)" }}>{event.going_count} going</span>
        <button
          onClick={() => onToggleGoing(event.id)}
          className="rounded px-4 py-1.5 text-sm font-semibold"
          style={
            event.going_by_me
              ? { backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }
              : { border: "1px solid var(--color-border)", color: "var(--color-text)" }
          }
        >
          {event.going_by_me ? "✓ Going" : "Going?"}
        </button>
      </div>
    </div>
  )
}

function CreateEventForm({ onCreated, onClose }) {
  const { addToast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Tech")
  const [venueName, setVenueName] = useState("")
  const [location, setLocation] = useState(null)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !venueName.trim() || !startTime || !endTime) return

    setSubmitting(true)

    const response = await fetch(`${API}/events`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        title,
        description: description || null,
        category,
        venue_name: venueName,
        latitude: location?.lat ?? null,
        longitude: location?.lng ?? null,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
      }),
    })
    const data = await response.json()

    setSubmitting(false)

    if (response.ok) {
      addToast("Event created!", "success")
      onCreated(data)
      onClose()
    } else {
      addToast(getErrorMessage(data), "error")
    }
  }

  return (
    <div className="border rounded-lg p-5 flex flex-col gap-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Create New Event</h2>
        <button onClick={onClose} className="text-xl leading-none" style={{ color: "var(--color-muted)" }}>×</button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" style={{ borderColor: "var(--color-border)" }} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={2000}
            className="w-full border rounded px-3 py-2 resize-none"
            style={{ borderColor: "var(--color-border)" }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className="text-sm px-3 py-1.5 rounded-full border"
                style={
                  category === c
                    ? { backgroundColor: CATEGORY_COLORS[c], borderColor: CATEGORY_COLORS[c], color: "white" }
                    : { borderColor: "var(--color-border)", color: "var(--color-muted)" }
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Venue name</label>
          <input value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="e.g. CS Block Auditorium" className="w-full border rounded px-3 py-2" style={{ borderColor: "var(--color-border)" }} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Pin on campus map (optional)</label>
          <LocationPicker value={location} onChange={setLocation} />
          <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
            Tap the map to drop a pin — this is what shows on the Campus Map page. Skip it if you don't need one.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Start time</label>
            <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full border rounded px-3 py-2" style={{ borderColor: "var(--color-border)" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End time</label>
            <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full border rounded px-3 py-2" style={{ borderColor: "var(--color-border)" }} />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded px-4 py-2 font-semibold disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          {submitting ? "Publishing..." : "Publish Event"}
        </button>
      </form>
    </div>
  )
}

const PAGE_SIZE = 20

function EventsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [category, setCategory] = useState("All")
  const [showForm, setShowForm] = useState(false)

  async function loadEvents(cat) {
    setLoading(true)
    const catQuery = cat && cat !== "All" ? `&category=${encodeURIComponent(cat)}` : ""
    const response = await fetch(`${API}/events?skip=0&limit=${PAGE_SIZE}${catQuery}`, { headers: authHeaders() })
    const data = await response.json()

    if (response.ok) {
      setEvents(data)
      setHasMore(data.length === PAGE_SIZE)
    } else {
      addToast(getErrorMessage(data), "error")
    }
    setLoading(false)
  }

  async function loadMore() {
    setLoadingMore(true)
    const catQuery = category && category !== "All" ? `&category=${encodeURIComponent(category)}` : ""
    const response = await fetch(`${API}/events?skip=${events.length}&limit=${PAGE_SIZE}${catQuery}`, { headers: authHeaders() })
    const data = await response.json()

    if (response.ok) {
      setEvents((prev) => [...prev, ...data])
      setHasMore(data.length === PAGE_SIZE)
    }
    setLoadingMore(false)
  }

  useEffect(() => {
    loadEvents(category)
  }, [category])

  async function handleToggleGoing(eventId) {
    const response = await fetch(`${API}/events/${eventId}/going`, { method: "POST", headers: authHeaders() })
    const data = await response.json()
    if (response.ok) {
      setEvents((prev) => prev.map((e) => (e.id === eventId ? data : e)))
    }
  }

  async function handleDelete(eventId) {
    await fetch(`${API}/events/${eventId}`, { method: "DELETE", headers: authHeaders() })
    setEvents((prev) => prev.filter((e) => e.id !== eventId))
    addToast("Event deleted", "info")
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Upcoming Campus Events</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded px-4 py-2 font-semibold"
          style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          {showForm ? "Cancel" : "+ Create Event"}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="text-sm px-4 py-1.5 rounded-full border shrink-0 whitespace-nowrap"
            style={
              category === c
                ? { backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)", color: "var(--color-bg)" }
                : { borderColor: "var(--color-border)", color: "var(--color-muted)" }
            }
          >
            {c}
          </button>
        ))}
      </div>

      {showForm && (
        <CreateEventForm
          onCreated={(event) => setEvents((prev) => [event, ...prev].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))}
          onClose={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <p style={{ color: "var(--color-muted)" }}>Loading events...</p>
      ) : events.length === 0 ? (
        <EmptyState icon="🎉" title="No events yet" message="Be the first to organize something for your campus!" />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onToggleGoing={handleToggleGoing}
                onDelete={handleDelete}
                isMine={event.organizer_id === user?.id}
              />
            ))}
          </div>

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="self-center rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
              style={{ border: "1px solid var(--color-border)", color: "var(--color-text)" }}
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default EventsPage
