import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const groups = [
  {
    label: "Overview",
    links: [{ to: "/", label: "Dashboard", icon: "▦", end: true }],
  },
  {
    label: "My Workspace",
    links: [
      { to: "/profile", label: "My Profile", icon: "👤" },
      { to: "/time", label: "Time Management", icon: "🗓" },
      { to: "/benefits", label: "Benefits", icon: "🩺" },
      { to: "/payroll", label: "Payroll", icon: "💵" },
      { to: "/documents", label: "Documents", icon: "📄" },
      { to: "/learning", label: "Learning", icon: "🎓" },
    ],
  },
  {
    label: "Company",
    links: [{ to: "/jobs", label: "Job Opportunities", icon: "💼" }],
  },
];

export default function Sidebar() {
  const { isHR } = useAuth();

  return (
    <aside className="sidebar">
      {groups.map((group) => (
        <div key={group.label} className="sidebar-group">
          <div className="sidebar-section-label">{group.label}</div>
          <nav className="sidebar-nav">
            {group.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? " sidebar-link-active" : ""}`
                }
              >
                <span className="sidebar-icon">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      ))}

      {isHR && (
        <div className="sidebar-group">
          <div className="sidebar-section-label">HR Staff</div>
          <nav className="sidebar-nav">
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `sidebar-link${isActive ? " sidebar-link-active" : ""}`
              }
            >
              <span className="sidebar-icon">🛡</span>
              Admin Panel
            </NavLink>
          </nav>
        </div>
      )}
    </aside>
  );
}
