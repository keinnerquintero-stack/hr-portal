export const WIDGET_DEFS = [
  { key: "profile", label: "Profile Summary" },
  { key: "alerts", label: "Alerts" },
  { key: "leaveBalance", label: "Leave Balance" },
  { key: "myLeave", label: "My Leave Requests" },
  { key: "payroll", label: "Payroll" },
  { key: "benefits", label: "Benefits" },
  { key: "learning", label: "Learning" },
  { key: "documents", label: "Documents" },
  { key: "jobs", label: "Job Opportunities" },
  { key: "announcements", label: "Company Announcements" },
  { key: "onboarding", label: "Onboarding Checklist" },
  { key: "quickActions", label: "Quick Actions" },
  { key: "teamOverview", label: "Team Overview (HR)", hrOnly: true },
];

export const DEFAULT_DASHBOARD_WIDGETS = WIDGET_DEFS.map((w) => w.key);
