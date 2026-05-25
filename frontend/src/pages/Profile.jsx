import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import API from "../config"

const getInitials = (name = "") => {
  const initials = name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return initials || "LB"
}

function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token")
      const wallet_id = localStorage.getItem("wallet_id")
      if (!token || !wallet_id) { navigate("/login"); return }

      try {
        const res = await axios.get(`${API}/balance/${wallet_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(res.data)
      } catch (err) {
        console.error("Profile load error:", err)
        navigate("/login")
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [navigate])

  if (loading) return <p style={{ padding: "20px" }}>Loading profile...</p>
  if (!user) return null

  const avatarStyle = {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    display: "grid",
    placeItems: "center",
    marginBottom: "16px",
    background: "#e8f8ef",
    color: "#16a34a",
    fontWeight: "800",
    fontSize: "28px"
  }

  return (
    <div style={{ padding: "20px", maxWidth: "500px", width: "100%", boxSizing: "border-box" }}>
      <h2>Profile</h2>

      {user.profile_image ? (
        <img src={user.profile_image} alt="profile" style={avatarStyle} />
      ) : (
        <div style={avatarStyle} aria-label="Default profile avatar">
          {getInitials(user.name)}
        </div>
      )}

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
        <p style={{ marginBottom: "12px" }}><strong>Name:</strong> {user.name || "N/A"}</p>
        <p style={{ marginBottom: "12px", wordBreak: "break-word" }}><strong>Email:</strong> {user.email || "N/A"}</p>
        <p style={{ marginBottom: "12px" }}><strong>Phone:</strong> {user.phone || "N/A"}</p>
        <p style={{ marginBottom: "12px" }}><strong>Country:</strong> {user.country || "N/A"}</p>
        <p style={{ marginBottom: "12px", wordBreak: "break-all" }}><strong>Wallet ID:</strong> {user.wallet_id || "N/A"}</p>
        <p style={{ marginBottom: 0 }}><strong>Balance:</strong> <span style={{ color: "#16c47f", fontWeight: "bold" }}>₦{user.balance ?? "0"}</span></p>
      </div>
    </div>
  )
}

export default Profile
