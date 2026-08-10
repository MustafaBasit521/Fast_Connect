import { useState } from "react";

function ResetPassword() {
  const [token, setToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    const response = await fetch("http://127.0.0.1:8000/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password: newPassword }),
    })

    const data = await response.json()

    if (response.ok) {
      setMessage("Password reset successful!")
    } else {
      setMessage(data.detail)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-xs mb-8">
      <h2 className="font-bold">Reset Password</h2>
      <input placeholder="Reset token" value={token} onChange={(e) => setToken(e.target.value)} className="border border-gray-400 rounded px-2 py-1" />
      <input placeholder="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="border border-gray-400 rounded px-2 py-1" />
      <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1">Reset Password</button>
      <p>{message}</p>
    </form>
  )
}

export default ResetPassword