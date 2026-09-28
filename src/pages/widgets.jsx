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
        <img
          className="profile-avatar"
          src={employee.photoUrl || "/images/generic-default-avatar.png"}
          alt=""
        />
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
      <Link to="/time" className="btn btn-secondary btn-sm">
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
      <Link to="/time" className="widget-link">
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
        <Link to="/time" className="btn btn-secondary btn-sm">
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

export function AlertsWidget({ alerts, onDismiss }) {
  return (
    <div className="card card-padded widget widget-wide">
      <h3 className="widget-title">Alerts</h3>
      {alerts.length === 0 ? (
        <p className="widget-empty">No alerts right now. You're all caught up.</p>
      ) : (
        <ul className="mini-list">
          {alerts.slice(0, 4).map((a) => (
            <li key={a.id}>
              <div>
                <span className="mini-list-title">{a.title}</span>
                <p className="mini-list-body">{a.message}</p>
                <span className="mini-list-sub">{a.date}</span>
              </div>
              {!a.read && (
                <button className="btn btn-outline btn-sm" onClick={() => onDismiss(a.id)}>
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PayrollWidget({ payroll }) {
  const lastStub = payroll.payStubs.at(-1);
  return (
    <div className="card card-padded widget">
      <h3 className="widget-title">Payroll</h3>
      {lastStub ? (
        <>
          <p className="stat-number" style={{ fontSize: "1.6rem" }}>
            {lastStub.netPay.toLocaleString("en-US", { style: "currency", currency: "USD" })}
          </p>
          <p className="stat-caption">Last net pay · {lastStub.date}</p>
        </>
      ) : (
        <p className="widget-empty">No pay stubs yet.</p>
      )}
      <Link to="/payroll" className="widget-link">
        View payroll →
      </Link>
    </div>
  );
}

export function BenefitsWidget({ benefits }) {
  return (
    <div className="card card-padded widget">
      <h3 className="widget-title">Benefits</h3>
      <dl className="widget-list">
        <div>
          <dt>Health</dt>
          <dd>{benefits.healthPlan}</dd>
        </div>
        <div>
          <dt>Dental</dt>
          <dd>{benefits.dentalPlan}</dd>
        </div>
        <div>
          <dt>401(k)</dt>
          <dd>{benefits.retirement401k.enrolled ? `${benefits.retirement401k.contributionPct}%` : "Not enrolled"}</dd>
        </div>
      </dl>
      <Link to="/benefits" className="widget-link">
        Manage benefits →
      </Link>
    </div>
  );
}

export function LearningWidget({ items }) {
  const inProgress = items.filter((i) => i.status !== "Completed");
  return (
    <div className="card card-padded widget">
      <h3 className="widget-title">Learning</h3>
      {items.length === 0 ? (
        <p className="widget-empty">Nothing assigned yet.</p>
      ) : (
        <>
          <p className="stat-number" style={{ fontSize: "1.6rem" }}>
            {inProgress.length}
          </p>
          <p className="stat-caption">item(s) in progress or not started</p>
        </>
      )}
      <Link to="/learning" className="widget-link">
        Go to Learning →
      </Link>
    </div>
  );
}

export function JobsWidget({ openCount }) {
  return (
    <div className="card card-padded widget">
      <h3 className="widget-title">Job Opportunities</h3>
      <p className="stat-number" style={{ fontSize: "1.6rem" }}>
        {openCount}
      </p>
      <p className="stat-caption">open position(s) at BrightPath</p>
      <Link to="/jobs" className="widget-link">
        Browse openings →
      </Link>
    </div>
  );
}

export function DocumentsWidget({ count }) {
  return (
    <div className="card card-padded widget">
      <h3 className="widget-title">Documents</h3>
      <p className="stat-number" style={{ fontSize: "1.6rem" }}>
        {count}
      </p>
      <p className="stat-caption">document(s) on file</p>
      <Link to="/documents" className="widget-link">
        View documents →
      </Link>
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
