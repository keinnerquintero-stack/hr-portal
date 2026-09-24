import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getCertificationsForEmployee, getLearningItemsForEmployee, updateLearningItem } from "../api";
import "./LearningPage.css";

const TABS = ["My Learning", "My Training", "My Certifications"];

const statusBadge = {
  "Not Started": "badge-neutral",
  "In Progress": "badge-warning",
  Completed: "badge-success",
};

const typeIcon = {
  Video: "🎬",
  Course: "📘",
  Training: "📋",
};

export default function LearningPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState(TABS[0]);
  const [items, setItems] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [user.id]);

  async function load() {
    setLoading(true);
    const [learning, certs] = await Promise.all([
      getLearningItemsForEmployee(user.id),
      getCertificationsForEmployee(user.id),
    ]);
    setItems(learning);
    setCertifications(certs);
    setLoading(false);
  }

  async function advanceStatus(item) {
    const next = item.status === "Not Started" ? "In Progress" : "Completed";
    await updateLearningItem(item.id, { status: next });
    await load();
  }

  const visibleItems =
    tab === "My Training" ? items.filter((i) => i.type === "Training") : items;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Learning &amp; Development</h1>
          <p className="dashboard-subtitle">
            Videos, courses, and training assigned by HR, plus your professional certifications.
          </p>
        </div>
      </div>

      <div className="section-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`section-tab${tab === t ? " section-tab-active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="widget-empty">Loading…</p>
      ) : tab === "My Certifications" ? (
        <div className="card card-padded">
          {certifications.length === 0 ? (
            <div className="empty-state">No certifications on file yet.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Certification</th>
                  <th>Issuer</th>
                  <th>Issued</th>
                  <th>Expires</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {certifications.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.issuer}</td>
                    <td>{c.issuedDate}</td>
                    <td>{c.expiryDate}</td>
                    <td>
                      <span className="badge badge-success">{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="card card-padded">
          <div className="empty-state">Nothing assigned here yet.</div>
        </div>
      ) : (
        <div className="learning-grid">
          {visibleItems.map((item) => (
            <div key={item.id} className="card card-padded learning-card">
              <div className="learning-card-top">
                <span className="learning-type-icon">{typeIcon[item.type] ?? "📎"}</span>
                <span className={`badge ${statusBadge[item.status]}`}>{item.status}</span>
              </div>
              <h4>{item.title}</h4>
              <p className="learning-description">{item.description}</p>
              <p className="mini-list-sub">
                Assigned by {item.assignedBy} on {item.assignedDate}
                {item.dueDate && ` · Due ${item.dueDate}`}
              </p>
              {item.status !== "Completed" && (
                <button className="btn btn-secondary btn-sm" onClick={() => advanceStatus(item)}>
                  {item.status === "Not Started" ? "Start" : "Mark Complete"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
