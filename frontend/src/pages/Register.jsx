import { useState } from "react"
import axios from "axios"
import "../styles/auth.css"
import { Link, useNavigate } from "react-router-dom"
import API from "../config"

function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "", password: "", confirmPassword: "", referral: "" })
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState("")

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }) }

  const passwordStrength = () => {
    if (form.password.length === 0) return 0
    if (form.password.length < 6) return 1
    if (form.password.length < 10) return 2
    return 3
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => { setImage(reader.result) }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) { setMessage("Please enter a valid email"); return }
    if (form.phone.length < 7) { setMessage("Phone number is too short"); return }
    if (form.password !== form.confirmPassword) { setMessage("Passwords do not match"); return }

    try {
      setLoading(true)
      const res = await axios.post(`${API}/register`, {
        name: form.name, email: form.email, phone: form.phone,
        country: form.country, password: form.password, referral: form.referral
      })

      if (res.data.success) {
        setMessage(res.data.message)
        navigate("/login")
      } else {
        setMessage(res.data.message)
      }
    } catch (err) {
      console.error(err)
      setMessage("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Full Name" onChange={handleChange} required />
          <input name="email" placeholder="Email" onChange={handleChange} required />
          <input type="tel" name="phone" placeholder="Phone Number" maxLength="11" value={form.phone} required
            onChange={(e) => { const onlyNumbers = e.target.value.replace(/\D/g, ""); setForm({ ...form, phone: onlyNumbers }) }} />

          <select name="country" onChange={handleChange} value={form.country} required>
            <option value="" disabled>Select Country</option>
            <option>Nigeria</option>
          </select>

          <input type="file" onChange={handleImage} />
          {image && <img src={image} alt="preview" className="preview-image" />}

          <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" onChange={handleChange} required />
          <div className="strength-bar"><div className={`strength level-${passwordStrength()}`}></div></div>
          <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />

          <div className="checkbox-row">
            <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
            <label>Show Password</label>
          </div>

          <input name="referral" placeholder="Referral Code (optional)" onChange={handleChange} />

          <div className="checkbox-row">
            <input type="checkbox" required />
            <label>I agree to Terms and Conditions</label>
          </div>

          <button type="submit" disabled={loading}>{loading ? "Creating an account..." : "Register"}</button>
        </form>

        <p>{message}</p>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}

export default Register