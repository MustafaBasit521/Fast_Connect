import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getErrorMessage } from "../utils/errors"
import { initials } from "../utils/initials"

function authHeaders() {
  const token = localStorage.getItem("token")
  return { "Authorization": `Bearer ${token}` }
}

function ViewProfile() {
  const { userId } = useParams()

  const [profile, setProfile] = useState(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function loadProfile() {
      const response = await fetch(`https://fast-connect-bay.vercel.app/profile/${userId}`, {
        headers: authHeaders(),
      })
      const data = await response.json()

      if (response.ok) {
        setProfile(data)
        setMessage("")
      } else {
        setProfile(null)
        setMessage(getErrorMessage(data))
      }
    }

    loadProfile()
  }, [userId])

  if (message) {
    return <p style={{ color: "var(--color-danger)" }}>{message}</p>
  }

  if (!profile) {
    return null
  }

  return (
    <div className="max-w-md">
      <div className="border rounded-lg p-6 flex items-center gap-4" style={{ borderColor: "var(--color-border)" }}>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
        >
          {initials(profile.name)}
        </div>
        <div>
          <h1 className="text-xl font-bold">{profile.name}</h1>
          {profile.bio && <p style={{ color: "var(--color-muted)" }}>{profile.bio}</p>}
        </div>
      </div>
    </div>
  )
}

export default ViewProfile
