import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import {
  createAnnouncement,
  createEmployee,
  createOnboarding,
  deleteAnnouncement,
  deleteEmployee,
  getAnnouncements,
  getEmployees,
  getLeaveRequests,
  getOnboarding,
  updateEmployee,
  updateLeaveRequest,
  updateOnboarding,
} from "../api";
import "./AdminPage.css";

const TABS = [
  { key: "employees", label: "Employee Directory" },
  { key: "leave", label: "Leave Approvals" },
  { key: "onboarding", label: "Onboarding Tracker" },
  { key: "announcements", label: "Announcements" },
];

export default function AdminPage() {
  const [tab, setTab] = useState("employees");

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>HR Admin Panel</h1>
          <p className="dashboard-subtitle">
            Manage employee records, leave approvals, onboarding, and company announcements.
          </p>
        </div>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`admin-tab${tab === t.key ? " admin-tab-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "employees" && <EmployeeDirectory />}
      {tab === "leave" && <LeaveApprovals />}
      {tab === "onboarding" && <OnboardingTracker />}
      {tab === "announcements" && <AnnouncementsManager />}
    </div>
  );
}

const emptyEmployeeForm = {
  name: "",
  email: "",
  phone: "",
  department: "",
  position: "",
  manager: "",
  leaveBalance: 15,
};

function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null);
  const [activeEmployee, setActiveEmployee] = useState(null);
  const [form, setForm] = useState(emptyEmployeeForm);
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setEmployees(await getEmployees());
    setLoading(false);
  }

  function openAdd() {
    setForm(emptyEmployeeForm);
    setModalMode("add");
  }

  function openEdit(emp) {
    setActiveEmployee(emp);
    setForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      position: emp.position,
      manager: emp.manager,
      leaveBalance: emp.leaveBalance,
    });
    setModalMode("edit");
  }

  function update(field) {
    return (e) =>
      setForm((f) => ({
        ...f,
        [field]: field === "leaveBalance" ? Number(e.target.value) : e.target.value,
      }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (modalMode === "add") {
      await createEmployee({
        id: `e${Date.now()}`,
        ...form,
        joinDate: new Date().toISOString().slice(0, 10),
        status: "Active",
      });
    } else {
      await updateEmployee(activeEmployee.id, form);
    }
    setModalMode(null);
    await load();
  }

  async function handleDelete(emp) {
    if (!window.confirm(`Remove ${emp.name} from the directory? This cannot be undone.`)) return;
    await deleteEmployee(emp.id);
    await load();
  }

  const filtered = employees.filter((e) =>
    `${e.name} ${e.department} ${e.position}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card card-padded">
      <div className="admin-panel-header">
        <input
          className="admin-search"
          placeholder="Search by name, department, or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={openAdd}>
          + Add Employee
        </button>
      </div>

      {loading ? (
        <p className="widget-empty">Loading employees…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No employees match your search.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Position</th>
              <th>Email</th>
              <th>Leave Balance</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.department}</td>
                <td>{emp.position}</td>
                <td>{emp.email}</td>
                <td>{emp.leaveBalance} days</td>
                <td className="admin-row-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(emp)}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalMode && (
        <Modal
          title={modalMode === "add" ? "Add New Employee" : `Edit ${activeEmployee.name}`}
          onClose={() => setModalMode(null)}
        >
          <form onSubmit={handleSave}>
            <div className="field">
              <label>Name</label>
              <input value={form.name} onChange={update("name")} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={update("email")} required />
            </div>
            <div className="form-grid-2">
              <div className="field">
                <label>Phone</label>
                <input value={form.phone} onChange={update("phone")} required />
              </div>
              <div className="field">
                <label>Department</label>
                <input value={form.department} onChange={update("department")} required />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="field">
                <label>Position</label>
                <input value={form.position} onChange={update("position")} required />
              </div>
              <div className="field">
                <label>Manager</label>
                <input value={form.manager} onChange={update("manager")} />
              </div>
            </div>
            <div className="field">
              <label>Leave balance (days)</label>
              <input type="number" min="0" value={form.leaveBalance} onChange={update("leaveBalance")} />
            </div>
            <div className="profile-actions">
              <button type="submit" className="btn btn-primary">
                Save Employee
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setModalMode(null)}>
                Close
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

const leaveStatusBadge = {
  Pending: "badge-warning",
  Approved: "badge-success",
  Rejected: "badge-danger",
};

function LeaveApprovals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getLeaveRequests();
    setRequests(data.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn)));
    setLoading(false);
  }

  async function decide(request, status) {
    await updateLeaveRequest(request.id, { status });
    await load();
  }

  const visible = filter === "All" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="card card-padded">
      <div className="admin-panel-header">
        <div className="admin-filter-group">
          {["Pending", "Approved", "Rejected", "All"].map((f) => (
            <button
              key={f}
              className={`admin-filter${filter === f ? " admin-filter-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="widget-empty">Loading requests…</p>
      ) : visible.length === 0 ? (
        <div className="empty-state">No {filter.toLowerCase()} leave requests.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>Dates</th>
              <th>Reason</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id}>
                <td>{r.employeeName}</td>
                <td>{r.type}</td>
                <td>
                  {r.startDate} → {r.endDate}
                </td>
                <td className="reason-cell">{r.reason}</td>
                <td>
                  <span className={`badge ${leaveStatusBadge[r.status] ?? "badge-neutral"}`}>{r.status}</span>
                </td>
                <td className="admin-row-actions">
                  {r.status === "Pending" && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => decide(r, "Approved")}>
                        Approve
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => decide(r, "Rejected")}>
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function OnboardingTracker() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [rec, emp] = await Promise.all([getOnboarding(), getEmployees()]);
    setRecords(rec);
    setEmployees(emp);
    setLoading(false);
  }

  async function toggleTask(record, task) {
    const updatedTasks = record.tasks.map((t) =>
      t.id === task.id ? { ...t, done: !t.done } : t
    );
    await updateOnboarding(record.id, { tasks: updatedTasks });
    await load();
  }

  async function startOnboarding(e) {
    e.preventDefault();
    const employee = employees.find((emp) => emp.id === selectedEmployeeId);
    if (!employee) return;
    await createOnboarding({
      id: `o${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      startDate: new Date().toISOString().slice(0, 10),
      tasks: [
        { id: "t1", label: "Sign employment contract", done: false },
        { id: "t2", label: "Set up workstation & accounts", done: false },
        { id: "t3", label: "Complete benefits enrollment", done: false },
        { id: "t4", label: "Attend orientation session", done: false },
        { id: "t5", label: "Meet assigned mentor", done: false },
      ],
    });
    setModalOpen(false);
    setSelectedEmployeeId("");
    await load();
  }

  const eligible = employees.filter((e) => !records.some((r) => r.employeeId === e.id));

  return (
    <div className="card card-padded">
      <div className="admin-panel-header">
        <p className="widget-title" style={{ margin: 0 }}>
          Active Onboarding Plans
        </p>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)} disabled={eligible.length === 0}>
          + Start Onboarding
        </button>
      </div>

      {loading ? (
        <p className="widget-empty">Loading…</p>
      ) : records.length === 0 ? (
        <div className="empty-state">No onboarding plans in progress.</div>
      ) : (
        <div className="onboarding-grid">
          {records.map((record) => {
            const done = record.tasks.filter((t) => t.done).length;
            const pct = Math.round((done / record.tasks.length) * 100);
            return (
              <div key={record.id} className="card card-padded onboarding-card">
                <h4>{record.employeeName}</h4>
                <p className="stat-caption">Started {record.startDate}</p>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <ul className="checklist">
                  {record.tasks.map((t) => (
                    <li key={t.id}>
                      <label className="customize-option">
                        <input type="checkbox" checked={t.done} onChange={() => toggleTask(record, t)} />
                        <span className={t.done ? "checklist-done" : ""}>{t.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal title="Start Onboarding" onClose={() => setModalOpen(false)}>
          <form onSubmit={startOnboarding}>
            <div className="field">
              <label>Employee</label>
              <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} required>
                <option value="" disabled>
                  Select an employee
                </option>
                {eligible.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="profile-actions">
              <button type="submit" className="btn btn-primary">
                Start Plan
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                Close
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function AnnouncementsManager() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", body: "" });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setAnnouncements(await getAnnouncements());
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await createAnnouncement({
      ...form,
      author: user.name,
      date: new Date().toISOString().slice(0, 10),
    });
    setForm({ title: "", body: "" });
    await load();
  }

  async function handleDelete(id) {
    await deleteAnnouncement(id);
    await load();
  }

  return (
    <div className="leave-layout">
      <div className="card card-padded">
        <h3 className="widget-title">Post Announcement</h3>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="field">
            <label>Message</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Publish
          </button>
        </form>
      </div>

      <div className="card card-padded">
        <h3 className="widget-title">Published Announcements</h3>
        {loading ? (
          <p className="widget-empty">Loading…</p>
        ) : announcements.length === 0 ? (
          <div className="empty-state">No announcements yet.</div>
        ) : (
          <ul className="mini-list">
            {announcements.map((a) => (
              <li key={a.id}>
                <div>
                  <span className="mini-list-title">{a.title}</span>
                  <p className="mini-list-body">{a.body}</p>
                  <span className="mini-list-sub">
                    {a.author} · {a.date}
                  </span>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
