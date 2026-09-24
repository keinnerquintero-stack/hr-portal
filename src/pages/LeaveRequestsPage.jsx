import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createLeaveRequest, getLeaveRequestsForEmployee } from "../api";
import "./LeaveRequestsPage.css";

const LEAVE_TYPES = ["Vacation", "Sick Leave", "Personal Leave", "Bereavement", "Unpaid Leave"];
const statusBadge = {
  Pending: "badge-warning",
  Approved: "badge-success",
  Rejected: "badge-danger",
};

export default function LeaveRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: LEAVE_TYPES[0],
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, [user.id]);

  async function load() {
    setLoading(true);
    const data = await getLeaveRequestsForEmployee(user.id);
    setRequests(data.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn)));
    setLoading(false);
  }

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date cannot be before the start date.");
      return;
    }

    setSubmitting(true);
    try {
      await createLeaveRequest({
        ...form,
        employeeId: user.id,
        employeeName: user.name,
        status: "Pending",
        appliedOn: new Date().toISOString().slice(0, 10),
      });
      setForm({ type: LEAVE_TYPES[0], startDate: "", endDate: "", reason: "" });
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Leave Requests</h1>
          <p className="dashboard-subtitle">
            You have {user.leaveBalance} day(s) of leave available. Submit a new request or track your history below.
          </p>
        </div>
      </div>

      <div className="leave-layout">
        <div className="card card-padded">
          <h3 className="widget-title">New Request</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Leave type</label>
              <select value={form.type} onChange={update("type")}>
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-grid-2">
              <div className="field">
                <label>Start date</label>
                <input type="date" value={form.startDate} onChange={update("startDate")} required />
              </div>
              <div className="field">
                <label>End date</label>
                <input type="date" value={form.endDate} onChange={update("endDate")} required />
              </div>
            </div>
            <div className="field">
              <label>Reason</label>
              <textarea value={form.reason} onChange={update("reason")} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit request"}
            </button>
          </form>
        </div>

        <div className="card card-padded">
          <h3 className="widget-title">Request History</h3>
          {loading ? (
            <p className="widget-empty">Loading…</p>
          ) : requests.length === 0 ? (
            <div className="empty-state">You haven't submitted any leave requests yet.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>{r.type}</td>
                    <td>
                      {r.startDate} → {r.endDate}
                    </td>
                    <td className="reason-cell">{r.reason}</td>
                    <td>
                      <span className={`badge ${statusBadge[r.status] ?? "badge-neutral"}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
