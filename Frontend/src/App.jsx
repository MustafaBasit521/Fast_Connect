import SignUp from "./pages/SignUp"
import Login from "./pages/Login"
import ChangePassword from "./pages/ChangePassword"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"

function App() {
  return (
    <div>
      <h1>FAST Connect</h1>
      <SignUp />
      <Login />
      <ChangePassword />
      <ForgotPassword />
      <ResetPassword />
    </div>
  )
}

export default App
