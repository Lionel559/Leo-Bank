import { useState } from "react"
import axios from "axios"
import "../styles/auth.css"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import API from "../config"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"]

function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "", password: "", confirmPassword: "", referral: "" })
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState("")

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }) }

  const passwordStrength = () => {
    if (form.password.length === 0) return 0
    if (form.password.length < 6) return 1
    if (form.password.length < 10) return 2
    return 3
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) {
      setProfileImage("")
      return
    }

    const extension = file.name.split(".").pop()?.toLowerCase()
    const hasValidMime = !file.type || ALLOWED_IMAGE_TYPES.includes(file.type)
    const isValidType = hasValidMime && ALLOWED_IMAGE_EXTENSIONS.includes(extension)

    if (!isValidType) {
      const message = "Profile picture must be jpg, jpeg, png, or webp"
      setProfileImage("")
      e.target.value = ""
      setMessage(message)
      toast.error(message)
      return
    }

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => { setProfileImage(reader.result) }
      reader.onerror = () => {
        const message = "Could not read profile picture"
        setProfileImage("")
        setMessage(message)
        toast.error(message)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) { setMessage("Please enter a valid email"); toast.error("Please enter a valid email"); return }
    if (form.phone.length < 7) { setMessage("Phone number is too short"); toast.error("Phone number is too short"); return }
    if (!profileImage) { setMessage("Profile picture is required"); toast.error("Profile picture is required"); return }
    if (form.password !== form.confirmPassword) { setMessage("Passwords do not match"); toast.error("Passwords do not match"); return }

    try {
      setLoading(true)
      const res = await axios.post(`${API}/register`, {
        name: form.name, email: form.email, phone: form.phone,
        country: form.country, password: form.password, referral: form.referral.trim(), profile_image: profileImage
      })

      if (res.data.success) {
        setMessage(res.data.message)
        navigate("/login")
      } else {
        setMessage(res.data.message)
        toast.error(res.data.message)
      }
    } catch (err) {
      console.error(err)
      setMessage("Registration failed")
      toast.error("Registration failed")
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

          <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handleImage} required />
          {profileImage && <img src={profileImage} alt="preview" className="preview-image" />}

          <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" onChange={handleChange} required />
          <div className="strength-bar"><div className={`strength level-${passwordStrength()}`}></div></div>
          <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />

          <div className="checkbox-row">
            <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
            <label>Show Password</label>
          </div>

          <input name="referral" placeholder="Referral Code (optional)" value={form.referral} onChange={handleChange} />

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
