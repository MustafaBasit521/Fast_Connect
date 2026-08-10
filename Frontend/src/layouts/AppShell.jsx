import { useState } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { initials } from "../utils/initials"
import Particles from "../components/Particles"
import Fireflies from "../components/Fireflies"

const navItems = [
  { to: "/feed", label: "Feed" },
  { to: "/friends", label: "Friends" },
  { to: "/messages", label: "Messages" },
  { to: "/profile", label: "Profile" },
]

function AppShell() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
          >
            FC
          </div>
          <span className="font-semibold">FAST Connect</span>
        </div>

        <div className="flex items-center gap-3 relative">
          {user?.role === "admin" && (
            <Link to="/admin" className="text-sm font-medium" style={{ color: "var(--color-accent)" }}>Admin Dashboard</Link>
          )}

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-full border flex items-center justify-center"
            style={{ borderColor: "var(--color-border)" }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <button
            aria-label="Notifications"
            className="w-9 h-9 rounded-full border flex items-center justify-center"
            style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
          >
            🔔
          </button>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
          >
            {user ? initials(user.name) : ""}
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />

              <div
                className="absolute right-0 top-12 w-56 rounded-lg shadow-lg py-2 z-20 border"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                <div className="px-4 py-2 border-b" style={{ borderColor: "var(--color-border)" }}>
                  <p className="font-semibold text-sm">{user?.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>{user?.email}</p>
                </div>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:opacity-70">
                  My Profile &amp; Settings
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm hover:opacity-70" style={{ color: "var(--color-danger)" }}>
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1">
        <div className="w-40 border-r flex flex-col gap-1 py-4 px-2" style={{ borderColor: "var(--color-border)" }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm px-3 py-2 rounded font-medium"
                style={
                  isActive
                    ? { backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }
                    : { color: "var(--color-muted)" }
                }
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="flex-1 p-6 relative overflow-hidden">
          {theme === "dark" ? <Fireflies count={18} /> : <Particles count={22} color="212, 168, 83" />}

          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppShell
