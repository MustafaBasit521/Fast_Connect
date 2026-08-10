import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getErrorMessage } from "../utils/errors"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    const response = await fetch("http://127.0.0.1:8000/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (response.ok) {
      setResetToken(data.reset_token)
      setMessage("")
    } else {
      setMessage(getErrorMessage(data))
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Forgot password</h2>
      <p className="text-gray-500 mb-6">We'll generate a reset token for your account.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input placeholder="you@lhr.nu.edu.pk" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
        <button type="submit" className="bg-blue-950 text-white rounded px-3 py-2">Send reset token</button>

        {message && <p className="text-red-600 text-sm">{message}</p>}

        {resetToken && (
          <>
            <p className="text-sm text-gray-600 break-all">Reset token: {resetToken}</p>
            <button
              type="button"
              onClick={() => navigate("/reset-password", { state: { token: resetToken } })}
              className="bg-amber-500 text-blue-950 font-medium rounded px-3 py-2"
            >
              Continue to reset password
            </button>
          </>
        )}
      </form>

      <Link to="/login" className="text-sm text-blue-900 mt-4 inline-block">← Back to log in</Link>
    </div>
  )
}

export default ForgotPassword
