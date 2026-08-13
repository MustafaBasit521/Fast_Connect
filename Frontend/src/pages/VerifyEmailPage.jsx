import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { getErrorMessage } from "../utils/errors"

const API = "https://fast-connect-bay.vercel.app"

function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const tokenFromLink = searchParams.get("token") || ""
  const [token, setToken] = useState(tokenFromLink)
  const [status, setStatus] = useState("idle") // idle | verifying | success | error
  const [message, setMessage] = useState("")

  async function verify(tokenToVerify) {
    setStatus("verifying")
    const response = await fetch(`${API}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: tokenToVerify }),
    })
    const data = await response.json()

    if (response.ok) {
      setStatus("success")
    } else {
      setStatus("error")
      setMessage(getErrorMessage(data))
    }
  }

  useEffect(() => {
    if (tokenFromLink) verify(tokenFromLink)
  }, [tokenFromLink])

  function handleSubmit(e) {
    e.preventDefault()
    if (token.trim()) verify(token.trim())
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}>
      <div className="w-full max-w-sm border rounded-lg p-6" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <h1 className="text-xl font-bold mb-4">Verify your email</h1>

        {status === "success" ? (
          <>
            <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
              ✅ Your email is verified. You're all set.
            </p>
            <Link to="/feed" className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>Go to Feed →</Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="block text-sm font-medium">Verification token</label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste the token from your email"
              className="w-full border rounded px-3 py-2"
              style={{ borderColor: "var(--color-border)" }}
            />
            <button
              type="submit"
              disabled={status === "verifying"}
              className="rounded px-4 py-2 font-semibold disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
            >
              {status === "verifying" ? "Verifying..." : "Verify"}
            </button>
            {status === "error" && <p className="text-sm" style={{ color: "var(--color-danger)" }}>{message}</p>}
          </form>
        )}
      </div>
    </div>
  )
}

export default VerifyEmailPage
