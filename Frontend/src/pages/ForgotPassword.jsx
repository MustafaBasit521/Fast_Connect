import { useState } from "react";

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    const response = await fetch("http://127.0.0.1:8000/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (response.ok) {
      setMessage(data.reset_token)
    } else {
      setMessage(data.detail)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-xs mb-8">
      <h2 className="font-bold">Forgot Password</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-gray-400 rounded px-2 py-1" />
      <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1">Forgot Password</button>
      <p className="break-all">{message}</p>
    </form>
  )
}

export default ForgotPassword
