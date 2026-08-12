import { useState, useEffect } from "react"
import { initials } from "../utils/initials"

function authHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
}

function FriendsPage() {
  const [tab, setTab] = useState("friends")
  const [requests, setRequests] = useState([])
  const [friends, setFriends] = useState([])

  async function loadRequests() {
    const response = await fetch("https://fast-connect-bay.vercel.app/friends/requests", { headers: authHeaders() })
    if (response.ok) setRequests(await response.json())
  }

  async function loadFriends() {
    const response = await fetch("https://fast-connect-bay.vercel.app/friends", { headers: authHeaders() })
    if (response.ok) setFriends(await response.json())
  }



  useEffect(() => {
    loadRequests()
    loadFriends()
  }, [])

  async function handleAccept(requestId) {
    await fetch(`https://fast-connect-bay.vercel.app/friends/requests/${requestId}/accept`, {
      method: "PUT",
      headers: authHeaders(),
    })
    loadRequests()
    loadFriends()
  }

  async function handleDecline(requestId) {
    await fetch(`https://fast-connect-bay.vercel.app/friends/requests/${requestId}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    loadRequests()
    loadFriends()
  }



  const tabs = [
    { key: "requests", label: `Requests (${requests.length})` },
    { key: "friends", label: `My Friends (${friends.length})` },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Friends</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded text-sm font-medium border shrink-0 whitespace-nowrap"
            style={
              tab === t.key
                ? { backgroundColor: "var(--color-primary)", color: "var(--color-bg)", borderColor: "var(--color-primary)" }
                : { color: "var(--color-muted)", borderColor: "var(--color-border)" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "requests" && (
        <div className="flex flex-col gap-3">
          {requests.length === 0 && <p style={{ color: "var(--color-muted)" }}>No pending requests.</p>}
          {requests.map((req) => (
            <div key={req.id} className="border rounded-lg p-4 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
                >
                  {initials(req.from_user_name)}
                </div>
                <p className="font-semibold">{req.from_user_name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(req.id)}
                  className="rounded px-3 py-1 text-sm"
                  style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
                >
                  Accept
                </button>
                <button onClick={() => handleDecline(req.id)} className="border rounded px-3 py-1 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "friends" && (
        <div className="flex flex-col gap-3">
          {friends.length === 0 && <p style={{ color: "var(--color-muted)" }}>No friends yet — check Discover.</p>}
          {friends.map((friend) => (
            <div key={friend.request_id} className="border rounded-lg p-4 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  style={
                    friend.deleted
                      ? { backgroundColor: "var(--color-border)", color: "var(--color-muted)" }
                      : { backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }
                  }
                >
                  {friend.deleted ? "?" : initials(friend.name)}
                </div>
                <p className={friend.deleted ? "italic" : "font-semibold"} style={friend.deleted ? { color: "var(--color-muted)" } : undefined}>
                  {friend.deleted ? "Deleted Account" : friend.name}
                </p>
              </div>
              <button onClick={() => handleDecline(friend.request_id)} className="border rounded px-3 py-1 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FriendsPage
