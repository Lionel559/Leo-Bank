import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../styles/dashboard.css"
import { toast } from "react-toastify"

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [receiver, setReceiver] = useState("")
  const [amount, setAmount] = useState("")
  const [transactions, setTransactions] = useState([])
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const wallet = localStorage.getItem("wallet_id")
    const token = localStorage.getItem("token")
    if (!wallet || !token) { navigate("/login"); return }
    try {
      const res = await axios.get(`http://localhost:5000/balance/${wallet}`, { headers: { Authorization: `Bearer ${token}` } })
      setUser(res.data)
      const tx = await axios.get(`http://localhost:5000/transactions`, { headers: { Authorization: `Bearer ${token}` } })
      setTransactions(tx.data.transactions || [])
    } catch (err) {
      localStorage.clear(); navigate("/login")
    } finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const sendMoney = async () => {
    const token = localStorage.getItem("token")
    try {
      const res = await axios.post("http://localhost:5000/send-money", { receiver_wallet: receiver, amount }, { headers: { Authorization: `Bearer ${token}` } })
      res.data.success ? toast.success(res.data.message) : toast.error(res.data.message)
      loadData()
    } catch (err) { toast.error(err.response?.data?.message || "Transfer failed") }
  }

  const depositMoney = async () => {
    const wallet_id = localStorage.getItem("wallet_id")
    const token = localStorage.getItem("token")
    try {
      const res = await axios.post("http://localhost:5000/deposit", { wallet_id, amount: depositAmount }, { headers: { Authorization: `Bearer ${token}` } })
      res.data.success ? toast.success(res.data.message) : toast.error(res.data.message)
      setDepositAmount(""); loadData()
    } catch (err) { toast.error(err.response?.data?.message || "Deposit failed") }
  }

  const withdrawMoney = async () => {
    const wallet_id = localStorage.getItem("wallet_id")
    const token = localStorage.getItem("token")
    try {
      const res = await axios.post("http://localhost:5000/withdraw", { wallet_id, amount: withdrawAmount }, { headers: { Authorization: `Bearer ${token}` } })
      res.data.success ? toast.success(res.data.message) : toast.error(res.data.message)
      setWithdrawAmount(""); loadData()
    } catch (err) { toast.error(err.response?.data?.message || "Withdrawal failed") }
  }

  if (loading) return <h2 style={{ padding: "20px" }}>Loading dashboard...</h2>

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="cards">
        <div className="card"><h3>Account Holder</h3><p>{user?.name}</p></div>
        <div className="card"><h3>Wallet ID</h3><p style={{ wordBreak: "break-all", fontSize: "13px" }}>{user?.wallet_id}</p></div>
        <div className="card"><h3>Balance</h3><p className="balance">₦{user?.balance}</p></div>
      </div>

      <div className="section">
        <div className="send-box">
          <h3>Send Money</h3>
          <input placeholder="Receiver Wallet ID" value={receiver} onChange={(e) => setReceiver(e.target.value)} />
          <input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button onClick={sendMoney}>Send</button>
        </div>
      </div>

      <div className="row">
        <div className="send-box">
          <h3>Deposit</h3>
          <input placeholder="Amount" type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
          <button onClick={depositMoney}>Deposit</button>
        </div>
        <div className="send-box">
          <h3>Withdraw</h3>
          <input placeholder="Amount" type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button onClick={withdrawMoney}>Withdraw</button>
        </div>
      </div>

      <div className="transactions">
        <h3>Transactions</h3>
        {transactions.length === 0 ? <p>No transactions yet</p> : transactions.map((tx, index) => {
          const myWallet = localStorage.getItem("wallet_id")
          const isCredit = tx.receiver_wallet === myWallet
          return (
            <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", background: "#fff", padding: "10px", marginBottom: "8px", borderRadius: "8px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {isCredit ? `From: ${tx.sender_name}` : `To: ${tx.receiver_name}`}
                </strong>
                <p style={{ fontSize: "12px", color: "#777", margin: 0 }}>{new Date(tx.created_at).toLocaleString()}</p>
              </div>
              <div style={{ color: isCredit ? "green" : "red", fontWeight: "bold", whiteSpace: "nowrap" }}>
                {isCredit ? "+" : "-"}₦{tx.amount}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Dashboard
