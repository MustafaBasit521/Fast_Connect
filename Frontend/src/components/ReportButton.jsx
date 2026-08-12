import { useState } from "react"
import { getErrorMessage } from "../utils/errors"

function authHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
}

function ReportButton({ targetType, targetId, className = "" }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    if (!reason.trim()) return

    setSubmitting(true)
    setError("")

    const response = await fetch("https://fast-connect-bay.vercel.app/reports", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ target_type: targetType, target_id: targetId, reason }),
    })
    const data = await response.json()

    setSubmitting(false)

    if (response.ok) {
      setDone(true)
      setOpen(false)
    } else {
      setError(getErrorMessage(data))
    }
  }

  if (done) {
    return <span className={`text-xs ${className}`} style={{ color: "var(--color-muted)" }}>Reported</span>
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-xs ${className}`}
        style={{ color: "var(--color-muted)" }}
      >
        Report
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-1 mt-1 ${className}`}>
      <div className="flex gap-2">
        <input
          autoFocus
          placeholder="Why are you reporting this?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="border rounded px-2 py-1 text-xs flex-1"
          style={{ borderColor: "var(--color-border)" }}
        />
        <button type="submit" disabled={submitting} className="text-xs font-medium disabled:opacity-50" style={{ color: "var(--color-danger)" }}>
          Submit
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs" style={{ color: "var(--color-muted)" }}>
          Cancel
        </button>
      </div>
      {error && <p className="text-xs" style={{ color: "var(--color-danger)" }}>{error}</p>}
    </form>
  )
}

export default ReportButton
