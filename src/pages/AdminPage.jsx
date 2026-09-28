import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import { DEFAULT_DASHBOARD_WIDGETS } from "../dashboardWidgets";
import {
  createAlert,
  createAnnouncement,
  createEmployee,
  createJobPosting,
  createLearningItem,
  createOnboarding,
  deleteAnnouncement,
  deleteEmployee,
  getAnnouncements,
  getEmployees,
  getHelpRequests,
  getJobApplications,
  getJobPostings,
  getLeaveRequests,
  getLearningItems,
  getOnboarding,
  getPunchRequests,
  getTimesheets,
  updateEmployee,
  updateHelpRequest,
  updateJobPosting,
  updateLeaveRequest,
  updateOnboarding,
  updatePunchRequest,
  updateTimesheet,
} from "../api";
import "./AdminPage.css";

const TABS = [
  { key: "employees", label: "Employee Directory" },
  { key: "leave", label: "Leave Approvals" },
  { key: "time", label: "Timesheets & Punches" },
  { key: "onboarding", label: "Onboarding Tracker" },
  { key: "jobs", label: "Job Postings" },
  { key: "learning", label: "Learning Assignments" },
  { key: "announcements", label: "Announcements" },
  { key: "help", label: "Help Requests" },
];

export default function AdminPage() {
  const [tab, setTab] = useState("employees");

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>HR Admin Panel</h1>
          <p className="dashboard-subtitle">
            Manage employee records, time & leave, onboarding, jobs, learning, and announcements.
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

      <div className="animate-pop" key={tab}>
        {tab === "employees" && <EmployeeDirectory />}
        {tab === "leave" && <LeaveApprovals />}
        {tab === "time" && <TimeApprovals />}
        {tab === "onboarding" && <OnboardingTracker />}
        {tab === "jobs" && <JobPostingsManager />}
        {tab === "learning" && <LearningAssignments />}
        {tab === "announcements" && <AnnouncementsManager />}
        {tab === "help" && <HelpRequestsManager />}
      </div>
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
        dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS,
        benefits: {
          healthPlan: "BrightPath PPO Silver",
          dentalPlan: "Delta Dental Basic",
          visionPlan: "VSP Choice",
          retirement401k: { enrolled: false, contributionPct: 0 },
          dependents: [],
          beneficiaries: [],
        },
        payroll: {
          payType: "Salary",
          payRate: 65000,
          payFrequency: "Bi-Weekly",
          taxSetup: { filingStatus: "Single", allowances: 1, state: "NY" },
          directDeposit: { bankName: "", accountLast4: "", accountType: "Checking" },
          payStubs: [],
        },
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
        <div className="table-scroll"><table>
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
        </table></div>
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
  Submitted: "badge-warning",
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
    await createAlert({
      employeeId: request.employeeId,
      title: `Leave request ${status.toLowerCase()}`,
      message: `Your ${request.type} request for ${request.startDate} - ${request.endDate} was ${status.toLowerCase()}.`,
      date: new Date().toISOString().slice(0, 10),
      read: false,
    });
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
        <div className="table-scroll"><table>
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
        </table></div>
      )}
    </div>
  );
}

function TimeApprovals() {
  const [timesheets, setTimesheets] = useState([]);
  const [punches, setPunches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [ts, pr, emp] = await Promise.all([getTimesheets(), getPunchRequests(), getEmployees()]);
    setTimesheets(ts.sort((a, b) => new Date(b.payPeriodEnd) - new Date(a.payPeriodEnd)));
    setPunches(pr.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setEmployees(emp);
    setLoading(false);
  }

  function employeeName(id) {
    return employees.find((e) => e.id === id)?.name ?? id;
  }

  async function decideTimesheet(t, status) {
    await updateTimesheet(t.id, { status });
    await createAlert({
      employeeId: t.employeeId,
      title: `Timesheet ${status.toLowerCase()}`,
      message: `Your timesheet for ${t.payPeriodStart} - ${t.payPeriodEnd} was ${status.toLowerCase()}.`,
      date: new Date().toISOString().slice(0, 10),
      read: false,
    });
    await load();
  }

  async function decidePunch(p, status) {
    await updatePunchRequest(p.id, { status });
    await createAlert({
      employeeId: p.employeeId,
      title: `Punch correction ${status.toLowerCase()}`,
      message: `Your ${p.type} request for ${p.date} was ${status.toLowerCase()}.`,
      date: new Date().toISOString().slice(0, 10),
      read: false,
    });
    await load();
  }

  if (loading) return <p className="widget-empty">Loading…</p>;

  return (
    <div className="admin-stack">
      <div className="card card-padded">
        <h3 className="widget-title">Web Time Sheets</h3>
        {timesheets.length === 0 ? (
          <div className="empty-state">No timesheets submitted yet.</div>
        ) : (
          <div className="table-scroll"><table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Pay Period</th>
                <th>Hours</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {timesheets.map((t) => (
                <tr key={t.id}>
                  <td>{employeeName(t.employeeId)}</td>
                  <td>
                    {t.payPeriodStart} → {t.payPeriodEnd}
                  </td>
                  <td>{t.entries.reduce((sum, e) => sum + e.hours, 0)} hrs</td>
                  <td>
                    <span className={`badge ${leaveStatusBadge[t.status] ?? "badge-neutral"}`}>{t.status}</span>
                  </td>
                  <td className="admin-row-actions">
                    {t.status === "Submitted" && (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={() => decideTimesheet(t, "Approved")}>
                          Approve
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => decideTimesheet(t, "Rejected")}>
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      <div className="card card-padded">
        <h3 className="widget-title">Punch Change Requests</h3>
        {punches.length === 0 ? (
          <div className="empty-state">No punch correction requests.</div>
        ) : (
          <div className="table-scroll"><table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Date</th>
                <th>Requested Time</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {punches.map((p) => (
                <tr key={p.id}>
                  <td>{p.employeeName ?? employeeName(p.employeeId)}</td>
                  <td>{p.type}</td>
                  <td>{p.date}</td>
                  <td>{p.requestedTime}</td>
                  <td>
                    <span className={`badge ${leaveStatusBadge[p.status] ?? "badge-neutral"}`}>{p.status}</span>
                  </td>
                  <td className="admin-row-actions">
                    {p.status === "Pending" && (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={() => decidePunch(p, "Approved")}>
                          Approve
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => decidePunch(p, "Rejected")}>
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
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
      <div className="card-header-band">
        <p>Active Onboarding Plans</p>
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

const emptyJobForm = {
  title: "",
  department: "",
  location: "",
  type: "Full-Time",
  salaryRange: "",
  description: "",
  responsibilities: "",
  requirements: "",
};

function JobPostingsManager() {
  const [postings, setPostings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyJobForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [jobs, apps] = await Promise.all([getJobPostings(), getJobApplications()]);
    setPostings(jobs);
    setApplications(apps);
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    await createJobPosting({
      ...form,
      responsibilities: form.responsibilities.split("\n").map((s) => s.trim()).filter(Boolean),
      requirements: form.requirements.split("\n").map((s) => s.trim()).filter(Boolean),
      postedDate: new Date().toISOString().slice(0, 10),
      status: "Open",
    });
    await createAlert({
      employeeId: "all",
      title: "New job opening posted",
      message: `${form.title} (${form.department}) is now open. Check Job Opportunities to apply.`,
      date: new Date().toISOString().slice(0, 10),
      read: false,
    });
    setForm(emptyJobForm);
    setModalOpen(false);
    await load();
  }

  async function toggleStatus(posting) {
    await updateJobPosting(posting.id, { status: posting.status === "Open" ? "Closed" : "Open" });
    await load();
  }

  function applicationsFor(jobId) {
    return applications.filter((a) => a.jobId === jobId);
  }

  return (
    <div className="card card-padded">
      <div className="card-header-band">
        <p>Open Positions</p>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Post a Job
        </button>
      </div>

      {loading ? (
        <p className="widget-empty">Loading…</p>
      ) : postings.length === 0 ? (
        <div className="empty-state">No job postings yet.</div>
      ) : (
        <div className="table-scroll"><table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Department</th>
              <th>Location</th>
              <th>Applicants</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {postings.map((j) => (
              <tr key={j.id}>
                <td>{j.title}</td>
                <td>{j.department}</td>
                <td>{j.location}</td>
                <td>{applicationsFor(j.id).length}</td>
                <td>
                  <span className={`badge ${j.status === "Open" ? "badge-success" : "badge-neutral"}`}>
                    {j.status}
                  </span>
                </td>
                <td className="admin-row-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => toggleStatus(j)}>
                    {j.status === "Open" ? "Close" : "Reopen"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}

      {modalOpen && (
        <Modal title="Post a Job" onClose={() => setModalOpen(false)} wide>
          <form onSubmit={handleCreate}>
            <div className="field">
              <label>Title</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="form-grid-2">
              <div className="field">
                <label>Department</label>
                <input
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label>Location</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="field">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  <option>Full-Time</option>
                  <option>Part-Time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
              <div className="field">
                <label>Salary range (optional)</label>
                <input
                  placeholder="e.g. $80,000 - $95,000"
                  value={form.salaryRange}
                  onChange={(e) => setForm((f) => ({ ...f, salaryRange: e.target.value }))}
                />
              </div>
            </div>
            <div className="field">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label>Responsibilities (one per line)</label>
              <textarea
                value={form.responsibilities}
                onChange={(e) => setForm((f) => ({ ...f, responsibilities: e.target.value }))}
                placeholder={"Lead a small project team\nReview pull requests"}
              />
            </div>
            <div className="field">
              <label>Requirements (one per line)</label>
              <textarea
                value={form.requirements}
                onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                placeholder={"3+ years of relevant experience\nStrong written communication"}
              />
            </div>
            <div className="profile-actions">
              <button type="submit" className="btn btn-primary">
                Post Job
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

const emptyLearningForm = { employeeId: "", title: "", type: "Training", description: "", dueDate: "" };

function LearningAssignments() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyLearningForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [learning, emp] = await Promise.all([getLearningItems(), getEmployees()]);
    setItems(learning.sort((a, b) => new Date(b.assignedDate) - new Date(a.assignedDate)));
    setEmployees(emp);
    setLoading(false);
  }

  function employeeName(id) {
    return employees.find((e) => e.id === id)?.name ?? id;
  }

  async function handleAssign(e) {
    e.preventDefault();
    const employee = employees.find((emp) => emp.id === form.employeeId);
    if (!employee) return;
    await createLearningItem({
      ...form,
      assignedBy: user.name,
      assignedDate: new Date().toISOString().slice(0, 10),
      status: "Not Started",
    });
    await createAlert({
      employeeId: form.employeeId,
      title: "New learning item assigned",
      message: `${user.name} assigned you "${form.title}".`,
      date: new Date().toISOString().slice(0, 10),
      read: false,
    });
    setForm(emptyLearningForm);
    setModalOpen(false);
    await load();
  }

  return (
    <div className="card card-padded">
      <div className="card-header-band">
        <p>Assigned Learning</p>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Assign Learning
        </button>
      </div>

      {loading ? (
        <p className="widget-empty">Loading…</p>
      ) : items.length === 0 ? (
        <div className="empty-state">Nothing assigned yet.</div>
      ) : (
        <div className="table-scroll"><table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Title</th>
              <th>Type</th>
              <th>Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{employeeName(i.employeeId)}</td>
                <td>{i.title}</td>
                <td>{i.type}</td>
                <td>{i.dueDate || "—"}</td>
                <td>
                  <span
                    className={`badge ${
                      i.status === "Completed" ? "badge-success" : i.status === "In Progress" ? "badge-warning" : "badge-neutral"
                    }`}
                  >
                    {i.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}

      {modalOpen && (
        <Modal title="Assign Learning" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleAssign}>
            <div className="field">
              <label>Employee</label>
              <select
                value={form.employeeId}
                onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
                required
              >
                <option value="" disabled>
                  Select an employee
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Title</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="form-grid-2">
              <div className="field">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  <option>Training</option>
                  <option>Video</option>
                  <option>Course</option>
                </select>
              </div>
              <div className="field">
                <label>Due date (optional)</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="field">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
              />
            </div>
            <div className="profile-actions">
              <button type="submit" className="btn btn-primary">
                Assign
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
    await createAlert({
      employeeId: "all",
      title: form.title,
      message: form.body,
      date: new Date().toISOString().slice(0, 10),
      read: false,
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

function HelpRequestsManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getHelpRequests();
    setRequests(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setLoading(false);
  }

  async function resolve(req) {
    await updateHelpRequest(req.id, { status: "Resolved" });
    await load();
  }

  return (
    <div className="card card-padded">
      <h3 className="widget-title">Employee Questions</h3>
      {loading ? (
        <p className="widget-empty">Loading…</p>
      ) : requests.length === 0 ? (
        <div className="empty-state">No questions submitted through the Help Center yet.</div>
      ) : (
        <ul className="mini-list">
          {requests.map((r) => (
            <li key={r.id}>
              <div>
                <span className="mini-list-title">{r.employeeName}</span>
                <p className="mini-list-body">{r.message}</p>
                <span className="mini-list-sub">{r.date}</span>
              </div>
              {r.status === "Open" ? (
                <button className="btn btn-primary btn-sm" onClick={() => resolve(r)}>
                  Mark Resolved
                </button>
              ) : (
                <span className="badge badge-success">Resolved</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
