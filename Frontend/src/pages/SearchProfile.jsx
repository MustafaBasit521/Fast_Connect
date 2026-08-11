import { useState } from "react"
import { Link } from "react-router-dom"
import { initials } from "../utils/initials"
import { getErrorMessage } from "../utils/errors"

function authHeaders() {
  const token = localStorage.getItem("token")
  return { "Authorization": `Bearer ${token}` }
}

function SearchProfile() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [message, setMessage] = useState("")

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return

    const response = await fetch(`https://fast-connect-bay.vercel.app/profile/search?q=${encodeURIComponent(query)}`, {
      headers: authHeaders(),
    })
    const data = await response.json()

    if (response.ok) {
      setResults(data)
      setMessage(data.length === 0 ? "No profiles found." : "")
    } else {
      setResults([])
      setMessage(getErrorMessage(data))
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Search Profiles</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          placeholder="Search by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          style={{ borderColor: "var(--color-border)" }}
        />
        <button type="submit" className="rounded px-4 py-2" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}>
          Search
        </button>
      </form>

      {message && <p style={{ color: "var(--color-muted)" }}>{message}</p>}

      <div className="flex flex-col gap-3">
        {results.map((person) => (
          <Link
            key={person.id}
            to={`/profile/${person.id}`}
            className="border rounded-lg p-4 flex items-center gap-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
            >
              {initials(person.name)}
            </div>
            <p className="font-semibold">{person.name}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default SearchProfile
