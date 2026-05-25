import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../styles/dashboard.css"
import { toast } from "react-toastify"
import { FaArrowDown, FaBell, FaExchangeAlt, FaPaperPlane, FaPlus, FaReceipt, FaSignOutAlt, FaUserCircle, FaWallet } from "react-icons/fa"
import API from "../config" // USE CONFIGURED API URL

const formatCurrency = (value) => {
  const normalizedValue = typeof value === "string" ? value.replace(/,/g, "") : value
  const parsedValue = Number(normalizedValue || 0)
  const safeValue = Number.isNaN(parsedValue) ? 0 : parsedValue

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(safeValue)
}

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

const getGreeting = () => {
  const hour = new Date().getHours()

  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [receiver, setReceiver] = useState("")
  const [amount, setAmount] = useState("")
  const [transactions, setTransactions] = useState([])
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const loadData = useCallback(async () => {
    const wallet = localStorage.getItem("wallet_id")
    const token = localStorage.getItem("token")
    if (!wallet || !token) { navigate("/login"); return }
    try {
      const res = await axios.get(`${API}/balance/${wallet}`, { headers: { Authorization: `Bearer ${token}` } })
      setUser(res.data)
      const tx = await axios.get(`${API}/transactions`, { headers: { Authorization: `Bearer ${token}` } })
      const nextTransactions = tx.data.transactions || []
      setTransactions(nextTransactions)
      setUnreadCount(nextTransactions.length)
    } catch {
      localStorage.clear(); navigate("/login")
    } finally { setLoading(false) }
  }, [navigate])

  useEffect(() => { loadData() }, [loadData])

  const sendMoney = async () => {
    const token = localStorage.getItem("token")
    try {
      const res = await axios.post(`${API}/send-money`, { receiver_wallet: receiver, amount }, { headers: { Authorization: `Bearer ${token}` } })
      res.data.success ? toast.success(res.data.message) : toast.error(res.data.message)
      loadData()
    } catch (err) { toast.error(err.response?.data?.message || "Transfer failed") }
  }

  const depositMoney = async () => {
    const wallet_id = localStorage.getItem("wallet_id")
    const token = localStorage.getItem("token")
    try {
      const res = await axios.post(`${API}/deposit`, { wallet_id, amount: depositAmount }, { headers: { Authorization: `Bearer ${token}` } })
      res.data.success ? toast.success(res.data.message) : toast.error(res.data.message)
      setDepositAmount(""); loadData()
    } catch (err) { toast.error(err.response?.data?.message || "Deposit failed") }
  }

  const withdrawMoney = async () => {
    const wallet_id = localStorage.getItem("wallet_id")
    const token = localStorage.getItem("token")
    try {
      const res = await axios.post(`${API}/withdraw`, { wallet_id, amount: withdrawAmount }, { headers: { Authorization: `Bearer ${token}` } })
      res.data.success ? toast.success(res.data.message) : toast.error(res.data.message)
      setWithdrawAmount(""); loadData()
    } catch (err) { toast.error(err.response?.data?.message || "Withdrawal failed") }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login", { replace: true })
  }

  const scrollToCard = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const toggleNotifications = () => {
    setNotificationsOpen((isOpen) => {
      const nextOpen = !isOpen
      if (nextOpen) setUnreadCount(0)
      return nextOpen
    })
  }

  if (loading) {
    return (
      <div className="dashboard dashboard-loading">
        <div className="loading-card">
          <div className="loading-mark">LB</div>
          <h2>Loading dashboard...</h2>
          <p>Getting your wallet ready</p>
        </div>
      </div>
    )
  }

  const firstName = user?.name?.split(" ")[0] || "there"
  const initials = getInitials(user?.name)
  const myWallet = localStorage.getItem("wallet_id")
  const recentActivities = transactions.slice(0, 5)

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-kicker">Leo Bank Dashboard</span>
          <h1>{getGreeting()}, {firstName}</h1>
          <p>Move money, top up your wallet, and track every naira in one place.</p>
        </div>

        <div className="dashboard-header-actions">
          <div className="notification-wrap">
            <button className="icon-button notification-button" type="button" onClick={toggleNotifications} aria-label="Notifications" aria-expanded={notificationsOpen}>
              <FaBell />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </button>

            {notificationsOpen && (
              <div className="notification-dropdown">
                <div className="notification-dropdown-header">
                  <strong>Notifications</strong>
                  <span>{recentActivities.length} recent</span>
                </div>

                {recentActivities.length === 0 ? (
                  <div className="notification-empty">
                    <FaBell />
                    <p>No notifications yet</p>
                  </div>
                ) : recentActivities.map((tx, index) => {
                  const isCredit = tx.receiver_wallet === myWallet
                  const activityTitle = tx.type === "deposit"
                    ? "Deposit successful"
                    : tx.type === "withdraw"
                      ? "Withdrawal successful"
                      : isCredit
                        ? `Money received from ${tx.sender_name}`
                        : `Money sent to ${tx.receiver_name}`

                  return (
                    <div key={index} className="notification-item">
                      <span className={`notification-dot ${isCredit ? "credit" : "debit"}`}></span>
                      <div>
                        <strong>{activityTitle}</strong>
                        <p>{new Date(tx.created_at).toLocaleString()}</p>
                      </div>
                      <b className={isCredit ? "credit" : "debit"}>
                        {isCredit ? "+" : "-"}{formatCurrency(Math.abs(Number(String(tx.amount ?? 0).replace(/,/g, ""))))}
                      </b>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className="user-chip">
            <div className="avatar">
              {user?.profile_image ? <img src={user.profile_image} alt={`${user?.name || "Profile"} avatar`} /> : initials}
            </div>
            <span>{user?.name}</span>
          </div>
          <button className="logout-button" type="button" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <section className="balance-card">
        <div className="balance-card-main">
          <span>Available Balance</span>
          <strong>{formatCurrency(user?.balance)}</strong>
          <p>Wallet ID: <b>{user?.wallet_id}</b></p>
        </div>
        <div className="balance-card-icon">
          <FaWallet />
        </div>
      </section>

      <section className="quick-actions" aria-label="Quick actions">
        <button type="button" onClick={() => scrollToCard("send-money-card")}>
          <span><FaPaperPlane /></span>
          Send
        </button>
        <button type="button" onClick={() => scrollToCard("deposit-card")}>
          <span><FaPlus /></span>
          Deposit
        </button>
        <button type="button" onClick={() => scrollToCard("withdraw-card")}>
          <span><FaArrowDown /></span>
          Withdraw
        </button>
      </section>

      <div className="dashboard-layout-grid">
        <main className="dashboard-primary">
          <section className="money-grid">
            <article className="money-card money-card-wide" id="send-money-card">
              <div className="card-title-row">
                <div className="card-icon send"><FaPaperPlane /></div>
                <div>
                  <h3>Send Money</h3>
                  <p>Transfer instantly to another Leo Bank wallet.</p>
                </div>
              </div>

              <label htmlFor="receiver-wallet">Receiver Wallet ID</label>
              <input id="receiver-wallet" placeholder="Receiver Wallet ID" value={receiver} onChange={(e) => setReceiver(e.target.value)} />

              <label htmlFor="send-amount">Amount</label>
              <input id="send-amount" placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />

              <button className="primary-action" type="button" onClick={sendMoney}>
                <FaPaperPlane />
                Send Money
              </button>
            </article>

            <article className="money-card" id="deposit-card">
              <div className="card-title-row">
                <div className="card-icon deposit"><FaPlus /></div>
                <div>
                  <h3>Deposit</h3>
                  <p>Add funds to your wallet.</p>
                </div>
              </div>

              <label htmlFor="deposit-amount">Amount</label>
              <input id="deposit-amount" placeholder="Amount" type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />

              <button className="primary-action" type="button" onClick={depositMoney}>
                <FaPlus />
                Deposit
              </button>
            </article>

            <article className="money-card" id="withdraw-card">
              <div className="card-title-row">
                <div className="card-icon withdraw"><FaArrowDown /></div>
                <div>
                  <h3>Withdraw</h3>
                  <p>Move funds out of your wallet.</p>
                </div>
              </div>

              <label htmlFor="withdraw-amount">Amount</label>
              <input id="withdraw-amount" placeholder="Amount" type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />

              <button className="primary-action secondary" type="button" onClick={withdrawMoney}>
                <FaArrowDown />
                Withdraw
              </button>
            </article>
          </section>
        </main>

        <aside className="dashboard-secondary">
          <section className="profile-summary-card">
            <div className="profile-summary-icon">
              {user?.profile_image ? <img className="profile-summary-image" src={user.profile_image} alt={`${user?.name || "Profile"} avatar`} /> : <FaUserCircle />}
            </div>
            <div>
              <span>Account Holder</span>
              <strong>{user?.name}</strong>
              <p>{user?.wallet_id}</p>
            </div>
          </section>

          <section className="transactions-panel">
            <div className="panel-title-row">
              <div>
                <span>Recent Activity</span>
                <h3>Transactions</h3>
              </div>
              <div className="panel-icon"><FaReceipt /></div>
            </div>

            {transactions.length === 0 ? (
              <div className="empty-transactions">
                <FaExchangeAlt />
                <p>No transactions yet</p>
              </div>
            ) : transactions.map((tx, index) => {
              const isCredit = tx.receiver_wallet === myWallet
              return (
                <div key={index} className="transaction-item">
                  <div className={`transaction-type-icon ${isCredit ? "credit" : "debit"}`}>
                    {isCredit ? <FaArrowDown /> : <FaPaperPlane />}
                  </div>
                  <div className="transaction-details">
                    <strong>{isCredit ? `From: ${tx.sender_name}` : `To: ${tx.receiver_name}`}</strong>
                    <p>{new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                  <div className={`transaction-amount ${isCredit ? "credit" : "debit"}`}>
                    {isCredit ? "+" : "-"}{formatCurrency(Math.abs(Number(String(tx.amount ?? 0).replace(/,/g, ""))))}
                  </div>
                </div>
              )
            })}
          </section>
        </aside>
      </div>
    </div>
  )
}

export default Dashboard
