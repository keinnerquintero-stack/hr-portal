import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getAnnouncements,
  getEmployees,
  getLeaveRequests,
  getLeaveRequestsForEmployee,
  getOnboarding,
} from "../api";
import {
  AnnouncementsWidget,
  LeaveBalanceWidget,
  MyLeaveWidget,
  OnboardingWidget,
  ProfileWidget,
  QuickActionsWidget,
  TeamOverviewWidget,
} from "./widgets";
import "./DashboardPage.css";

const WIDGET_DEFS = [
  { key: "profile", label: "Profile Summary" },
  { key: "leaveBalance", label: "Leave Balance" },
  { key: "myLeave", label: "My Leave Requests" },
  { key: "announcements", label: "Company Announcements" },
  { key: "onboarding", label: "Onboarding Checklist" },
  { key: "quickActions", label: "Quick Actions" },
  { key: "teamOverview", label: "Team Overview (HR)", hrOnly: true },
];

function loadPreferences(username) {
  const stored = localStorage.getItem(`dashboardWidgets:${username}`);
  if (stored) return JSON.parse(stored);
  return WIDGET_DEFS.map((w) => w.key);
}

export default function DashboardPage() {
  const { user, isHR, session } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [myLeave, setMyLeave] = useState([]);
  const [onboarding, setOnboarding] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [allLeave, setAllLeave] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(() => loadPreferences(session.username));
  const [customizing, setCustomizing] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const tasks = [
        getAnnouncements(),
        getLeaveRequestsForEmployee(user.id),
        getOnboarding(),
      ];
      if (isHR) {
        tasks.push(getEmployees(), getLeaveRequests());
      }
      const results = await Promise.all(tasks);
      if (!active) return;
      setAnnouncements(results[0]);
      setMyLeave(results[1]);
      const record = results[2].find((o) => o.employeeId === user.id);
      setOnboarding(record ?? null);
      if (isHR) {
        setEmployees(results[3]);
        setAllLeave(results[4]);
      }
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [user.id, isHR]);

  function toggleWidget(key) {
    setEnabled((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      localStorage.setItem(`dashboardWidgets:${session.username}`, JSON.stringify(next));
      return next;
    });
  }

  const visibleDefs = useMemo(
    () => WIDGET_DEFS.filter((w) => !w.hrOnly || isHR),
    [isHR]
  );

  const showOnboarding = enabled.includes("onboarding") && onboarding;

  if (loading) {
    return <div className="spinner-wrap">Loading your dashboard…</div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="dashboard-subtitle">
            Here's what's happening today. Customize this view to match what matters to you.
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => setCustomizing((c) => !c)}>
          {customizing ? "Done" : "Customize dashboard"}
        </button>
      </div>

      {customizing && (
        <div className="card card-padded customize-panel">
          <p className="customize-title">Choose what appears on your dashboard</p>
          <div className="customize-options">
            {visibleDefs.map((w) => (
              <label key={w.key} className="customize-option">
                <input
                  type="checkbox"
                  checked={enabled.includes(w.key)}
                  onChange={() => toggleWidget(w.key)}
                />
                {w.label}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="widget-grid">
        {enabled.includes("profile") && <ProfileWidget employee={user} />}
        {enabled.includes("leaveBalance") && <LeaveBalanceWidget employee={user} />}
        {enabled.includes("quickActions") && <QuickActionsWidget isHR={isHR} />}
        {enabled.includes("myLeave") && <MyLeaveWidget requests={myLeave} />}
        {enabled.includes("announcements") && <AnnouncementsWidget announcements={announcements} />}
        {showOnboarding && <OnboardingWidget record={onboarding} />}
        {isHR && enabled.includes("teamOverview") && (
          <TeamOverviewWidget employees={employees} leaveRequests={allLeave} />
        )}
      </div>
    </div>
  );
}
