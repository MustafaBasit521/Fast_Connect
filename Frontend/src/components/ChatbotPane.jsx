import { useState, useEffect, useRef } from "react"
import { Bot } from "lucide-react"

const API = "https://fast-connect-bay.vercel.app"

function authHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
}

function ChatbotPane({ onBack }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const bottomRef = useRef(null)

  useEffect(() => {
    async function loadHistory() {
      setLoadingHistory(true)
      const response = await fetch(`${API}/chatbot/history`, { headers: authHeaders() })
      if (response.ok) {
        setMessages(await response.json())
      }
      setLoadingHistory(false)
    }

    loadHistory()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, sending])

  async function handleSend(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setError("")
    setText("")
    setMessages((prev) => [...prev, { role: "user", content: trimmed }])
    setSending(true)

    const response = await fetch(`${API}/chatbot/chat`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ message: trimmed }),
    })
    const data = await response.json()

    setSending(false)

    if (response.ok) {
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }])
    } else {
      setError(typeof data.detail === "string" ? data.detail : "FAST AI couldn't respond. Please try again.")
    }
  }

  return (
    <>
      <div className="p-4 border-b font-semibold flex items-center gap-2" style={{ borderColor: "var(--color-border)" }}>
        {onBack && (
          <button onClick={onBack} aria-label="Back to conversations" className="md:hidden -ml-1" style={{ color: "var(--color-muted)" }}>
            ←
          </button>
        )}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          <Bot className="w-4 h-4" strokeWidth={1.75} />
        </div>
        FAST AI
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {loadingHistory ? (
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>Loading conversation...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Say hi to FAST AI 👋 — ask it anything, or just talk.
          </p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className="max-w-[80%] sm:max-w-sm px-3 py-2 rounded-lg text-sm whitespace-pre-wrap"
              style={
                msg.role === "assistant"
                  ? { backgroundColor: "var(--color-border)", alignSelf: "flex-start" }
                  : { backgroundColor: "var(--color-primary)", color: "var(--color-bg)", alignSelf: "flex-end" }
              }
            >
              {msg.content}
            </div>
          ))
        )}

        {sending && (
          <div className="px-3 py-2.5 rounded-lg flex gap-1 items-center" style={{ backgroundColor: "var(--color-border)", alignSelf: "flex-start" }}>
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && <p className="px-4 pb-2 text-xs" style={{ color: "var(--color-danger)" }}>{error}</p>}

      <form onSubmit={handleSend} className="p-4 border-t flex items-center gap-2" style={{ borderColor: "var(--color-border)" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message FAST AI..."
          className="flex-1 border rounded px-3 py-2 h-10"
          style={{ borderColor: "var(--color-border)" }}
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded px-4 h-10 disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
        >
          Send
        </button>
      </form>
    </>
  )
}

export default ChatbotPane
