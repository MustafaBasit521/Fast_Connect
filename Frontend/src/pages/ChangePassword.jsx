import { useState } from "react";

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState("")

  async function handleSubmit(e) {
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
      setMessage("Password changed successfully!")
    } else {
      setMessage(data.detail)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-xs mb-8">
      <h2 className="font-bold">Change Password</h2>
      <input placeholder="Old password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="border border-gray-400 rounded px-2 py-1" />
      <input placeholder="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="border border-gray-400 rounded px-2 py-1" />
      <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1">Change Password</button>
      <p>{message}</p>
    </form>
  )
}

export default ChangePassword
