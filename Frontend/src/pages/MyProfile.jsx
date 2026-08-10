import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { initials } from "../utils/initials"
import { getErrorMessage } from "../utils/errors"

function MyProfile() {
  const { user, refreshUser, logout } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [phone, setPhone] = useState("")
  const [profileMessage, setProfileMessage] = useState("")

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  useEffect(() => {
    if (user) {
      setName(user.name)
      setBio(user.bio || "")
      setPhone(user.phone || "")
    }
  }, [user])

  async function handleProfileSubmit(e) {
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
      setProfileMessage("Profile updated!")
      await refreshUser()
    } else {
      setProfileMessage(getErrorMessage(data))
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()

    const token = localStorage.getItem("token")

    const response = await fetch("http://127.0.0.1:8000/auth/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    })

    const data = await response.json()

    if (response.ok) {
      setPasswordMessage("Password changed successfully!")
      setOldPassword("")
      setNewPassword("")
    } else {
      setPasswordMessage(getErrorMessage(data))
    }
  }

  async function handleDelete() {
    const token = localStorage.getItem("token")

    await fetch("http://127.0.0.1:8000/profile/me", {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    })

    logout()
    navigate("/login")
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">My Profile &amp; Settings</h1>

      <div className="border rounded-lg p-6 mb-4" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
          >
            {initials(name || user.name)}
          </div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" style={{ borderColor: "var(--color-border)" }} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <input value={bio} onChange={(e) => setBio(e.target.value)} className="w-full border rounded px-3 py-2" style={{ borderColor: "var(--color-border)" }} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded px-3 py-2" style={{ borderColor: "var(--color-border)" }} />
          </div>

          <button type="submit" className="rounded px-4 py-2 self-start" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}>
            Save Changes
          </button>

          {profileMessage && <p className="text-sm" style={{ color: "var(--color-muted)" }}>{profileMessage}</p>}
        </form>
      </div>

      <div className="border rounded-lg p-6 mb-4" style={{ borderColor: "var(--color-border)" }}>
        <h2 className="font-semibold mb-4">Change Password</h2>

        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current password</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full border rounded px-3 py-2" style={{ borderColor: "var(--color-border)" }} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">New password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border rounded px-3 py-2" style={{ borderColor: "var(--color-border)" }} />
          </div>

          <button type="submit" className="border rounded px-4 py-2 self-start" style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>
            Change Password
          </button>

          {passwordMessage && <p className="text-sm" style={{ color: "var(--color-muted)" }}>{passwordMessage}</p>}
        </form>
      </div>

      <div className="border border-red-200 bg-red-50 rounded-lg p-6">
        <h2 className="font-semibold text-red-700 mb-1">Danger Zone</h2>
        <p className="text-sm text-red-600 mb-4">
          Deleting your account removes your posts, comments, and likes. Friends will keep your past
          messages, but your account will show as deleted.
        </p>

        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="bg-red-600 text-white rounded px-4 py-2">
            Delete Account
          </button>
        ) : (
          <div className="flex flex-col gap-2 max-w-xs">
            <label className="text-sm text-red-700">
              Type <strong>delete</strong> to confirm:
            </label>
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="border border-red-300 rounded px-3 py-2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText.toLowerCase() !== "delete"}
                className="bg-red-600 text-white rounded px-4 py-2 disabled:opacity-40"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirmText("")
                }}
                style={{ color: "var(--color-muted)" }}
                className="px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyProfile
