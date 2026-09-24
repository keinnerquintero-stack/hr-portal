import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createHelpRequest } from "../api";

const FAQS = [
  "How do I request time off?",
  "Where can I see my pay stubs?",
  "How do I update my direct deposit?",
];

export default function FloatingHelp() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    await createHelpRequest({
      employeeId: user.id,
      employeeName: user.name,
      message,
      date: new Date().toISOString().slice(0, 10),
      status: "Open",
    });
    setSending(false);
    setSent(true);
    setMessage("");
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <>
      {open && (
        <div className="help-panel">
          <div className="help-panel-header">
            <h4>Ask HR</h4>
            <p>We usually reply within one business day.</p>
          </div>
          <div className="help-panel-body">
            <div className="help-faq">
              {FAQS.map((q) => (
                <div key={q} className="help-faq-item">
                  {q}
                </div>
              ))}
            </div>

            {sent ? (
              <div className="alert alert-success" style={{ marginBottom: 0 }}>
                Thanks! Your question was sent to HR.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="field" style={{ marginBottom: 10 }}>
                  <textarea
                    placeholder="Type your question…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ minHeight: 70 }}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-sm" style={{ width: "100%" }} disabled={sending}>
                  {sending ? "Sending…" : "Send to HR"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <button
        className="help-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label="Help center"
        type="button"
      >
        {open ? "×" : "💬"}
      </button>
    </>
  );
}
