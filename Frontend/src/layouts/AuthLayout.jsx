import { Outlet } from "react-router-dom"

function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-950 to-blue-900 text-white flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center font-bold text-blue-950">FC</div>
          <span className="font-semibold text-lg">FAST Connect</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4">Built for the FAST-NUCES community.</h1>
          <p className="text-blue-200">Posts, clubs, friends and DMs — one network for the Lahore campus.</p>
        </div>

        <p className="text-blue-300 text-sm">LAHORE CAMPUS · lhr.nu.edu.pk</p>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
