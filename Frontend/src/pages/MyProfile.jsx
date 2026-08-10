import { useState, useEffect } from "react"

function MyProfile() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token")

      const response = await fetch("http://127.0.0.1:8000/auth/me", {
        headers: { "Authorization": `Bearer ${token}` },
      })

      const data = await response.json()

      if (response.ok) {
        setName(data.name)
        setEmail(data.email)
        setBio(data.bio || "")
        setPhone(data.phone || "")
      }
    }

    loadProfile()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()

    const token = localStorage.getItem("token")

    const response = await fetch("http://127.0.0.1:8000/profile/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ name, bio, phone }),
    })

    const data = await response.json()

    if (response.ok) {
      setMessage("Profile updated!")
    } else {
      setMessage(data.detail)
    }
  }

  async function handleDelete() {
    const token = localStorage.getItem("token")

    const response = await fetch("http://127.0.0.1:8000/profile/me", {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    })

    const data = await response.json()
    setMessage(data.message)
  }

  return (
    <div className="max-w-xs mb-8">
      <h2 className="font-bold">My Profile</h2>
      <p className="text-sm text-gray-500">{email}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="border border-gray-400 rounded px-2 py-1" />
        <input placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} className="border border-gray-400 rounded px-2 py-1" />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="border border-gray-400 rounded px-2 py-1" />
        <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1">Save Changes</button>
      </form>

      <button onClick={handleDelete} className="bg-red-600 text-white rounded px-3 py-1 mt-2">Delete Account</button>

      <p>{message}</p>
    </div>
  )
}

export default MyProfile
