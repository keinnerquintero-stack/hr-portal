import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { GuestRoute, ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import TimeManagementPage from "./pages/TimeManagementPage";
import BenefitsPage from "./pages/BenefitsPage";
import PayrollPage from "./pages/PayrollPage";
import DocumentsPage from "./pages/DocumentsPage";
import LearningPage from "./pages/LearningPage";
import JobsPage from "./pages/JobsPage";
import AdminPage from "./pages/AdminPage";
import { AboutPage, EmployeePolicyPage, HRPolicyPage } from "./pages/InfoPages";
import NotFoundPage from "./pages/NotFoundPage";

function InfoRoute({ children }) {
  const location = useLocation();
  return (
    <div className="page-transition" key={location.pathname}>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/about" element={<InfoRoute><AboutPage /></InfoRoute>} />
        <Route path="/hr-policy" element={<InfoRoute><HRPolicyPage /></InfoRoute>} />
        <Route path="/employee-policy" element={<InfoRoute><EmployeePolicyPage /></InfoRoute>} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<InfoRoute><LoginPage /></InfoRoute>} />
          <Route path="/signup" element={<InfoRoute><SignupPage /></InfoRoute>} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/time" element={<TimeManagementPage />} />
          <Route path="/leave" element={<TimeManagementPage />} />
          <Route path="/benefits" element={<BenefitsPage />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/jobs" element={<JobsPage />} />
        </Route>

        <Route element={<ProtectedRoute requireHR />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
