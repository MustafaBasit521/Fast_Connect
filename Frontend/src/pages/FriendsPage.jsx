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
  const [discoverable, setDiscoverable] = useState([])

  async function loadRequests() {
    const response = await fetch("http://127.0.0.1:8000/friends/requests", { headers: authHeaders() })
    if (response.ok) setRequests(await response.json())
  }

  async function loadFriends() {
    const response = await fetch("http://127.0.0.1:8000/friends", { headers: authHeaders() })
    if (response.ok) setFriends(await response.json())
  }

  async function loadDiscover() {
    const response = await fetch("http://127.0.0.1:8000/friends/discover", { headers: authHeaders() })
    if (response.ok) setDiscoverable(await response.json())
  }

  useEffect(() => {
    loadRequests()
    loadFriends()
    loadDiscover()
  }, [])

  async function handleAccept(requestId) {
    await fetch(`http://127.0.0.1:8000/friends/requests/${requestId}/accept`, {
      method: "PUT",
      headers: authHeaders(),
    })
    loadRequests()
    loadFriends()
  }

  async function handleDecline(requestId) {
    await fetch(`http://127.0.0.1:8000/friends/requests/${requestId}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    loadRequests()
    loadFriends()
  }

  async function handleSendRequest(userId) {
    await fetch(`http://127.0.0.1:8000/friends/requests/${userId}`, {
      method: "POST",
      headers: authHeaders(),
    })
    loadDiscover()
    loadRequests()
  }

  const tabs = [
    { key: "requests", label: `Requests (${requests.length})` },
    { key: "friends", label: `My Friends (${friends.length})` },
    { key: "discover", label: "Discover" },
  ]

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Friends</h1>

      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded text-sm font-medium ${tab === t.key ? "bg-blue-950 text-white" : "border border-gray-300 text-gray-600"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "requests" && (
        <div className="flex flex-col gap-3">
          {requests.length === 0 && <p className="text-gray-500">No pending requests.</p>}
          {requests.map((req) => (
            <div key={req.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                  {initials(req.from_user_name)}
                </div>
                <p className="font-semibold">{req.from_user_name}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAccept(req.id)} className="bg-blue-950 text-white rounded px-3 py-1 text-sm">Accept</button>
                <button onClick={() => handleDecline(req.id)} className="border border-gray-300 text-gray-600 rounded px-3 py-1 text-sm">Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "friends" && (
        <div className="flex flex-col gap-3">
          {friends.length === 0 && <p className="text-gray-500">No friends yet — check Discover.</p>}
          {friends.map((friend) => (
            <div key={friend.request_id} className={`border rounded-lg p-4 flex items-center justify-between ${friend.deleted ? "border-gray-200 bg-gray-50" : "border-gray-200"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm ${friend.deleted ? "bg-gray-400" : "bg-blue-900"}`}>
                  {friend.deleted ? "?" : initials(friend.name)}
                </div>
                <p className={friend.deleted ? "text-gray-400 italic" : "font-semibold"}>
                  {friend.deleted ? "Deleted Account" : friend.name}
                </p>
              </div>
              <button onClick={() => handleDecline(friend.request_id)} className="border border-gray-300 text-gray-600 rounded px-3 py-1 text-sm">Remove</button>
            </div>
          ))}
        </div>
      )}

      {tab === "discover" && (
        <div className="flex flex-col gap-3">
          {discoverable.length === 0 && <p className="text-gray-500">No one new to discover right now.</p>}
          {discoverable.map((person) => (
            <div key={person.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                  {initials(person.name)}
                </div>
                <p className="font-semibold">{person.name}</p>
              </div>
              <button onClick={() => handleSendRequest(person.id)} className="bg-amber-500 text-blue-950 font-medium rounded px-3 py-1 text-sm">Add Friend</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FriendsPage
