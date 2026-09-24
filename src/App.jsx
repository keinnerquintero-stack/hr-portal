import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { GuestRoute, ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import LeaveRequestsPage from "./pages/LeaveRequestsPage";
import AdminPage from "./pages/AdminPage";
import { AboutPage, EmployeePolicyPage, HRPolicyPage } from "./pages/InfoPages";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/about" element={<AboutPage />} />
        <Route path="/hr-policy" element={<HRPolicyPage />} />
        <Route path="/employee-policy" element={<EmployeePolicyPage />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leave" element={<LeaveRequestsPage />} />
        </Route>

        <Route element={<ProtectedRoute requireHR />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
