import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  createLeaveRequest,
  createPunchRequest,
  createTimesheet,
  getLeaveRequestsForEmployee,
  getPunchRequestsForEmployee,
  getScheduleForEmployee,
  getTimesheetsForEmployee,
} from "../api";
import "./TimeManagementPage.css";

const TABS = [
  { key: "leave", label: "Leave Requests" },
  { key: "timesheets", label: "Web Time Sheets" },
  { key: "punch", label: "Punch Change Requests" },
  { key: "schedule", label: "Scheduling" },
];

const statusBadge = {
  Pending: "badge-warning",
  Approved: "badge-success",
  Rejected: "badge-danger",
  Submitted: "badge-warning",
};

export default function TimeManagementPage() {
  const [tab, setTab] = useState("leave");

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Time Management</h1>
          <p className="dashboard-subtitle">
            Request time off, submit timesheets, fix punch errors, and check your schedule.
          </p>
        </div>
      </div>

      <div className="section-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`section-tab${tab === t.key ? " section-tab-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-pop" key={tab}>
        {tab === "leave" && <LeaveTab />}
        {tab === "timesheets" && <TimesheetsTab />}
        {tab === "punch" && <PunchTab />}
        {tab === "schedule" && <ScheduleTab />}
      </div>
    </div>
  );
}

const LEAVE_TYPES = ["Vacation", "Sick Leave", "Personal Leave", "Bereavement", "Unpaid Leave"];

function LeaveTab() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ type: LEAVE_TYPES[0], startDate: "", endDate: "", reason: "" });
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
    <div className="tm-layout">
      <div className="card card-padded">
        <h3 className="widget-title">New Leave Request</h3>
        <p className="stat-caption" style={{ marginTop: -8 }}>
          {user.leaveBalance} day(s) available
        </p>
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
  );
}

function TimesheetsTab() {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ payPeriodStart: "", payPeriodEnd: "", hours: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, [user.id]);

  async function load() {
    setLoading(true);
    const data = await getTimesheetsForEmployee(user.id);
    setTimesheets(data.sort((a, b) => new Date(b.payPeriodEnd) - new Date(a.payPeriodEnd)));
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTimesheet({
        employeeId: user.id,
        payPeriodStart: form.payPeriodStart,
        payPeriodEnd: form.payPeriodEnd,
        status: "Submitted",
        entries: [{ date: form.payPeriodStart, hours: Number(form.hours) }],
      });
      setForm({ payPeriodStart: "", payPeriodEnd: "", hours: "" });
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="tm-layout">
      <div className="card card-padded">
        <h3 className="widget-title">Submit Time Sheet</h3>
        <p className="stat-caption" style={{ marginTop: -8 }}>
          Report your total hours for a pay period for HR review and approval.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="field">
              <label>Pay period start</label>
              <input
                type="date"
                value={form.payPeriodStart}
                onChange={(e) => setForm((f) => ({ ...f, payPeriodStart: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label>Pay period end</label>
              <input
                type="date"
                value={form.payPeriodEnd}
                onChange={(e) => setForm((f) => ({ ...f, payPeriodEnd: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="field">
            <label>Total hours worked</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.hours}
              onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit for approval"}
          </button>
        </form>
      </div>

      <div className="card card-padded">
        <h3 className="widget-title">Timesheet History</h3>
        {loading ? (
          <p className="widget-empty">Loading…</p>
        ) : timesheets.length === 0 ? (
          <div className="empty-state">No timesheets submitted yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Pay Period</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {timesheets.map((t) => (
                <tr key={t.id}>
                  <td>
                    {t.payPeriodStart} → {t.payPeriodEnd}
                  </td>
                  <td>{t.entries.reduce((sum, e) => sum + e.hours, 0)} hrs</td>
                  <td>
                    <span className={`badge ${statusBadge[t.status] ?? "badge-neutral"}`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function PunchTab() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ date: "", requestedTime: "", type: "Clock In Correction", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, [user.id]);

  async function load() {
    setLoading(true);
    const data = await getPunchRequestsForEmployee(user.id);
    setRequests(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createPunchRequest({
        ...form,
        employeeId: user.id,
        employeeName: user.name,
        status: "Pending",
      });
      setForm({ date: "", requestedTime: "", type: "Clock In Correction", reason: "" });
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="tm-layout">
      <div className="card card-padded">
        <h3 className="widget-title">Request a Punch Correction</h3>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Request type</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option>Clock In Correction</option>
              <option>Clock Out Correction</option>
              <option>Missed Punch</option>
            </select>
          </div>
          <div className="form-grid-2">
            <div className="field">
              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label>Correct time</label>
              <input
                type="text"
                placeholder="e.g. 08:55 AM"
                value={form.requestedTime}
                onChange={(e) => setForm((f) => ({ ...f, requestedTime: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="field">
            <label>Reason</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              required
            />
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
          <div className="empty-state">No punch correction requests yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Date</th>
                <th>Requested Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.type}</td>
                  <td>{r.date}</td>
                  <td>{r.requestedTime}</td>
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
  );
}

function ScheduleTab() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScheduleForEmployee(user.id).then((data) => {
      setSchedule(data);
      setLoading(false);
    });
  }, [user.id]);

  if (loading) return <p className="widget-empty">Loading…</p>;

  return (
    <div className="card card-padded">
      <h3 className="widget-title">This Week's Schedule</h3>
      {!schedule ? (
        <div className="empty-state">No schedule has been assigned yet. Check with your manager or HR.</div>
      ) : (
        <>
          <p className="stat-caption" style={{ marginTop: -8 }}>
            Week of {schedule.weekOf}
          </p>
          <div className="schedule-grid">
            {schedule.shifts.map((s) => (
              <div key={s.day} className="schedule-day">
                <span className="schedule-day-label">{s.day}</span>
                <span className="schedule-day-time">
                  {s.start} – {s.end}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
