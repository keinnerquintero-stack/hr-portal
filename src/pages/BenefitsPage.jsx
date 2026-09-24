import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateEmployee } from "../api";
import "./BenefitsPage.css";

export default function BenefitsPage() {
  const { user, refreshEmployee } = useAuth();
  const benefits = user.benefits ?? {
    healthPlan: "Not enrolled",
    dentalPlan: "Not enrolled",
    visionPlan: "Not enrolled",
    retirement401k: { enrolled: false, contributionPct: 0 },
    dependents: [],
    beneficiaries: [],
  };

  const [contribution, setContribution] = useState(benefits.retirement401k.contributionPct);
  const [savingContribution, setSavingContribution] = useState(false);
  const [message, setMessage] = useState("");

  const [dependentForm, setDependentForm] = useState({ name: "", relationship: "", dob: "" });
  const [beneficiaryForm, setBeneficiaryForm] = useState({ name: "", relationship: "", percentage: "" });

  async function saveBenefits(next) {
    const updated = await updateEmployee(user.id, { benefits: next });
    refreshEmployee(updated);
  }

  async function handleContributionSave(e) {
    e.preventDefault();
    setSavingContribution(true);
    try {
      await saveBenefits({
        ...benefits,
        retirement401k: { ...benefits.retirement401k, contributionPct: Number(contribution), enrolled: true },
      });
      setMessage("401(k) contribution updated.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSavingContribution(false);
    }
  }

  async function addDependent(e) {
    e.preventDefault();
    if (!dependentForm.name) return;
    await saveBenefits({
      ...benefits,
      dependents: [...benefits.dependents, { id: `d${Date.now()}`, ...dependentForm }],
    });
    setDependentForm({ name: "", relationship: "", dob: "" });
  }

  async function removeDependent(id) {
    await saveBenefits({ ...benefits, dependents: benefits.dependents.filter((d) => d.id !== id) });
  }

  async function addBeneficiary(e) {
    e.preventDefault();
    if (!beneficiaryForm.name) return;
    await saveBenefits({
      ...benefits,
      beneficiaries: [
        ...benefits.beneficiaries,
        { id: `b${Date.now()}`, ...beneficiaryForm, percentage: Number(beneficiaryForm.percentage) },
      ],
    });
    setBeneficiaryForm({ name: "", relationship: "", percentage: "" });
  }

  async function removeBeneficiary(id) {
    await saveBenefits({ ...benefits, beneficiaries: benefits.beneficiaries.filter((b) => b.id !== id) });
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Benefits</h1>
          <p className="dashboard-subtitle">Your health coverage, retirement plan, dependents, and beneficiaries.</p>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="benefits-grid">
        <div className="card card-padded benefit-card">
          <span className="benefit-icon">🩺</span>
          <h3>Health Insurance</h3>
          <p className="benefit-plan">{benefits.healthPlan}</p>
          <span className="badge badge-success">Active</span>
        </div>
        <div className="card card-padded benefit-card">
          <span className="benefit-icon">🦷</span>
          <h3>Dental</h3>
          <p className="benefit-plan">{benefits.dentalPlan}</p>
          <span className="badge badge-success">Active</span>
        </div>
        <div className="card card-padded benefit-card">
          <span className="benefit-icon">👁</span>
          <h3>Vision</h3>
          <p className="benefit-plan">{benefits.visionPlan}</p>
          <span className="badge badge-success">Active</span>
        </div>
      </div>

      <div className="card card-padded" style={{ marginTop: 20 }}>
        <h3 className="widget-title">401(k) Retirement Plan</h3>
        <p className="stat-caption" style={{ marginTop: -8 }}>
          {benefits.retirement401k.enrolled ? "You're enrolled." : "You're not enrolled yet."} Set your contribution
          percentage below.
        </p>
        <form onSubmit={handleContributionSave} className="contribution-form">
          <div className="field" style={{ maxWidth: 220 }}>
            <label>Contribution (% of salary)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingContribution}>
            {savingContribution ? "Saving…" : "Save"}
          </button>
        </form>
      </div>

      <div className="benefits-grid" style={{ marginTop: 20 }}>
        <div className="card card-padded">
          <h3 className="widget-title">Dependents</h3>
          {benefits.dependents.length === 0 ? (
            <p className="widget-empty">No dependents added yet.</p>
          ) : (
            <ul className="mini-list">
              {benefits.dependents.map((d) => (
                <li key={d.id}>
                  <div>
                    <span className="mini-list-title">{d.name}</span>
                    <span className="mini-list-sub">
                      {d.relationship} · DOB {d.dob}
                    </span>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => removeDependent(d.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={addDependent} className="inline-add-form">
            <input
              placeholder="Name"
              value={dependentForm.name}
              onChange={(e) => setDependentForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              placeholder="Relationship"
              value={dependentForm.relationship}
              onChange={(e) => setDependentForm((f) => ({ ...f, relationship: e.target.value }))}
            />
            <input
              type="date"
              value={dependentForm.dob}
              onChange={(e) => setDependentForm((f) => ({ ...f, dob: e.target.value }))}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              + Add
            </button>
          </form>
        </div>

        <div className="card card-padded">
          <h3 className="widget-title">Beneficiaries</h3>
          {benefits.beneficiaries.length === 0 ? (
            <p className="widget-empty">No beneficiaries added yet.</p>
          ) : (
            <ul className="mini-list">
              {benefits.beneficiaries.map((b) => (
                <li key={b.id}>
                  <div>
                    <span className="mini-list-title">{b.name}</span>
                    <span className="mini-list-sub">
                      {b.relationship} · {b.percentage}%
                    </span>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => removeBeneficiary(b.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={addBeneficiary} className="inline-add-form">
            <input
              placeholder="Name"
              value={beneficiaryForm.name}
              onChange={(e) => setBeneficiaryForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              placeholder="Relationship"
              value={beneficiaryForm.relationship}
              onChange={(e) => setBeneficiaryForm((f) => ({ ...f, relationship: e.target.value }))}
            />
            <input
              type="number"
              placeholder="%"
              min="0"
              max="100"
              value={beneficiaryForm.percentage}
              onChange={(e) => setBeneficiaryForm((f) => ({ ...f, percentage: e.target.value }))}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              + Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
