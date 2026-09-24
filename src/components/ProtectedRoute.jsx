import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import "./Sidebar.css";

export function ProtectedRoute({ requireHR = false }) {
  const { isAuthenticated, isHR, loading } = useAuth();

  if (loading) {
    return <div className="spinner-wrap">Loading your workspace…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireHR && !isHR) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-layout-content">
        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="spinner-wrap">Loading…</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
