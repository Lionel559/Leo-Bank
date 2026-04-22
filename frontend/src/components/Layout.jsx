import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import "../styles/layout.css"

function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
