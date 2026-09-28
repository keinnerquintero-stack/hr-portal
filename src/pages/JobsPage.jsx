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
  const [modalMode, setModalMode] = useState("details");
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

  function openDetails(job) {
    setActiveJob(job);
    setModalMode("details");
  }

  function openApply(job) {
    setActiveJob(job);
    setModalMode("apply");
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
              {job.salaryRange && <p className="job-salary">{job.salaryRange}</p>}
              <p className="job-description">{job.description}</p>
              <div className="job-card-actions">
                <button className="btn btn-outline btn-sm" onClick={() => openDetails(job)}>
                  View Details
                </button>
                {hasApplied(job.id) ? (
                  <span className="badge badge-success">Application submitted</span>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => openApply(job)}>
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeJob && modalMode === "details" && (
        <Modal title={activeJob.title} onClose={() => setActiveJob(null)} wide>
          <p className="mini-list-sub" style={{ marginBottom: 4 }}>
            {activeJob.department} · {activeJob.location} · {activeJob.type}
          </p>
          {activeJob.salaryRange && <p className="job-salary" style={{ marginBottom: 14 }}>{activeJob.salaryRange}</p>}

          <p className="job-description" style={{ marginBottom: 16 }}>
            {activeJob.description}
          </p>

          {activeJob.responsibilities?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 className="job-detail-heading">Responsibilities</h4>
              <ul className="job-detail-list">
                {activeJob.responsibilities.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {activeJob.requirements?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 className="job-detail-heading">Requirements</h4>
              <ul className="job-detail-list">
                {activeJob.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="profile-actions">
            {hasApplied(activeJob.id) ? (
              <span className="badge badge-success">Application submitted</span>
            ) : (
              <button className="btn btn-primary" onClick={() => setModalMode("apply")}>
                Apply Now
              </button>
            )}
            <button type="button" className="btn btn-outline" onClick={() => setActiveJob(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {activeJob && modalMode === "apply" && (
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
              <button type="button" className="btn btn-outline" onClick={() => setModalMode("details")}>
                Back
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
