import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getErrorMessage } from "../utils/errors"
import MagneticButton from "../components/MagneticButton"

function SignUp() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    const response = await fetch("https://fast-connect-bay.vercel.app/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
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
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        <Link to="/login" className="pb-2 text-gray-400">Log In</Link>
        <span className="pb-2 border-b-2 border-blue-900 font-semibold text-blue-900">Sign Up</span>
      </div>

      <h2 className="text-2xl font-bold mb-1">Create your account</h2>
      <p className="text-gray-500 mb-6">Use your FAST-NUCES Lahore email.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input placeholder="you@lhr.nu.edu.pk" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input placeholder="At least 8 characters" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
        </div>

        <MagneticButton type="submit" className="mt-2">Sign Up</MagneticButton>

        {message && <p className="text-red-600 text-sm">{message}</p>}
      </form>
    </div>
  )
}

export default SignUp
