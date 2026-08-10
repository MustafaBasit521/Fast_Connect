import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function refreshUser() {
    const token = localStorage.getItem("token")

    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    const response = await fetch("http://127.0.0.1:8000/auth/me", {
      headers: { "Authorization": `Bearer ${token}` },
    })

    if (response.ok) {
      const data = await response.json()
      setUser(data)
    } else {
      localStorage.removeItem("token")
      setUser(null)
    }

    setLoading(false)
  }

  useEffect(() => {
    refreshUser()
  }, [])

  function logout() {
    localStorage.removeItem("token")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
