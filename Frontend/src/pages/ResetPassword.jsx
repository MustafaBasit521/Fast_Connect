import { useState } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { getErrorMessage } from "../utils/errors"
import MagneticButton from "../components/MagneticButton"

function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const [token, setToken] = useState(location.state?.token || "")
  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    const response = await fetch("https://fast-connect-bay.vercel.app/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password: newPassword }),
    })

    const data = await response.json()

    if (response.ok) {
      navigate("/login")
    } else {
      setMessage(getErrorMessage(data))
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Reset password</h2>
      <p className="text-gray-500 mb-6">Enter your reset token and a new password.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Reset token</label>
          <input value={token} onChange={(e) => setToken(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">New password</label>
          <input placeholder="At least 8 characters" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
        </div>

        <MagneticButton type="submit">Reset password</MagneticButton>

        {message && <p className="text-red-600 text-sm">{message}</p>}
      </form>

      <Link to="/login" className="text-sm text-blue-900 mt-4 inline-block">← Back to log in</Link>
    </div>
  )
}

export default ResetPassword
