import { useState } from "react";


function Login(){

    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [message,setMessage]=useState("")


    async function handleSubmit(e){
        e.preventDefault()

    const response = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({email, password }),
    })

    const data = await response.json()

    if (response.ok) {
        localStorage.setItem("token",data.access_token)
      setMessage("logged in successfully!")
    } else {
      setMessage(data.detail)
    }


    }
    return(
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-xs mb-8">
      <h2 className="font-bold">Log In</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-gray-400 rounded px-2 py-1" />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border border-gray-400 rounded px-2 py-1" />
      <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1">Log In</button>
      <p>{message}</p>
    </form>
    )

}

export default Login