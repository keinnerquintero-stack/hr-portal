import { useRef, useState } from "react";
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
  const textareaRef = useRef(null);

  function pickFaq(question) {
    setMessage(question);
    textareaRef.current?.focus();
  }

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
            {!sent && (
              <div className="help-faq">
                {FAQS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="help-faq-item"
                    onClick={() => pickFaq(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {sent ? (
              <div className="alert alert-success" style={{ marginBottom: 0 }}>
                Thanks! Your question was sent to HR.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="field" style={{ marginBottom: 10 }}>
                  <textarea
                    ref={textareaRef}
                    placeholder="Type your question, or tap one above…"
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
