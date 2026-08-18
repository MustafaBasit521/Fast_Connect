import { useState, useEffect } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { Home, Users, MessageSquare, Calendar, BookOpen, MapPin, Search as SearchIcon, User as UserIcon, Sun, Moon, Bell, Bot, MessageSquareHeart } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { initials } from "../utils/initials"
import Particles from "../components/Particles"
import NotificationsDropdown from "../components/NotificationsDropdown"
import Logo from "../components/Logo"
import { useToast } from "../context/ToastContext"
import { getErrorMessage } from "../utils/errors"

const API = "https://fast-connect-bay.vercel.app"

function authHeaders() {
  const token = localStorage.getItem("token")
  return { "Authorization": `Bearer ${token}` }
}

const navItems = [
  { to: "/feed", label: "Feed", icon: Home },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/resources", label: "Resources", icon: BookOpen },
  { to: "/campus-map", label: "Campus Map", icon: MapPin },
  { to: "/search", label: "Search", icon: SearchIcon },
  { to: "/profile", label: "Profile", icon: UserIcon },
]

// Profile is already reachable via the avatar menu, and Search gets its own
// icon in the mobile top bar — keeps the bottom tab bar to items that fit
// on a phone screen in one row, no wrapping/scrolling needed.
const mobileNavItems = navItems.filter((item) => item.to !== "/profile" && item.to !== "/search")

function AppShell() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [verifyBannerDismissed, setVerifyBannerDismissed] = useState(false)
  const [resending, setResending] = useState(false)

  async function handleResendVerification() {
    setResending(true)
    const response = await fetch(`${API}/auth/resend-verification`, { method: "POST", headers: authHeaders() })
    const data = await response.json()
    setResending(false)

    if (response.ok) {
      addToast("Verification email sent — check your inbox.", "success")
    } else {
      addToast(getErrorMessage(data), "error")
    }
  }

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
      className="h-screen flex flex-col"
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
          <Link
            to="/search"
            aria-label="Search"
            className="md:hidden w-9 h-9 rounded-full border flex items-center justify-center shrink-0"
            style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
          >
            <SearchIcon className="w-4 h-4" />
          </Link>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-full border flex items-center justify-center shrink-0"
            style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
          >
            {theme === "light" ? <Moon className="w-4 h-4" strokeWidth={1.75} /> : <Sun className="w-4 h-4" strokeWidth={1.75} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notifications"
              className="w-9 h-9 rounded-full border flex items-center justify-center shrink-0 relative"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
            >
              <Bell className="w-4 h-4" strokeWidth={1.75} />
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

      {user && !user.email_verified && !verifyBannerDismissed && (
        <div
          className="flex items-center justify-between gap-3 px-4 md:px-6 py-2 text-sm flex-wrap"
          style={{ backgroundColor: "rgba(212, 168, 83, 0.15)", borderBottom: "1px solid var(--color-border)" }}
        >
          <span>📧 Please verify your email to make sure you don't lose access to your account.</span>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={handleResendVerification} disabled={resending} className="font-semibold disabled:opacity-50" style={{ color: "var(--color-accent)" }}>
              {resending ? "Sending..." : "Resend email"}
            </button>
            <button onClick={() => setVerifyBannerDismissed(true)} aria-label="Dismiss" style={{ color: "var(--color-muted)" }}>×</button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div 
          className={`hidden md:flex shrink-0 border-r flex-col gap-2 py-4 px-2 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-48' : 'w-[4.5rem] items-center'}`} 
          style={{ borderColor: "var(--color-border)" }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-hover text-sm py-2 rounded font-medium flex items-center transition-all duration-200 ${isSidebarOpen ? 'px-3 gap-3 w-full' : 'justify-center w-10 h-10 px-0'}`}
                style={
                  isActive
                    ? { backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }
                    : { color: "var(--color-muted)" }
                }
                title={!isSidebarOpen ? item.label : ""}
              >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={1.75} />
                {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
              </Link>
            )
          })}

          <Link
            to="/feedback"
            className={`nav-hover text-sm py-2 rounded font-medium flex items-center transition-all duration-200 mt-auto ${isSidebarOpen ? 'px-3 gap-3 w-full' : 'justify-center w-10 h-10 px-0'}`}
            style={{ color: "var(--color-muted)" }}
            title={!isSidebarOpen ? "Feedback" : ""}
          >
            <MessageSquareHeart className="w-5 h-5 shrink-0" strokeWidth={1.75} />
            {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden">Feedback</span>}
          </Link>

          {isSidebarOpen && (
            <p className="text-xs text-center px-2 pt-1" style={{ color: "var(--color-muted)" }}>
              Built by a FAST-NUCES student
            </p>
          )}
        </div>

        <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6 relative overflow-y-auto overflow-x-hidden">
          {theme === "light" && <Particles count={22} color="212, 168, 83" />}

          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
      </div>

      <div
        className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around border-t py-2 px-1 z-30"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        {mobileNavItems.map((item) => {
          const isActive = location.pathname === item.to
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-0.5 px-2.5 py-1 text-xs font-medium shrink-0 whitespace-nowrap"
              style={{ color: isActive ? "var(--color-primary)" : "var(--color-muted)" }}
            >
              <Icon className="w-5 h-5" strokeWidth={1.75} />
              {item.label}
            </Link>
          )
        })}
      </div>

      {location.pathname !== "/messages" && (
        <Link
          to="/messages"
          aria-label="Chat with FAST AI"
          className="fixed bottom-20 md:bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
        >
          <Bot className="w-6 h-6" strokeWidth={1.75} />
        </Link>
      )}
    </div>
  )
}

export default AppShell
