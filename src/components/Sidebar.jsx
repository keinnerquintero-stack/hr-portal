import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const employeeLinks = [
  { to: "/", label: "Dashboard", icon: "grid" },
  { to: "/profile", label: "My Profile", icon: "user" },
  { to: "/leave", label: "Leave Requests", icon: "calendar" },
];

const hrLinks = [{ to: "/admin", label: "Admin Panel", icon: "shield" }];

const icons = {
  grid: "▦",
  user: "👤",
  calendar: "🗓",
  shield: "🛡",
};

export default function Sidebar() {
  const { isHR } = useAuth();
  const links = isHR ? [...employeeLinks, ...hrLinks] : employeeLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-section-label">Workspace</div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " sidebar-link-active" : ""}`
            }
          >
            <span className="sidebar-icon">{icons[link.icon]}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
