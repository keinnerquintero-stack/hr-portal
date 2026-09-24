import { Link } from "react-router-dom";

const statusBadge = {
  Pending: "badge-warning",
  Approved: "badge-success",
  Rejected: "badge-danger",
};

export function ProfileWidget({ employee }) {
  return (
    <div className="card card-padded widget">
      <h3 className="widget-title">Profile Summary</h3>
      <div className="profile-row">
        <div className="profile-avatar">{employee.name.charAt(0)}</div>
        <div>
          <p className="profile-name">{employee.name}</p>
          <p className="profile-role">{employee.position}</p>
        </div>
      </div>
      <dl className="widget-list">
        <div>
          <dt>Department</dt>
          <dd>{employee.department}</dd>
        </div>
        <div>
          <dt>Manager</dt>
          <dd>{employee.manager}</dd>
        </div>
        <div>
          <dt>Joined</dt>
          <dd>{employee.joinDate}</dd>
        </div>
      </dl>
      <Link to="/profile" className="widget-link">
        View full profile →
      </Link>
    </div>
  );
}

export function LeaveBalanceWidget({ employee }) {
  return (
    <div className="card card-padded widget">
      <h3 className="widget-title">Leave Balance</h3>
      <p className="stat-number">{employee.leaveBalance}</p>
      <p className="stat-caption">days available this year</p>
      <Link to="/leave" className="btn btn-secondary btn-sm">
        Request Leave
      </Link>
    </div>
  );
}

export function MyLeaveWidget({ requests }) {
  return (
    <div className="card card-padded widget widget-wide">
      <h3 className="widget-title">My Leave Requests</h3>
      {requests.length === 0 ? (
        <p className="widget-empty">No leave requests yet.</p>
      ) : (
        <ul className="mini-list">
          {requests.slice(0, 4).map((r) => (
            <li key={r.id}>
              <div>
                <span className="mini-list-title">{r.type}</span>
                <span className="mini-list-sub">
                  {r.startDate} → {r.endDate}
                </span>
              </div>
              <span className={`badge ${statusBadge[r.status] ?? "badge-neutral"}`}>{r.status}</span>
            </li>
          ))}
        </ul>
      )}
      <Link to="/leave" className="widget-link">
        Manage leave requests →
      </Link>
    </div>
  );
}

export function AnnouncementsWidget({ announcements }) {
  return (
    <div className="card card-padded widget widget-wide">
      <h3 className="widget-title">Company Announcements</h3>
      {announcements.length === 0 ? (
        <p className="widget-empty">No announcements right now.</p>
      ) : (
        <ul className="mini-list">
          {announcements.slice(0, 3).map((a) => (
            <li key={a.id} className="announcement-item">
              <div>
                <span className="mini-list-title">{a.title}</span>
                <p className="mini-list-body">{a.body}</p>
                <span className="mini-list-sub">
                  {a.author} · {a.date}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function OnboardingWidget({ record }) {
  const total = record.tasks.length;
  const done = record.tasks.filter((t) => t.done).length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="card card-padded widget">
      <h3 className="widget-title">Onboarding Checklist</h3>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="stat-caption">
        {done} of {total} tasks complete
      </p>
      <ul className="checklist">
        {record.tasks.map((t) => (
          <li key={t.id} className={t.done ? "checklist-done" : ""}>
            {t.done ? "✓" : "○"} {t.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function QuickActionsWidget({ isHR }) {
  return (
    <div className="card card-padded widget">
      <h3 className="widget-title">Quick Actions</h3>
      <div className="quick-actions">
        <Link to="/leave" className="btn btn-secondary btn-sm">
          Request Leave
        </Link>
        <Link to="/profile" className="btn btn-secondary btn-sm">
          Update Profile
        </Link>
        <Link to="/employee-policy" className="btn btn-outline btn-sm">
          Employee Policy
        </Link>
        {isHR && (
          <Link to="/admin" className="btn btn-primary btn-sm">
            Open Admin Panel
          </Link>
        )}
      </div>
    </div>
  );
}

export function TeamOverviewWidget({ employees, leaveRequests }) {
  const pending = leaveRequests.filter((r) => r.status === "Pending").length;
  return (
    <div className="card card-padded widget widget-wide">
      <h3 className="widget-title">Team Overview</h3>
      <div className="stat-grid">
        <div>
          <p className="stat-number">{employees.length}</p>
          <p className="stat-caption">Total employees</p>
        </div>
        <div>
          <p className="stat-number">{pending}</p>
          <p className="stat-caption">Pending leave requests</p>
        </div>
        <div>
          <p className="stat-number">{new Set(employees.map((e) => e.department)).size}</p>
          <p className="stat-caption">Departments</p>
        </div>
      </div>
      <Link to="/admin" className="widget-link">
        Go to Admin Panel →
      </Link>
    </div>
  );
}
