import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { API_URL, getErrorMessage } from "../api"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setMessage("")

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()

    if (!response.ok) {
      setSubmitting(false)
      setMessage(getErrorMessage(data))
      return
    }

    localStorage.setItem("token", data.access_token)

    const meResponse = await fetch(`${API_URL}/auth/me`, {
      headers: { "Authorization": `Bearer ${data.access_token}` },
    })
    const meData = await meResponse.json()

    setSubmitting(false)

    if (!meResponse.ok || meData.role !== "admin") {
      localStorage.removeItem("token")
      setMessage("This portal is for admins only.")
      return
    }

    await refreshUser()
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm border rounded-lg p-6" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center gap-2 mb-6">
          <div
            className="w-9 h-9 rounded flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: "var(--color-panel)", color: "var(--color-accent)" }}
          >
            FC
          </div>
          <div>
            <p className="font-semibold leading-none">FAST Connect</p>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>Admin Portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded px-4 py-2 font-medium disabled:opacity-50"
            style={{ backgroundColor: "var(--color-panel)", color: "var(--color-accent)" }}
          >
            {submitting ? "Logging in..." : "Log In"}
          </button>

          {message && <p className="text-sm" style={{ color: "var(--color-danger)" }}>{message}</p>}
        </form>
      </div>
    </div>
  )
}

export default Login
