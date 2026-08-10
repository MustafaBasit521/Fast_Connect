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
      const response = await fetch("http://127.0.0.1:8000/friends", { headers: authHeaders() })
      if (response.ok) {
        const data = await response.json()
        setFriends(data)
        if (data.length > 0) setSelected(data[0])
      }
    }

    loadFriends()
  }, [])

  async function loadMessages(friendId) {
    const response = await fetch(`http://127.0.0.1:8000/messages/${friendId}`, { headers: authHeaders() })
    if (response.ok) setMessages(await response.json())
  }

  useEffect(() => {
    if (selected) loadMessages(selected.id)
  }, [selected])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || !selected) return

    await fetch(`http://127.0.0.1:8000/messages/${selected.id}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content: text }),
    })

    setText("")
    loadMessages(selected.id)
  }

  return (
    <div className="flex border border-gray-200 rounded-lg" style={{ height: "70vh" }}>
      <div className="w-64 border-r border-gray-200 overflow-y-auto">
        <h1 className="text-lg font-bold p-4">Messages</h1>

        {friends.length === 0 && <p className="text-gray-500 px-4">Add friends to start messaging.</p>}

        {friends.map((friend) => (
          <button
            key={friend.request_id}
            onClick={() => setSelected(friend)}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 ${selected?.id === friend.id ? "bg-blue-50" : ""}`}
          >
            <div className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-sm ${friend.deleted ? "bg-gray-400" : "bg-blue-900"}`}>
              {friend.deleted ? "?" : initials(friend.name)}
            </div>
            <p className={friend.deleted ? "text-sm text-gray-400 italic" : "font-medium text-sm"}>{friend.name}</p>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="p-4 border-b border-gray-200 font-semibold">{selected.name}</div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={
                    msg.from_user_id === selected.id
                      ? "max-w-xs px-3 py-2 rounded-lg text-sm bg-gray-100 self-start"
                      : "max-w-xs px-3 py-2 rounded-lg text-sm bg-blue-950 text-white self-end"
                  }
                >
                  {msg.content}
                </div>
              ))}
            </div>

            {selected.deleted ? (
              <p className="p-4 border-t border-gray-200 text-sm text-gray-400 italic">
                This user's account has been deleted — you can't send new messages.
              </p>
            ) : (
              <form onSubmit={handleSend} className="p-4 border-t border-gray-200 flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                />
                <button type="submit" className="bg-blue-950 text-white rounded px-4 py-2">Send</button>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Select a conversation</div>
        )}
      </div>
    </div>
  )
}

export default MessagesPage
