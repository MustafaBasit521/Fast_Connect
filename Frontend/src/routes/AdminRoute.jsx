import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="p-6">Loading...</p>
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/feed" replace />
  }

  return children
}

export default AdminRoute
