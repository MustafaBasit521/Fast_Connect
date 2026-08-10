import SignUp from "./pages/SignUp"
import Login from "./pages/Login"
import ChangePassword from "./pages/ChangePassword"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import MyProfile from "./pages/MyProfile"
import ViewProfile from "./pages/ViewProfile"
import Feed from "./pages/Feed"

function App() {
  return (
    <div>
      <h1>FAST Connect</h1>
      <SignUp />
      <Login />
      <ChangePassword />
      <ForgotPassword />
      <ResetPassword />
      <MyProfile />
      <ViewProfile />
      <Feed />
    </div>
  )
}

export default App
