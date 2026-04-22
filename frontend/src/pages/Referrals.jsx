import { useEffect, useState } from "react"

function Referrals() {
  const [code, setCode] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // wallet_id is the referral code
    const wallet = localStorage.getItem("wallet_id")
    if (wallet) setCode(wallet)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ padding: "20px", maxWidth: "500px", boxSizing: "border-box" }}>
      <h2>Referrals</h2>
      <p style={{ color: "#555", marginBottom: "20px" }}>
        Share your referral code with friends. When they register using your code,
        <strong> you both get a ₦500 bonus!</strong>
      </p>

      {code ? (
        <div style={{
          background: "#f0fdf4",
          border: "1px dashed #16c47f",
          borderRadius: "10px",
          padding: "20px",
        }}>
          <p style={{ margin: "0 0 8px", color: "#555", fontSize: "13px" }}>Your referral code:</p>
          <h3 style={{
            margin: "0 0 16px",
            fontSize: "20px",
            color: "#16c47f",
            wordBreak: "break-all",
            letterSpacing: "2px"
          }}>
            {code}
          </h3>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? "#16a34a" : "#16c47f",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "0.2s",
              width: "100%"
            }}
          >
            {copied ? "✅ Copied!" : "📋 Copy Code"}
          </button>
        </div>
      ) : (
        <p>No referral code found. Please log in again.</p>
      )}
    </div>
  )
}

export default Referrals
