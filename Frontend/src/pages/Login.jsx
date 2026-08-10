import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getErrorMessage } from "../utils/errors"
import MagneticButton from "../components/MagneticButton"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()

    const response = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      localStorage.setItem("token", data.access_token)
      await refreshUser()
      navigate("/feed")
    } else {
      setMessage(getErrorMessage(data))
    }
  }

  return (
    <div>
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        <span className="pb-2 border-b-2 border-blue-900 font-semibold text-blue-900">Log In</span>
        <Link to="/signup" className="pb-2 text-gray-400">Sign Up</Link>
      </div>

      <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
      <p className="text-gray-500 mb-6">Log in with your campus account.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input placeholder="you@lhr.nu.edu.pk" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
          <Link to="/forgot-password" className="text-sm text-blue-900 float-right mt-1">Forgot password?</Link>
        </div>

        <MagneticButton type="submit" className="mt-4">Log In</MagneticButton>

        {message && <p className="text-red-600 text-sm">{message}</p>}
      </form>
    </div>
  )
}

export default Login
