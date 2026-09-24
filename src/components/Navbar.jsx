import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { isAuthenticated, user, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="navbar-logo">HR</span>
          BrightPath Portal
        </NavLink>

        <nav className="navbar-links">
          <NavLink to="/hr-policy" className="navbar-link">
            HR Policy
          </NavLink>
          <NavLink to="/employee-policy" className="navbar-link">
            Employee Policy
          </NavLink>
          <NavLink to="/about" className="navbar-link">
            About
          </NavLink>
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <NavLink to="/" className="navbar-link navbar-link-strong">
                Dashboard
              </NavLink>
              <div className="navbar-user">
                <div className="navbar-avatar">{user?.name?.charAt(0) ?? "?"}</div>
                <div className="navbar-user-meta">
                  <span className="navbar-user-name">{user?.name}</span>
                  <span className={`badge ${role === "hr" ? "badge-neutral" : "badge-success"}`}>
                    {role === "hr" ? "HR Staff" : "Employee"}
                  </span>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-outline btn-sm">
                Log in
              </NavLink>
              <NavLink to="/signup" className="btn btn-primary btn-sm">
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
