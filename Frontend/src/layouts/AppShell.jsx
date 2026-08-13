import { useState, useEffect } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { initials } from "../utils/initials"
import Particles from "../components/Particles"
import NotificationsDropdown from "../components/NotificationsDropdown"
import Logo from "../components/Logo"

const API = "https://fast-connect-bay.vercel.app"

function authHeaders() {
  const token = localStorage.getItem("token")
  return { "Authorization": `Bearer ${token}` }
}

const navItems = [
  { to: "/feed", label: "Feed", icon: "🏠" },
  { to: "/friends", label: "Friends", icon: "👥" },
  { to: "/messages", label: "Messages", icon: "💬" },
  { to: "/events", label: "Events", icon: "🎉" },
  { to: "/resources", label: "Resources", icon: "📚" },
  { to: "/campus-map", label: "Campus Map", icon: "🗺️" },
  { to: "/search", label: "Search", icon: "🔍" },
  { to: "/profile", label: "Profile", icon: "👤" },
]

function AppShell() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    async function loadNotifCount() {
      const [reqRes, msgRes] = await Promise.all([
        fetch(`${API}/friends/requests`, { headers: authHeaders() }),
        fetch(`${API}/messages/recent`, { headers: authHeaders() }),
      ])
      const requests = reqRes.ok ? await reqRes.json() : []
      const messages = msgRes.ok ? await msgRes.json() : []
      setNotifCount(requests.length + messages.length)
    }

    loadNotifCount()
  }, [])

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg)", backgroundImage: "var(--bg-pattern)", backgroundSize: "400px 400px" }}
    >
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
          <Logo className="h-7 w-auto shrink-0" />
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

          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notifications"
              className="w-9 h-9 rounded-full border flex items-center justify-center shrink-0 relative"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
            >
              🔔
              {notifCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-danger)" }}
                >
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                <NotificationsDropdown onClose={() => setNotifOpen(false)} />
              </>
            )}
          </div>

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
          {theme === "light" && <Particles count={22} color="212, 168, 83" />}

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
