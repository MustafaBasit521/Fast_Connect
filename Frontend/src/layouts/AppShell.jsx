import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const navItems = [
  { to: "/feed", label: "Feed" },
  { to: "/friends", label: "Friends" },
  { to: "/messages", label: "Messages" },
  { to: "/profile", label: "Profile" },
]

function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-950 text-white flex items-center justify-center font-bold text-sm">FC</div>
          <span className="font-semibold">FAST Connect</span>
        </div>

        <div className="flex items-center gap-4">
          {user?.role === "admin" && (
            <Link to="/admin" className="text-sm text-blue-900 font-medium">Admin Dashboard</Link>
          )}
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={handleLogout} className="text-sm text-red-600">Log out</button>
        </div>
      </div>

      <div className="flex flex-1">
        <div className="w-40 border-r border-gray-200 flex flex-col gap-1 py-4 px-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-sm px-3 py-2 rounded ${location.pathname === item.to ? "bg-blue-100 text-blue-900 font-medium" : "text-gray-600"}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AppShell
