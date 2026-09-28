import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPages.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  department: "",
  position: "",
  username: "",
  password: "",
  confirmPassword: "",
};

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await signup(form);
      navigate("/");
    } catch (err) {
      setError(err.message || "Unable to create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card" style={{ maxWidth: 520 }}>
        <img src="/images/brightpath-wordmark.svg" alt="BrightPath" className="auth-wordmark" />
        <h1>Create your account</h1>
        <p className="auth-subtitle">
          Register as an employee to access the portal and submit your onboarding details.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" value={form.name} onChange={update("name")} required />
          </div>

          <div className="form-grid-2">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={form.email} onChange={update("email")} required />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" value={form.phone} onChange={update("phone")} required />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field">
              <label htmlFor="department">Department</label>
              <input id="department" value={form.department} onChange={update("department")} required />
            </div>
            <div className="field">
              <label htmlFor="position">Position</label>
              <input id="position" value={form.position} onChange={update("position")} required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="signupUsername">Username</label>
            <input id="signupUsername" value={form.username} onChange={update("username")} required />
          </div>

          <div className="form-grid-2">
            <div className="field">
              <label htmlFor="signupPassword">Password</label>
              <input
                id="signupPassword"
                type="password"
                value={form.password}
                onChange={update("password")}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={update("confirmPassword")}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
