import { Outlet } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import Particles from "../components/Particles"
import Logo from "../components/Logo"

function AuthLayout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}>
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="fixed top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center border"
        style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)" }}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      <div
        className="hidden md:flex md:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ backgroundColor: "var(--color-panel)", color: "var(--color-panel-text)" }}
      >
        {theme === "light" && <Particles />}

        <div className="relative z-10">
          <Logo className="h-9 w-auto" />
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">Built for the FAST-NUCES community.</h1>
          <p className="opacity-80">Posts, clubs, friends and DMs — one network for the Lahore campus.</p>
        </div>

        <p className="text-sm opacity-60 relative z-10">LAHORE CAMPUS · lhr.nu.edu.pk</p>
      </div>

      <div className="w-full md:w-1/2 flex flex-col md:items-center md:justify-center p-6 sm:p-8">
        <div className="flex md:hidden items-center mb-8 mt-4">
          <Logo className="h-8 w-auto" />
        </div>

        <div className="w-full max-w-sm md:mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
