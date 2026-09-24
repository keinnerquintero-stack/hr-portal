import { Link } from "react-router-dom";
import "./InfoPages.css";

export default function NotFoundPage() {
  return (
    <div className="info-page" style={{ textAlign: "center" }}>
      <h1>404</h1>
      <p className="info-page-subtitle">We couldn't find the page you were looking for.</p>
      <Link to="/" className="btn btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
}
