import { useState, useEffect } from "react"
import { initials } from "../utils/initials"

function authHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
}

function MessagesPage() {
  const [friends, setFriends] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")

  useEffect(() => {
    async function loadFriends() {
      const response = await fetch("https://fast-connect-bay.vercel.app/friends", { headers: authHeaders() })
      if (response.ok) {
        const data = await response.json()
        setFriends(data)
        if (data.length > 0) setSelected(data[0])
      }
    }

    loadFriends()
  }, [])

  async function loadMessages(friendId) {
    const response = await fetch(`https://fast-connect-bay.vercel.app/messages/${friendId}`, { headers: authHeaders() })
    if (response.ok) setMessages(await response.json())
  }

  useEffect(() => {
    if (selected) loadMessages(selected.id)
  }, [selected])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || !selected) return

    await fetch(`https://fast-connect-bay.vercel.app/messages/${selected.id}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content: text }),
    })

    setText("")
    loadMessages(selected.id)
  }

  return (
    <div className="flex border rounded-lg" style={{ height: "70vh", borderColor: "var(--color-border)" }}>
      <div className="w-64 border-r overflow-y-auto" style={{ borderColor: "var(--color-border)" }}>
        <h1 className="text-lg font-bold p-4">Messages</h1>

        {friends.length === 0 && <p className="px-4" style={{ color: "var(--color-muted)" }}>Add friends to start messaging.</p>}

        {friends.map((friend) => (
          <button
            key={friend.request_id}
            onClick={() => setSelected(friend)}
            className="w-full text-left px-4 py-3 flex items-center gap-3"
            style={selected?.id === friend.id ? { backgroundColor: "var(--color-border)" } : undefined}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
              style={
                friend.deleted
                  ? { backgroundColor: "var(--color-border)", color: "var(--color-muted)" }
                  : { backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }
              }
            >
              {friend.deleted ? "?" : initials(friend.name)}
            </div>
            <p className={friend.deleted ? "text-sm italic" : "font-medium text-sm"} style={friend.deleted ? { color: "var(--color-muted)" } : undefined}>
              {friend.name}
            </p>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="p-4 border-b font-semibold" style={{ borderColor: "var(--color-border)" }}>{selected.name}</div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="max-w-xs px-3 py-2 rounded-lg text-sm"
                  style={
                    msg.from_user_id === selected.id
                      ? { backgroundColor: "var(--color-border)", alignSelf: "flex-start" }
                      : { backgroundColor: "var(--color-primary)", color: "var(--color-bg)", alignSelf: "flex-end" }
                  }
                >
                  {msg.content}
                </div>
              ))}
            </div>

            {selected.deleted ? (
              <p className="p-4 border-t text-sm italic" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>
                This user's account has been deleted — you can't send new messages.
              </p>
            ) : (
              <form onSubmit={handleSend} className="p-4 border-t flex gap-2" style={{ borderColor: "var(--color-border)" }}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 border rounded px-3 py-2"
                  style={{ borderColor: "var(--color-border)" }}
                />
                <button type="submit" className="rounded px-4 py-2" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}>
                  Send
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ color: "var(--color-muted)" }}>Select a conversation</div>
        )}
      </div>
    </div>
  )
}

export default MessagesPage
