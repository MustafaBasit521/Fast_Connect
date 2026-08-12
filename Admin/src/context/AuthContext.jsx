import { createContext, useContext, useState, useEffect } from "react"
import { API_URL } from "../api"

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

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { "Authorization": `Bearer ${token}` },
    })

    if (response.ok) {
      const data = await response.json()

      if (data.role === "admin") {
        setUser(data)
      } else {
        localStorage.removeItem("token")
        setUser(null)
      }
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
