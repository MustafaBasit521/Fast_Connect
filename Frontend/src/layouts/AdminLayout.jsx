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
      <div className="w-56 bg-blue-950 text-white flex flex-col p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center font-bold text-blue-950 text-sm">FC</div>
          <span className="font-semibold">FAST Connect</span>
        </div>

        <span className="text-xs uppercase tracking-wide text-blue-300 mb-2">Admin</span>
        <Link to="/admin" className="py-2 px-3 rounded bg-blue-900">Dashboard</Link>
        <Link to="/feed" className="py-2 px-3 rounded text-blue-200 mt-4">Back to app</Link>
        <button onClick={handleLogout} className="py-2 px-3 rounded text-red-300 mt-auto text-left">Log out</button>

        <p className="text-xs text-blue-400 mt-4">{user?.name}</p>
      </div>

      <div className="flex-1 p-8 bg-gray-50">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout
