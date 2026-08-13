import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const API = "https://fast-connect-bay.vercel.app"

function authHeaders() {
  const token = localStorage.getItem("token")
  return { "Authorization": `Bearer ${token}` }
}

function NotificationsDropdown({ onClose }) {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [reqRes, msgRes] = await Promise.all([
        fetch(`${API}/friends/requests`, { headers: authHeaders() }),
        fetch(`${API}/messages/recent`, { headers: authHeaders() }),
      ])
      if (reqRes.ok) setRequests(await reqRes.json())
      if (msgRes.ok) setMessages(await msgRes.json())
      setLoading(false)
    }

    load()
  }, [])

  function goToFriends() {
    navigate("/friends")
    onClose()
  }

  function goToMessage(msg) {
    navigate("/messages", { state: { userId: msg.from_user_id, userName: msg.from_user_name } })
    onClose()
  }

  const totalCount = requests.length + messages.length

  return (
    <div
      className="absolute right-0 top-12 w-80 rounded-lg shadow-lg py-2 z-20 border max-h-96 overflow-y-auto"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="px-4 py-2 border-b font-semibold text-sm" style={{ borderColor: "var(--color-border)" }}>
        Notifications
      </div>

      {loading ? (
        <p className="px-4 py-3 text-sm" style={{ color: "var(--color-muted)" }}>Loading...</p>
      ) : totalCount === 0 ? (
        <p className="px-4 py-3 text-sm" style={{ color: "var(--color-muted)" }}>You're all caught up 🎉</p>
      ) : (
        <>
          {requests.length > 0 && (
            <div>
              <p className="px-4 pt-2 pb-1 text-xs font-semibold uppercase" style={{ color: "var(--color-muted)" }}>Friend Requests</p>
              {requests.map((req) => (
                <button
                  key={req.id}
                  onClick={goToFriends}
                  className="w-full text-left px-4 py-2 text-sm hover:opacity-70 flex items-center gap-2"
                >
                  <span>👥</span>
                  <span><strong>{req.from_user_name}</strong> sent you a friend request</span>
                </button>
              ))}
            </div>
          )}

          {messages.length > 0 && (
            <div>
              <p className="px-4 pt-2 pb-1 text-xs font-semibold uppercase" style={{ color: "var(--color-muted)" }}>Messages</p>
              {messages.map((msg) => (
                <button
                  key={msg.from_user_id}
                  onClick={() => goToMessage(msg)}
                  className="w-full text-left px-4 py-2 text-sm hover:opacity-70"
                >
                  <p><strong>{msg.from_user_name}</strong></p>
                  <p className="truncate" style={{ color: "var(--color-muted)" }}>{msg.content}</p>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default NotificationsDropdown
