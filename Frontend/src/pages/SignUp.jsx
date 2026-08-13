import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getErrorMessage } from "../utils/errors"
import MagneticButton from "../components/MagneticButton"
import { useToast } from "../context/ToastContext"

function SignUp() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [dob, setDob] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const { addToast } = useToast()
  const navigate = useNavigate()

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!dob) {
      addToast("Please enter your date of birth.", "error")
      return
    }

    const age = calculateAge(dob);
    if (age < 18) {
      addToast("You must be at least 18 years old to join FAST Connect.", "error")
      return
    }

    const response = await fetch("https://fast-connect-bay.vercel.app/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, dob, is_public: isPublic }),
    })

    const data = await response.json()

    if (response.ok) {
      addToast("Account created successfully!", "success")
      navigate("/login")
    } else {
      addToast(getErrorMessage(data), "error")
    }
  }

  return (
    <div>
      <div className="flex gap-6 border-b mb-6" style={{ borderColor: "var(--color-border)" }}>
        <Link to="/login" className="pb-2 transition-colors hover:opacity-70" style={{ color: "var(--color-muted)" }}>Log In</Link>
        <span className="pb-2 border-b-2 font-semibold" style={{ borderBottomColor: "var(--color-primary)", color: "var(--color-primary)" }}>Sign Up</span>
      </div>

      <h2 className="text-2xl font-bold mb-1">Create your account</h2>
      <p className="mb-6" style={{ color: "var(--color-muted)" }}>Use your FAST-NUCES Lahore email.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2 bg-transparent outline-none focus:ring-1 focus:ring-yellow-500" style={{ borderColor: "var(--color-border)" }} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input placeholder="you@lhr.nu.edu.pk" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 bg-transparent outline-none focus:ring-1 focus:ring-yellow-500" style={{ borderColor: "var(--color-border)" }} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input placeholder="At least 8 characters" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 bg-transparent outline-none focus:ring-1 focus:ring-yellow-500" style={{ borderColor: "var(--color-border)" }} />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full border rounded px-3 py-2 bg-transparent outline-none focus:ring-1 focus:ring-yellow-500" style={{ borderColor: "var(--color-border)", colorScheme: "dark" }} />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Account Privacy</label>
            <select value={isPublic} onChange={(e) => setIsPublic(e.target.value === "true")} className="w-full border rounded px-3 py-2 bg-transparent outline-none focus:ring-1 focus:ring-yellow-500" style={{ borderColor: "var(--color-border)" }}>
              <option value="true" className="bg-gray-800 text-white">Public (Anyone)</option>
              <option value="false" className="bg-gray-800 text-white">Private (Friends)</option>
            </select>
          </div>
        </div>

        <MagneticButton type="submit" className="mt-4 w-full rounded py-2 font-bold" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}>Sign Up</MagneticButton>

        <p className="text-xs text-center" style={{ color: "var(--color-muted)" }}>
          By signing up you agree to our{" "}
          <Link to="/terms" className="underline">Terms of Service</Link> and{" "}
          <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </form>
    </div>
  )
}

export default SignUp
