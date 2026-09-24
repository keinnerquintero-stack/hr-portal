import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPages.css";

const DEMO_CREDENTIALS = {
  employee: { username: "employee1", password: "employee123" },
  hr: { username: "hradmin", password: "hr123456" },
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("employee");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function fillDemo(demoRole) {
    setRole(demoRole);
    setUsername(DEMO_CREDENTIALS[demoRole].username);
    setPassword(DEMO_CREDENTIALS[demoRole].password);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password, role);
      navigate("/");
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Log in to access your HR workspace.</p>

        <div className="demo-row">
          <button type="button" className="btn btn-secondary" onClick={() => fillDemo("employee")}>
            Use Employee Test Login
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => fillDemo("hr")}>
            Use HR Staff Test Login
          </button>
        </div>

        <div className="auth-divider">or sign in manually</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="role-toggle">
            <button
              type="button"
              className={role === "employee" ? "active" : ""}
              onClick={() => setRole("employee")}
            >
              Employee
            </button>
            <button
              type="button"
              className={role === "hr" ? "active" : ""}
              onClick={() => setRole("hr")}
            >
              HR Staff
            </button>
          </div>

          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="auth-footer">
          New employee? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
