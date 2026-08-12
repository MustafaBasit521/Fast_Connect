import { useState } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { initials } from "../utils/initials"
import Particles from "../components/Particles"
import Fireflies from "../components/Fireflies"

const navItems = [
  { to: "/feed", label: "Feed", icon: "🏠" },
  { to: "/friends", label: "Friends", icon: "👥" },
  { to: "/messages", label: "Messages", icon: "💬" },
  { to: "/search", label: "Search", icon: "🔍" },
  { to: "/profile", label: "Profile", icon: "👤" },
]

function AppShell() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="hidden md:flex w-8 h-8 items-center justify-center rounded hover:opacity-70 text-lg transition-transform duration-200" 
            style={{ color: "var(--color-muted)", transform: isSidebarOpen ? "rotate(0deg)" : "rotate(180deg)" }}
            aria-label="Toggle Sidebar"
          >
            ☰
          </button>
          <div
            className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm shrink-0"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
          >
            FC
          </div>
          <span className="font-semibold hidden sm:inline">FAST Connect</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 relative">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-full border flex items-center justify-center shrink-0"
            style={{ borderColor: "var(--color-border)" }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <button
            aria-label="Notifications"
            className="w-9 h-9 rounded-full border flex items-center justify-center shrink-0"
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

      <div className="flex flex-1 overflow-hidden">
        <div 
          className={`hidden md:flex shrink-0 border-r flex-col gap-2 py-4 px-2 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-48' : 'w-[4.5rem] items-center'}`} 
          style={{ borderColor: "var(--color-border)" }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm py-2 rounded font-medium flex items-center transition-all duration-200 ${isSidebarOpen ? 'px-3 gap-3 w-full' : 'justify-center w-10 h-10 px-0'}`}
                style={
                  isActive
                    ? { backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }
                    : { color: "var(--color-muted)" }
                }
                title={!isSidebarOpen ? item.label : ""}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
              </Link>
            )
          })}
        </div>

        <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6 relative overflow-hidden overflow-x-hidden">
          {theme === "dark" ? <Fireflies count={18} /> : <Particles count={22} color="212, 168, 83" />}

          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
      </div>

      <div
        className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around border-t py-2 z-30"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-0.5 px-2 py-1 text-xs font-medium"
              style={{ color: isActive ? "var(--color-primary)" : "var(--color-muted)" }}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default AppShell
