import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateEmployee } from "../api";
import Modal from "../components/Modal";
import "./PayrollPage.css";

const TABS = ["Pay & Tax Setup", "Pay Stubs", "Direct Deposit", "Sample Check"];

function currency(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function stubBreakdown(stub, contributionPct) {
  const gross = stub.grossPay;
  const socialSecurity = gross * 0.062;
  const medicare = gross * 0.0145;
  const retirement401k = gross * ((contributionPct ?? 0) / 100);
  const healthInsurance = 120;
  const dental = 18;
  const vision = 6;
  const preTaxDeductions = retirement401k + healthInsurance + dental + vision;
  const taxesWithheld = Math.max(0, gross - preTaxDeductions - stub.netPay - socialSecurity - medicare);

  return {
    socialSecurity,
    medicare,
    retirement401k,
    healthInsurance,
    dental,
    vision,
    taxesWithheld,
    totalDeductions: gross - stub.netPay,
  };
}

export default function PayrollPage() {
  const { user, refreshEmployee } = useAuth();
  const payroll = user.payroll;
  const [tab, setTab] = useState(TABS[0]);
  const [taxForm, setTaxForm] = useState(payroll.taxSetup);
  const [depositForm, setDepositForm] = useState(payroll.directDeposit);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeStub, setActiveStub] = useState(null);

  const ytdGross = payroll.payStubs.reduce((sum, p) => sum + p.grossPay, 0);
  const ytdNet = payroll.payStubs.reduce((sum, p) => sum + p.netPay, 0);

  async function saveTax(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateEmployee(user.id, { payroll: { ...payroll, taxSetup: taxForm } });
      refreshEmployee(updated);
      setMessage("Tax setup updated.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function saveDeposit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateEmployee(user.id, { payroll: { ...payroll, directDeposit: depositForm } });
      refreshEmployee(updated);
      setMessage("Direct deposit details updated.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Payroll</h1>
          <p className="dashboard-subtitle">Pay rate, tax setup, pay stubs, and direct deposit information.</p>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="card card-padded" style={{ flex: 1 }}>
          <p className="stat-caption" style={{ marginBottom: 4 }}>
            Pay rate
          </p>
          <p className="stat-number" style={{ fontSize: "1.6rem" }}>
            {currency(payroll.payRate)}
          </p>
          <p className="stat-caption">{payroll.payType} · {payroll.payFrequency}</p>
        </div>
        <div className="card card-padded" style={{ flex: 1 }}>
          <p className="stat-caption" style={{ marginBottom: 4 }}>
            Pay to date (gross)
          </p>
          <p className="stat-number" style={{ fontSize: "1.6rem" }}>
            {currency(ytdGross)}
          </p>
          <p className="stat-caption">Year to date</p>
        </div>
        <div className="card card-padded" style={{ flex: 1 }}>
          <p className="stat-caption" style={{ marginBottom: 4 }}>
            Pay to date (net)
          </p>
          <p className="stat-number" style={{ fontSize: "1.6rem" }}>
            {currency(ytdNet)}
          </p>
          <p className="stat-caption">Year to date</p>
        </div>
      </div>

      <div className="section-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`section-tab${tab === t ? " section-tab-active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="animate-pop" key={tab}>
        {tab === "Pay & Tax Setup" && (
          <div className="card card-padded">
            <h3 className="widget-title">Tax Setup</h3>
            <form onSubmit={saveTax}>
              <div className="form-grid-2">
                <div className="field">
                  <label>Filing status</label>
                  <select
                    value={taxForm.filingStatus}
                    onChange={(e) => setTaxForm((f) => ({ ...f, filingStatus: e.target.value }))}
                  >
                    <option>Single</option>
                    <option>Married Filing Jointly</option>
                    <option>Married Filing Separately</option>
                    <option>Head of Household</option>
                  </select>
                </div>
                <div className="field">
                  <label>Allowances</label>
                  <input
                    type="number"
                    min="0"
                    value={taxForm.allowances}
                    onChange={(e) => setTaxForm((f) => ({ ...f, allowances: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="field" style={{ maxWidth: 220 }}>
                <label>State</label>
                <input value={taxForm.state} onChange={(e) => setTaxForm((f) => ({ ...f, state: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save tax setup"}
              </button>
            </form>
          </div>
        )}

        {tab === "Pay Stubs" && (
          <div className="card card-padded">
            <h3 className="widget-title">Pay Stubs</h3>
            {payroll.payStubs.length === 0 ? (
              <div className="empty-state">No pay stubs available yet.</div>
            ) : (
              <div className="table-scroll"><table>
                <thead>
                  <tr>
                    <th>Pay Period</th>
                    <th>Pay Date</th>
                    <th>Gross Pay</th>
                    <th>Net Pay</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {[...payroll.payStubs].reverse().map((stub) => (
                    <tr key={stub.id}>
                      <td>{stub.period}</td>
                      <td>{stub.date}</td>
                      <td>{currency(stub.grossPay)}</td>
                      <td>{currency(stub.netPay)}</td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => setActiveStub(stub)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </div>
        )}

        {tab === "Direct Deposit" && (
          <div className="card card-padded">
            <h3 className="widget-title">Direct Deposit</h3>
            <form onSubmit={saveDeposit}>
              <div className="field">
                <label>Bank name</label>
                <input
                  value={depositForm.bankName}
                  onChange={(e) => setDepositForm((f) => ({ ...f, bankName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-grid-2">
                <div className="field">
                  <label>Account type</label>
                  <select
                    value={depositForm.accountType}
                    onChange={(e) => setDepositForm((f) => ({ ...f, accountType: e.target.value }))}
                  >
                    <option>Checking</option>
                    <option>Savings</option>
                  </select>
                </div>
                <div className="field">
                  <label>Account number (last 4)</label>
                  <input
                    maxLength={4}
                    value={depositForm.accountLast4}
                    onChange={(e) => setDepositForm((f) => ({ ...f, accountLast4: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save direct deposit"}
              </button>
            </form>
          </div>
        )}

        {tab === "Sample Check" && (
          <div className="card card-padded">
            <h3 className="widget-title">Sample Check</h3>
            <p className="stat-caption" style={{ marginTop: -8 }}>
              A preview of your most recent pay stub.
            </p>
            <div className="sample-check">
              <div className="sample-check-header">
                <span>BrightPath Inc.</span>
                <span>Check No. {String(payroll.payStubs.length).padStart(4, "0")}</span>
              </div>
              <div className="sample-check-row">
                <span>Pay to the order of</span>
                <strong>{user.name}</strong>
              </div>
              <div className="sample-check-row">
                <span>Amount</span>
                <strong>{currency(payroll.payStubs.at(-1)?.netPay ?? 0)}</strong>
              </div>
              <div className="sample-check-row">
                <span>Pay period</span>
                <span>{payroll.payStubs.at(-1)?.period}</span>
              </div>
              <div className="sample-check-row">
                <span>Deposited to</span>
                <span>
                  {payroll.directDeposit.bankName} ({payroll.directDeposit.accountType} ••••
                  {payroll.directDeposit.accountLast4})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {activeStub && (
        <Modal title="Pay Stub Detail" onClose={() => setActiveStub(null)} wide>
          <PayStubDetail stub={activeStub} payroll={payroll} user={user} />
        </Modal>
      )}
    </div>
  );
}

function PayStubDetail({ stub, payroll, user }) {
  const d = stubBreakdown(stub, user.benefits?.retirement401k?.contributionPct);

  return (
    <div className="paystub-detail">
      <div className="paystub-detail-header">
        <div>
          <strong>BrightPath Inc.</strong>
          <p>500 Market Street, Suite 300, New York, NY</p>
        </div>
        <div className="paystub-detail-header-right">
          <p>Pay date: {stub.date}</p>
          <p>Pay period: {stub.period}</p>
        </div>
      </div>

      <div className="paystub-detail-employee">
        <div>
          <span className="stat-caption">Employee</span>
          <p>{user.name}</p>
        </div>
        <div>
          <span className="stat-caption">Position</span>
          <p>{user.position}</p>
        </div>
        <div>
          <span className="stat-caption">Pay type</span>
          <p>
            {payroll.payType} · {payroll.payFrequency}
          </p>
        </div>
      </div>

      <div className="table-scroll">
        <table className="paystub-table">
          <thead>
            <tr>
              <th>Earnings</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gross pay</td>
              <td style={{ textAlign: "right" }}>{currency(stub.grossPay)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="table-scroll">
        <table className="paystub-table">
          <thead>
            <tr>
              <th>Deductions</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Federal &amp; state tax withheld</td>
              <td style={{ textAlign: "right" }}>{currency(d.taxesWithheld)}</td>
            </tr>
            <tr>
              <td>Social Security (6.2%)</td>
              <td style={{ textAlign: "right" }}>{currency(d.socialSecurity)}</td>
            </tr>
            <tr>
              <td>Medicare (1.45%)</td>
              <td style={{ textAlign: "right" }}>{currency(d.medicare)}</td>
            </tr>
            <tr>
              <td>401(k) contribution</td>
              <td style={{ textAlign: "right" }}>{currency(d.retirement401k)}</td>
            </tr>
            <tr>
              <td>Health insurance</td>
              <td style={{ textAlign: "right" }}>{currency(d.healthInsurance)}</td>
            </tr>
            <tr>
              <td>Dental insurance</td>
              <td style={{ textAlign: "right" }}>{currency(d.dental)}</td>
            </tr>
            <tr>
              <td>Vision insurance</td>
              <td style={{ textAlign: "right" }}>{currency(d.vision)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="paystub-net">
        <span>Net Pay</span>
        <strong>{currency(stub.netPay)}</strong>
      </div>
    </div>
  );
}
