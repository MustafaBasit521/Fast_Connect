import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, UserPlus } from "lucide-react"
import { initials } from "../utils/initials"
import { useToast } from "../context/ToastContext"
import { EmptyState } from "../components/EmptyState"

const API = "https://fast-connect-bay.vercel.app"

function authHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
}

function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  async function loadDiscover() {
    setLoading(true)
    const response = await fetch(`${API}/friends/discover`, { headers: authHeaders() })
    if (response.ok) {
      setSuggestions(await response.json())
    }
    setLoading(false)
  }

  useEffect(() => {
    loadDiscover()
  }, [])

  async function handleFollow(userId) {
    const response = await fetch(`${API}/friends/requests/${userId}`, {
      method: "POST",
      headers: authHeaders(),
    })
    const data = await response.json()

    if (response.ok) {
      addToast(data.status === "accepted" ? "Now following!" : "Follow request sent!", "success")
      setSuggestions((prev) => prev.filter((p) => p.id !== userId))
    } else {
      addToast("Could not send request.", "error")
    }
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4">
      <Link to="/feed" className="flex items-center gap-1.5 text-sm w-fit hover:opacity-70" style={{ color: "var(--color-muted)" }}>
        <ArrowLeft className="w-4 h-4" /> Back to Feed
      </Link>
      <h1 className="text-2xl font-bold">Suggestions for you</h1>

      {loading ? (
        <p style={{ color: "var(--color-muted)" }}>Loading...</p>
      ) : suggestions.length === 0 ? (
        <EmptyState icon={UserPlus} title="No suggestions right now" message="Check back later for new people to connect with." />
      ) : (
        <div className="flex flex-col gap-2">
          {suggestions.map((person) => (
            <div key={person.id} className="post-card border rounded-lg p-4 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <Link to={`/profile/${person.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                  style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
                >
                  {initials(person.name)}
                </div>
                <span className="font-semibold truncate">{person.name}</span>
              </Link>
              <button
                onClick={() => handleFollow(person.id)}
                className="text-sm font-semibold px-3 py-1.5 rounded shrink-0"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
              >
                Follow
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SuggestionsPage
