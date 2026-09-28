import { createContext, useContext, useEffect, useState } from "react";
import {
  createAccount,
  findUser,
  getEmployee,
  usernameExists,
} from "../api";
import { DEFAULT_DASHBOARD_WIDGETS } from "../dashboardWidgets";

const AuthContext = createContext(null);
const SESSION_KEY = "hrPortalSession";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      setSession(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  async function login(username, password, role) {
    const user = await findUser(username.trim(), password, role);
    if (!user) {
      throw new Error("Invalid username, password, or role.");
    }
    const employee = await getEmployee(user.employeeId);
    const nextSession = {
      userId: user.id,
      username: user.username,
      role: user.role,
      employee,
    };
    setSession(nextSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    return nextSession;
  }

  async function signup({ name, email, phone, department, position, username, password }) {
    if (await usernameExists(username.trim())) {
      throw new Error("That username is already taken.");
    }
    const employeeId = `e${Date.now()}`;
    const employee = {
      id: employeeId,
      name,
      email,
      department,
      position,
      phone,
      joinDate: new Date().toISOString().slice(0, 10),
      status: "Active",
      manager: "Unassigned",
      leaveBalance: 15,
      dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS,
      benefits: {
        healthPlan: "BrightPath PPO Silver",
        dentalPlan: "Delta Dental Basic",
        visionPlan: "VSP Choice",
        retirement401k: { enrolled: false, contributionPct: 0 },
        dependents: [],
        beneficiaries: [],
      },
      payroll: {
        payType: "Salary",
        payRate: 65000,
        payFrequency: "Bi-Weekly",
        taxSetup: { filingStatus: "Single", allowances: 1, state: "NY" },
        directDeposit: { bankName: "", accountLast4: "", accountType: "Checking" },
        payStubs: [],
      },
    };
    const user = {
      id: `u${Date.now()}`,
      username: username.trim(),
      password,
      role: "employee",
      employeeId,
    };
    const createdUser = await createAccount({ user, employee });
    const nextSession = {
      userId: createdUser.id,
      username: createdUser.username,
      role: createdUser.role,
      employee,
    };
    setSession(nextSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    return nextSession;
  }

  function refreshEmployee(employee) {
    setSession((prev) => {
      const next = { ...prev, employee };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      return next;
    });
  }

  function logout() {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  }

  const value = {
    session,
    user: session?.employee ?? null,
    role: session?.role ?? null,
    isAuthenticated: !!session,
    isHR: session?.role === "hr",
    loading,
    login,
    signup,
    logout,
    refreshEmployee,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
