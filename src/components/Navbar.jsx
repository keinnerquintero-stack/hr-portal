import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import "./Navbar.css";

function CompanyInfoMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="dropdown" ref={ref} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="navbar-link navbar-menu-trigger" onClick={() => setOpen((o) => !o)}>
        Company Info ▾
      </button>
      {open && (
        <div className="dropdown-panel dropdown-panel-left company-menu-panel">
          <NavLink to="/about" className="company-menu-item" onClick={() => setOpen(false)}>
            About
          </NavLink>
          <NavLink to="/hr-policy" className="company-menu-item" onClick={() => setOpen(false)}>
            HR Policy
          </NavLink>
          <NavLink to="/employee-policy" className="company-menu-item" onClick={() => setOpen(false)}>
            Employee Policy
          </NavLink>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { isAuthenticated, user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <CompanyInfoMenu />
          {isAuthenticated && (
            <NavLink to="/jobs" className="navbar-link">
              Job Opportunities
            </NavLink>
          )}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <NavLink to="/" end className="navbar-link navbar-link-strong">
                Dashboard
              </NavLink>
              <NotificationBell />
              <div className="navbar-user">
                <div className="navbar-avatar">{user?.name?.charAt(0) ?? "?"}</div>
                <div className="navbar-user-meta">
                  <span className="navbar-user-name">{user?.name}</span>
                  <span className={`badge ${role === "hr" ? "badge-neutral" : "badge-success"}`}>
                    {role === "hr" ? "HR Staff" : "Employee"}
                  </span>
                </div>
              </div>
              <button className="btn btn-outline btn-sm navbar-logout-desktop" onClick={handleLogout}>
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

          <button
            className="navbar-burger"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            type="button"
          >
            ☰
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="navbar-mobile-panel animate-pop">
          <NavLink to="/about" onClick={() => setMobileOpen(false)}>
            About
          </NavLink>
          <NavLink to="/hr-policy" onClick={() => setMobileOpen(false)}>
            HR Policy
          </NavLink>
          <NavLink to="/employee-policy" onClick={() => setMobileOpen(false)}>
            Employee Policy
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/jobs" onClick={() => setMobileOpen(false)}>
                Job Opportunities
              </NavLink>
              <NavLink to="/" end onClick={() => setMobileOpen(false)}>
                Dashboard
              </NavLink>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
