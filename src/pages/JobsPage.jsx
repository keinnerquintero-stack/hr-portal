import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createJobApplication, getJobApplicationsForEmployee, getJobPostings } from "../api";
import Modal from "../components/Modal";
import "./JobsPage.css";

export default function JobsPage() {
  const { user } = useAuth();
  const [postings, setPostings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [coverNote, setCoverNote] = useState("");

  useEffect(() => {
    load();
  }, [user.id]);

  async function load() {
    setLoading(true);
    const [jobs, apps] = await Promise.all([getJobPostings(), getJobApplicationsForEmployee(user.id)]);
    setPostings(jobs.filter((j) => j.status === "Open"));
    setApplications(apps);
    setLoading(false);
  }

  function hasApplied(jobId) {
    return applications.some((a) => a.jobId === jobId);
  }

  async function handleApply(e) {
    e.preventDefault();
    setApplying(true);
    try {
      await createJobApplication({
        jobId: activeJob.id,
        jobTitle: activeJob.title,
        employeeId: user.id,
        employeeName: user.name,
        employeeEmail: user.email,
        employeeDepartment: user.department,
        coverNote,
        appliedDate: new Date().toISOString().slice(0, 10),
        status: "Submitted",
      });
      setActiveJob(null);
      setCoverNote("");
      await load();
    } finally {
      setApplying(false);
    }
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Job Opportunities</h1>
          <p className="dashboard-subtitle">
            Open internal positions. Apply with the information already on your profile.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="widget-empty">Loading openings…</p>
      ) : postings.length === 0 ? (
        <div className="card card-padded">
          <div className="empty-state">No open positions right now. Check back soon.</div>
        </div>
      ) : (
        <div className="jobs-grid">
          {postings.map((job) => (
            <div key={job.id} className="card card-padded job-card">
              <div className="job-card-top">
                <h3>{job.title}</h3>
                <span className="badge badge-neutral">{job.type}</span>
              </div>
              <p className="mini-list-sub">
                {job.department} · {job.location} · Posted {job.postedDate}
              </p>
              <p className="job-description">{job.description}</p>
              {hasApplied(job.id) ? (
                <span className="badge badge-success">Application submitted</span>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => setActiveJob(job)}>
                  Apply Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeJob && (
        <Modal title={`Apply: ${activeJob.title}`} onClose={() => setActiveJob(null)}>
          <form onSubmit={handleApply}>
            <p className="stat-caption" style={{ marginTop: 0 }}>
              We'll include your profile details automatically.
            </p>
            <dl className="widget-list" style={{ marginBottom: 16 }}>
              <div>
                <dt>Name</dt>
                <dd>{user.name}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Department</dt>
                <dd>{user.department}</dd>
              </div>
            </dl>
            <div className="field">
              <label>Why are you a good fit? (optional)</label>
              <textarea value={coverNote} onChange={(e) => setCoverNote(e.target.value)} />
            </div>
            <div className="profile-actions">
              <button type="submit" className="btn btn-primary" disabled={applying}>
                {applying ? "Submitting…" : "Submit Application"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setActiveJob(null)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
