import { useState } from "react"
import { getErrorMessage } from "../utils/errors"

function authHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
}

const REASONS = ["Spam", "Harassment or bullying", "Hate speech", "Inappropriate content", "Other"]

function ReportButton({ targetType, targetId, className = "" }) {
  const [open, setOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState("")
  const [details, setDetails] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  function closeModal() {
    setOpen(false)
    setError("")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedReason) return

    const reason = details.trim() ? `${selectedReason} — ${details.trim()}` : selectedReason

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
    return <span className={`text-xs ${className}`} style={{ color: "var(--color-muted)" }}>✓ Reported</span>
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-xs ${className}`}
        style={{ color: "var(--color-muted)" }}
      >
        Report
      </button>

      {open && (
        <div className="report-backdrop" onClick={closeModal}>
          <div className="report-glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg" style={{ color: "#fff" }}>Report {targetType}</h3>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="text-xl leading-none"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Why are you reporting this?</p>

              <div className="flex flex-wrap gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedReason(r)}
                    className={`report-chip ${selectedReason === r ? "active" : ""}`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                placeholder="Add details (optional)..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="report-glass-input"
              />

              {error && <p className="text-xs" style={{ color: "#fca5a5" }}>{error}</p>}

              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-sm px-4 py-2 rounded-lg"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedReason}
                  className="text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
                  style={{ backgroundColor: "#ef4444", color: "#fff" }}
                >
                  {submitting ? "Submitting..." : "Submit report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default ReportButton
