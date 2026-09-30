import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  ArrowRightLeft,
  ClipboardList,
  LogOut,
  Shield,
} from "lucide-react";


function Layout({ children }) {
  const navigate = useNavigate();

  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="app-layout">

      <aside className="sidebar">

        <div className="sidebar-brand">
          <Shield size={30} />
          <div>
            <h2>MAMS</h2>
            <span>Asset Management</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <NavLink to="/dashboard">
            <LayoutDashboard size={19} />
            Dashboard
          </NavLink>

          <NavLink to="/purchases">
            <ShoppingCart size={19} />
            Purchases
          </NavLink>

          <NavLink to="/transfers">
            <ArrowRightLeft size={19} />
            Transfers
          </NavLink>

          {role !== "LOGISTICS" && (
            <NavLink to="/operations">
              <ClipboardList size={19} />
              Assignments & Expenditures
            </NavLink>
          )}

        </nav>

        <div className="sidebar-footer">

          <div className="user-info">
            <strong>{username}</strong>
            <span>
              {role?.replace("_", " ")}
            </span>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

      <main className="main-content">
        {children}
      </main>

    </div>
  );
}

export default Layout;