import "./InfoPages.css";

export function AboutPage() {
  return (
    <div className="info-page">
      <h1>About BrightPath HR Portal</h1>
      <p className="info-page-subtitle">
        A centralized digital workspace that brings employees and HR together.
      </p>

      <div className="info-section">
        <h2>Our Mission</h2>
        <p>
          BrightPath was built to replace slow, paper-based HR processes with a single portal
          where employees can manage their own information and HR teams can act on requests
          in real time. From onboarding a new hire to approving a leave request, everything
          happens in one place.
        </p>
      </div>

      <div className="info-section">
        <h2>What You Can Do Here</h2>
        <ul>
          <li>Log in with your employee or HR credentials and personalize your dashboard.</li>
          <li>Submit and track leave requests without emailing HR directly.</li>
          <li>Keep your personal and contact information up to date.</li>
          <li>HR staff can manage the employee directory, approve leave, and run onboarding.</li>
        </ul>
      </div>

      <div className="info-section">
        <h2>Need Help?</h2>
        <p>Reach out to the HR team through your department contact for anything not covered here.</p>
      </div>
    </div>
  );
}

export function HRPolicyPage() {
  return (
    <div className="info-page">
      <h1>HR Policy</h1>
      <p className="info-page-subtitle">Guidelines for HR staff managing the portal.</p>

      <div className="info-section">
        <h2>Data Handling</h2>
        <p>
          Employee records accessed through the Admin Panel are confidential. HR staff should
          only update information as part of an authorized request and avoid sharing login
          credentials.
        </p>
      </div>

      <div className="info-section">
        <h2>Leave Approvals</h2>
        <p>
          Leave requests should be reviewed within three business days. Approvals and
          rejections are recorded automatically and visible to the employee on their dashboard.
        </p>
      </div>

      <div className="info-section">
        <h2>Onboarding</h2>
        <p>
          A new onboarding plan should be started for every new hire on their first day.
          Complete each checklist item as it happens so the employee's progress stays accurate.
        </p>
      </div>
    </div>
  );
}

export function EmployeePolicyPage() {
  return (
    <div className="info-page">
      <h1>Employee Policy</h1>
      <p className="info-page-subtitle">What every employee should know about using the portal.</p>

      <div className="info-section">
        <h2>Leave Requests</h2>
        <p>
          Submit leave requests as early as possible through the Leave Requests page. Your
          request will show as Pending until HR reviews it, and you'll see the outcome on your
          dashboard.
        </p>
      </div>

      <div className="info-section">
        <h2>Keeping Your Profile Current</h2>
        <p>
          Please keep your contact details up to date from the My Profile page, especially your
          phone number and email address.
        </p>
      </div>

      <div className="info-section">
        <h2>Account Security</h2>
        <p>
          Never share your username or password. Log out of the portal when using a shared or
          public computer.
        </p>
      </div>
    </div>
  );
}
