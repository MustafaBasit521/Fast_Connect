import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import LoadingScreen from "../components/LoadingScreen"

function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/feed" replace />
  }

  return children
}

export default AdminRoute
