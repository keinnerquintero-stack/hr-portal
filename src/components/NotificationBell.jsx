import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAlertsForEmployee, markAlertRead } from "../api";
import Modal from "./Modal";

function timeAgo(dateStr) {
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    let active = true;
    getAlertsForEmployee(user.id).then((data) => {
      if (active) setAlerts(data);
    });
    return () => {
      active = false;
    };
  }, [user.id]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadCount = alerts.filter((a) => !a.read).length;

  async function openAlert(alert) {
    setActiveAlert(alert);
    setOpen(false);
    if (!alert.read) {
      await markAlertRead(alert.id);
      setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, read: true } : a)));
    }
  }

  return (
    <div className="dropdown" ref={ref}>
      <button
        className="bell-button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        type="button"
      >
        🔔
        {unreadCount > 0 && <span className="bell-dot" />}
      </button>

      {open && (
        <div className="dropdown-panel notif-panel">
          <div className="notif-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && <span className="badge badge-warning">{unreadCount} new</span>}
          </div>
          {alerts.length === 0 ? (
            <div className="notif-empty">You're all caught up.</div>
          ) : (
            alerts.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`notif-item${a.read ? "" : " notif-item-unread"}`}
                onClick={() => openAlert(a)}
              >
                <span className="notif-title">{a.title}</span>
                <span className="notif-message">{a.message}</span>
                <span className="notif-date">{timeAgo(a.date)}</span>
              </button>
            ))
          )}
        </div>
      )}

      {activeAlert && (
        <Modal title={activeAlert.title} onClose={() => setActiveAlert(null)}>
          <p className="stat-caption" style={{ marginTop: 0 }}>
            {timeAgo(activeAlert.date)} · {activeAlert.date}
          </p>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>{activeAlert.message}</p>
        </Modal>
      )}
    </div>
  );
}
