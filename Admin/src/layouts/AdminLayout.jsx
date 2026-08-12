import { Outlet, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex">
      <div
        className="w-56 flex flex-col p-4"
        style={{ backgroundColor: "var(--color-panel)", color: "var(--color-panel-text)" }}
      >
        <div className="flex items-center gap-2 mb-8">
          <div
            className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}
          >
            FC
          </div>
          <span className="font-semibold">FAST Connect</span>
        </div>

        <span className="text-xs uppercase tracking-wide opacity-60 mb-2">Admin</span>
        <Link to="/dashboard" className="py-2 px-3 rounded font-medium" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}>
          Dashboard
        </Link>
        <a href="https://fast-connect-frontend-three.vercel.app" className="py-2 px-3 rounded opacity-80 mt-4">
          Visit user site
        </a>
        <button onClick={handleLogout} className="py-2 px-3 rounded mt-auto text-left" style={{ color: "var(--color-danger)" }}>
          Log out
        </button>

        <p className="text-xs opacity-60 mt-4">{user?.name}</p>
      </div>

      <div className="flex-1 p-8" style={{ backgroundColor: "var(--color-bg)" }}>
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout
