import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateEmployee } from "../api";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, refreshEmployee } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    department: user.department,
    position: user.position,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateEmployee(user.id, form);
      refreshEmployee(updated);
      setEditing(false);
      setMessage("Profile updated successfully.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="dashboard-header">
        <div>
          <h1>My Profile</h1>
          <p className="dashboard-subtitle">View and update your personal information.</p>
        </div>
        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            Edit profile
          </button>
        )}
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="profile-hero">
        <img className="profile-hero-avatar" src={user.photoUrl || "/images/generic-default-avatar.png"} alt="" />
        <div>
          <p className="profile-hero-name">{user.name}</p>
          <p className="profile-hero-role">
            {user.position} · {user.department}
          </p>
        </div>
      </div>

      <div className="card card-padded">
        {editing ? (
          <form onSubmit={handleSave}>
            <div className="form-grid-2">
              <div className="field">
                <label>Full name</label>
                <input value={form.name} onChange={update("name")} required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={update("email")} required />
              </div>
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
            <div className="field">
              <label>Position</label>
              <input value={form.position} onChange={update("position")} required />
            </div>
            <div className="profile-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setEditing(false);
                  setForm({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    department: user.department,
                    position: user.position,
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <dl className="profile-detail-grid">
            <div>
              <dt>Full name</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{user.phone}</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>{user.department}</dd>
            </div>
            <div>
              <dt>Position</dt>
              <dd>{user.position}</dd>
            </div>
            <div>
              <dt>Manager</dt>
              <dd>{user.manager}</dd>
            </div>
            <div>
              <dt>Joined</dt>
              <dd>{user.joinDate}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className="badge badge-success">{user.status}</span>
              </dd>
            </div>
            <div>
              <dt>Leave balance</dt>
              <dd>{user.leaveBalance} days</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
