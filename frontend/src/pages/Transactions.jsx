import { useEffect, useState } from "react"
import axios from "axios"
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts"
import API from "../config"

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const token = localStorage.getItem("token")

  useEffect(() => { loadTransactions() }, [])

  const loadTransactions = async () => {
    try {
      const res = await axios.get(`${API}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) { setTransactions(res.data.transactions) }
    } catch (err) { console.log(err) }
  }

  const chartData = transactions.map((tx) => ({
    name: new Date(tx.created_at).toLocaleDateString(),
    amount: tx.amount
  }))

  return (
    <div style={{ padding: "20px", maxWidth: "100%", overflowX: "hidden" }}>
      <h2>Transactions</h2>

      <div style={{ background: "#fff", padding: "20px", borderRadius: "10px" }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: "20px" }}>
        {transactions.map((tx, index) => {
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

export default Transactions