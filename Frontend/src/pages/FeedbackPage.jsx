import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, MessageSquareHeart } from "lucide-react"
import { getErrorMessage } from "../utils/errors"
import { useToast } from "../context/ToastContext"

const API = "https://fast-connect-bay.vercel.app"

function authHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
}

function FeedbackPage() {
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const { addToast } = useToast()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!message.trim()) return

    setSubmitting(true)
    const response = await fetch(`${API}/feedback`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ message: message.trim() }),
    })
    const data = await response.json()
    setSubmitting(false)

    if (response.ok) {
      setSent(true)
      setMessage("")
    } else {
      addToast(getErrorMessage(data), "error")
    }
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4">
      <Link to="/feed" className="flex items-center gap-1.5 text-sm w-fit hover:opacity-70" style={{ color: "var(--color-muted)" }}>
        <ArrowLeft className="w-4 h-4" /> Back to Feed
      </Link>
      <h1 className="text-2xl font-bold">Send Feedback</h1>
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        Found a bug, or have an idea to make FAST Connect better? Let us know.
      </p>

      {sent ? (
        <div className="post-card rounded-lg p-6 flex flex-col items-center text-center gap-2">
          <MessageSquareHeart className="w-8 h-8" style={{ color: "var(--color-primary)" }} strokeWidth={1.5} />
          <h2 className="font-bold">Thanks for the feedback!</h2>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>We've received your message.</p>
          <button
            onClick={() => setSent(false)}
            className="text-sm font-medium mt-2"
            style={{ color: "var(--color-accent)" }}
          >
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="post-card rounded-lg p-4 flex flex-col gap-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="Tell us what's on your mind..."
            className="w-full border rounded px-3 py-2 resize-none"
            style={{ borderColor: "var(--color-border)" }}
          />
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="rounded px-4 py-2 font-semibold disabled:opacity-50 self-end"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
          >
            {submitting ? "Sending..." : "Send Feedback"}
          </button>
        </form>
      )}
    </div>
  )
}

export default FeedbackPage
