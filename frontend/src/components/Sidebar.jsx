import { NavLink, useNavigate } from "react-router-dom"
import { FaExchangeAlt, FaGift, FaHome, FaSignOutAlt, FaUser } from "react-icons/fa"
import "../styles/sidebar.css"

const navItems = [
  { to: "/dashboard", label: "Dashboard", mobileLabel: "Home", icon: <FaHome /> },
  { to: "/transactions", label: "Transactions", mobileLabel: "History", icon: <FaExchangeAlt /> },
  { to: "/profile", label: "Profile", mobileLabel: "Profile", icon: <FaUser /> },
  { to: "/referrals", label: "Referrals", mobileLabel: "Refer", icon: <FaGift /> },
]

function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login", { replace: true })
  }

  return (
    <>
      <aside className="sidebar" aria-label="Desktop navigation">
        <div>
          <div className="sidebar-brand">
            <span className="brand-mark">LB</span>
            <div>
              <h2 className="logo">Leo Bank</h2>
              <p>Digital wallet</p>
            </div>
          </div>

          <nav>
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <button className="logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}>
            {item.icon}
            <span>{item.mobileLabel}</span>
          </NavLink>
        ))}
        <button type="button" onClick={handleLogout} aria-label="Logout">
          <FaSignOutAlt />
          <span>Out</span>
        </button>
      </nav>
    </>
  )
}

export default Sidebar
