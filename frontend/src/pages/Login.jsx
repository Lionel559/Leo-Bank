import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/auth.css"
import { Link, useNavigate } from "react-router-dom"
import API from "../config" // ✅ USE CONFIGURED API URL

function Login(){

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [showPassword,setShowPassword] = useState(false)
  const [remember,setRemember] = useState(false)
  const [message,setMessage] = useState("")
  const [loading,setLoading] = useState(false)

  const navigate = useNavigate()

  // ✅ FIXED: check token ONLY
  useEffect(()=>{
    const token = localStorage.getItem("token")

    if(token){
      navigate("/dashboard", { replace: true })
    }
  },[navigate])

  const handleSubmit = async (e)=>{
    e.preventDefault()

    if(!email || !password){
      setMessage("Please fill all fields")
      return
    }

    try{
      setLoading(true)

      const res = await axios.post(`${API}/login`, {
        email,
        password
      })

      if(res.data.success){

        // ✅ STORE CORRECTLY
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("wallet_id", res.data.user.wallet_id)
        localStorage.setItem("name", res.data.user.name)

        setMessage("Login successful")

        setTimeout(()=>{
          navigate("/dashboard", { replace: true })
        },1000)

      } else {
        setMessage(res.data.message)
      }

    }catch(err){
      setMessage("Server error")
    }finally{
      setLoading(false)
    }
  }

  return(
    <div className="auth-wrapper">
    <div className="auth-card">

      <h2>Login</h2>

      <form onSubmit={handleSubmit}>

        <input
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type={showPassword ? "text":"password"}
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <div className="checkbox-row">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={()=>setShowPassword(!showPassword)}
          />
          <label>Show Password</label>
        </div>

        <div className="checkbox-row">
          <input
            type="checkbox"
            checked={remember}
            onChange={()=>setRemember(!remember)}
          />
          <label>Remember Me</label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

      <p className={message.includes("successful") ? "success-message" : "error-message"}>
        {message}
      </p>

      <p>
        Don't have an account? <Link to="/register">Create an account</Link>
      </p>

    </div>
    </div>
  )
}

export default Login