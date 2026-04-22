import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Profile() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")

      console.log("RAW user:", storedUser)

      // ❌ if no user → go login
      if (!storedUser || storedUser === "undefined") {
        navigate("/login")
        return
      }

      const parsedUser = JSON.parse(storedUser)

      console.log("PARSED user:", parsedUser)

      // ❌ invalid user → go login
      if (!parsedUser || typeof parsedUser !== "object") {
        navigate("/login")
        return
      }

      setUser(parsedUser)

    } catch (err) {
      console.error("Profile error:", err)
      navigate("/login")
    }
  }, [navigate]) // ✅ IMPORTANT FIX

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/login")
  }

  // 🔥 FIX: better loading state
  if (user === null) {
    return <p>Loading profile...</p>
  }

  return (
    <div style={{ 
      padding: "20px",
      maxWidth: "600px",
      width: "100%",
      boxSizing: "border-box",
      margin: "0 auto"

     }}>
      <h2>Profile</h2>

      {/* IMAGE */}
      {user.image && (
        <img
          src={user.image}
          alt="profile"
          style={{ 
            width: "120px",
            height: "120px",
            maxWidth: "100%",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "16px"
            }}
        />
      )}

      <p style={{ wordBreak: "break-word" }}><strong>Name:</strong> {user.name || "N/A"}</p>
      <p style={{ wordBreak: "break-word" }}><strong>Email:</strong> {user.email || "N/A"}</p>
      <p><strong>Phone:</strong> {user.phone || "N/A"}</p>
      <p><strong>Country:</strong> {user.country || "N/A"}</p>

      {/* REFERRAL */}
      <p style={{ wordBreak: "break-word" }}><strong>Referral Code:</strong> {user.referralCode || "N/A"}</p>

      {/* <button onClick={handleLogout} style={{ marginTop: "20px" }}>
        Logout
      </button> */}
    </div>
  )
}

export default Profile