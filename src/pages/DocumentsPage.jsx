import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createDocument, getDocumentsForEmployee } from "../api";
import "./DocumentsPage.css";

const CATEGORIES = ["Employment", "Company Policy", "Tax Form", "Benefits", "Other"];

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    load();
  }, [user.id]);

  async function load() {
    setLoading(true);
    const data = await getDocumentsForEmployee(user.id);
    setDocuments(data.sort((a, b) => new Date(b.uploadedDate) - new Date(a.uploadedDate)));
    setLoading(false);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setUploading(true);
    try {
      await createDocument({
        employeeId: user.id,
        name,
        category,
        uploadedDate: new Date().toISOString().slice(0, 10),
      });
      setName("");
      await load();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Documents</h1>
          <p className="dashboard-subtitle">Company policies and your personal employment documents.</p>
        </div>
      </div>

      <div className="documents-layout">
        <div className="card card-padded">
          <h3 className="widget-title">Upload a Document</h3>
          <form onSubmit={handleUpload}>
            <div className="field">
              <label>Document name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Signed W-4" required />
            </div>
            <div className="field">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={uploading}>
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </form>
        </div>

        <div className="card card-padded">
          <h3 className="widget-title">Your Documents</h3>
          {loading ? (
            <p className="widget-empty">Loading…</p>
          ) : documents.length === 0 ? (
            <div className="empty-state">No documents yet.</div>
          ) : (
            <ul className="document-list">
              {documents.map((d) => (
                <li key={d.id} className="document-item">
                  <span className="document-icon">📄</span>
                  <div className="document-meta">
                    <span className="mini-list-title">{d.name}</span>
                    <span className="mini-list-sub">
                      {d.category} · Uploaded {d.uploadedDate}
                    </span>
                  </div>
                  <button className="btn btn-outline btn-sm">Download</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
