import { NavLink } from "react-router-dom"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaBars, FaTimes, FaHome, FaExchangeAlt, FaUser, FaGift, FaSignOutAlt } from "react-icons/fa"
import "../styles/sidebar.css"

function Sidebar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login", { replace: true })
  }

  const closeMenu = () => setOpen(false)

  return (
    <>
      {/* HAMBURGER — only visible on mobile via CSS */}
      <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
        {open ? <FaTimes /> : <FaBars />}
      </button>

      {/* OVERLAY — dims page behind sidebar on mobile */}
      {open && (
        <div className="sidebar-overlay" onClick={closeMenu} />
      )}

      <div className={`sidebar ${open ? "open" : ""}`}>
        <h2 className="logo">Leo Bank</h2>

        <nav>
          <NavLink to="/dashboard" onClick={closeMenu}><FaHome /> Dashboard</NavLink>
          <NavLink to="/transactions" onClick={closeMenu}><FaExchangeAlt /> Transactions</NavLink>
          <NavLink to="/profile" onClick={closeMenu}><FaUser /> Profile</NavLink>
          <NavLink to="/referrals" onClick={closeMenu}><FaGift /> Referrals</NavLink>
        </nav>

        <button className="logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </>
  )
}

export default Sidebar
