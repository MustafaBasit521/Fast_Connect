import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./routes/ProtectedRoute"
import AdminRoute from "./routes/AdminRoute"

import AuthLayout from "./layouts/AuthLayout"
import AppShell from "./layouts/AppShell"
import AdminLayout from "./layouts/AdminLayout"

import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Feed from "./pages/Feed"
import FriendsPage from "./pages/FriendsPage"
import MessagesPage from "./pages/MessagesPage"
import MyProfile from "./pages/MyProfile"
import AdminDashboard from "./pages/AdminDashboard"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/feed" element={<Feed />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/profile" element={<MyProfile />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
