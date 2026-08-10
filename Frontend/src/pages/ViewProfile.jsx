import { useState } from "react"

function ViewProfile() {
  const [userId, setUserId] = useState("")
  const [profile, setProfile] = useState(null)
  const [message, setMessage] = useState("")

  async function handleView(e) {
    e.preventDefault()

    const response = await fetch(`http://127.0.0.1:8000/profile/${userId}`)
    const data = await response.json()

    if (response.ok) {
      setProfile(data)
      setMessage("")
    } else {
      setProfile(null)
      setMessage(data.detail)
    }
  }

  return (
    <div className="max-w-xs mb-8">
      <h2 className="font-bold">View Profile</h2>

      <form onSubmit={handleView} className="flex flex-col gap-2">
        <input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} className="border border-gray-400 rounded px-2 py-1" />
        <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1">View</button>
      </form>

      {profile && (
        <div className="mt-2">
          <p>Name: {profile.name}</p>
          <p>Bio: {profile.bio}</p>
        </div>
      )}

      <p>{message}</p>
    </div>
  )
}

export default ViewProfile
