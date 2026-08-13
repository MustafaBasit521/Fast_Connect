import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { ToastProvider } from "./context/ToastContext"
import ProtectedRoute from "./routes/ProtectedRoute"

import AuthLayout from "./layouts/AuthLayout"
import AppShell from "./layouts/AppShell"

import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Feed from "./pages/Feed"
import FriendsPage from "./pages/FriendsPage"
import MessagesPage from "./pages/MessagesPage"
import MyProfile from "./pages/MyProfile"
import SearchProfile from "./pages/SearchProfile"
import ViewProfile from "./pages/ViewProfile"
import EventsPage from "./pages/EventsPage"
import ResourcesPage from "./pages/ResourcesPage"
import CampusMapPage from "./pages/CampusMapPage"
import TrendingPage from "./pages/TrendingPage"
import VerifyEmailPage from "./pages/VerifyEmailPage"
import TermsPage from "./pages/TermsPage"
import PrivacyPage from "./pages/PrivacyPage"

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
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
              <Route path="/search" element={<SearchProfile />} />
              <Route path="/profile/:userId" element={<ViewProfile />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/campus-map" element={<CampusMapPage />} />
              <Route path="/trending" element={<TrendingPage />} />
            </Route>

            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
