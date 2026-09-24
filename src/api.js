import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:4000",
});

export async function findUser(username, password, role) {
  const { data } = await client.get("/users", {
    params: { username, password, role },
  });
  return data[0] || null;
}

export async function usernameExists(username) {
  const { data } = await client.get("/users", { params: { username } });
  return data.length > 0;
}

export async function createAccount({ user, employee }) {
  await client.post("/employees", employee);
  const { data: createdUser } = await client.post("/users", user);
  return createdUser;
}

export async function getEmployees() {
  const { data } = await client.get("/employees");
  return data;
}

export async function createEmployee(employee) {
  const { data } = await client.post("/employees", employee);
  return data;
}

export async function getEmployee(id) {
  const { data } = await client.get(`/employees/${id}`);
  return data;
}

export async function updateEmployee(id, changes) {
  const { data } = await client.patch(`/employees/${id}`, changes);
  return data;
}

export async function deleteEmployee(id) {
  await client.delete(`/employees/${id}`);
}

export async function getLeaveRequests() {
  const { data } = await client.get("/leaveRequests");
  return data;
}

export async function getLeaveRequestsForEmployee(employeeId) {
  const { data } = await client.get("/leaveRequests", {
    params: { employeeId },
  });
  return data;
}

export async function createLeaveRequest(request) {
  const { data } = await client.post("/leaveRequests", request);
  return data;
}

export async function updateLeaveRequest(id, changes) {
  const { data } = await client.patch(`/leaveRequests/${id}`, changes);
  return data;
}

export async function getOnboarding() {
  const { data } = await client.get("/onboarding");
  return data;
}

export async function updateOnboarding(id, changes) {
  const { data } = await client.patch(`/onboarding/${id}`, changes);
  return data;
}

export async function createOnboarding(record) {
  const { data } = await client.post("/onboarding", record);
  return data;
}

export async function getAnnouncements() {
  const { data } = await client.get("/announcements");
  return [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function createAnnouncement(announcement) {
  const { data } = await client.post("/announcements", announcement);
  return data;
}

export async function deleteAnnouncement(id) {
  await client.delete(`/announcements/${id}`);
}

// Alerts

export async function getAlertsForEmployee(employeeId) {
  const { data } = await client.get("/alerts");
  return data
    .filter((a) => a.employeeId === employeeId || a.employeeId === "all")
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function createAlert(alert) {
  const { data } = await client.post("/alerts", alert);
  return data;
}

export async function markAlertRead(id) {
  const { data } = await client.patch(`/alerts/${id}`, { read: true });
  return data;
}

// Job postings & applications

export async function getJobPostings() {
  const { data } = await client.get("/jobPostings");
  return data;
}

export async function createJobPosting(posting) {
  const { data } = await client.post("/jobPostings", posting);
  return data;
}

export async function updateJobPosting(id, changes) {
  const { data } = await client.patch(`/jobPostings/${id}`, changes);
  return data;
}

export async function getJobApplications() {
  const { data } = await client.get("/jobApplications");
  return data;
}

export async function getJobApplicationsForEmployee(employeeId) {
  const { data } = await client.get("/jobApplications", { params: { employeeId } });
  return data;
}

export async function createJobApplication(application) {
  const { data } = await client.post("/jobApplications", application);
  return data;
}

// Learning: training, videos, courses, certifications

export async function getLearningItems() {
  const { data } = await client.get("/learningItems");
  return data;
}

export async function getLearningItemsForEmployee(employeeId) {
  const { data } = await client.get("/learningItems", { params: { employeeId } });
  return data;
}

export async function createLearningItem(item) {
  const { data } = await client.post("/learningItems", item);
  return data;
}

export async function updateLearningItem(id, changes) {
  const { data } = await client.patch(`/learningItems/${id}`, changes);
  return data;
}

export async function getCertificationsForEmployee(employeeId) {
  const { data } = await client.get("/certifications", { params: { employeeId } });
  return data;
}

export async function createCertification(cert) {
  const { data } = await client.post("/certifications", cert);
  return data;
}

// Documents

export async function getDocumentsForEmployee(employeeId) {
  const { data } = await client.get("/documents");
  return data.filter((d) => d.employeeId === employeeId || d.employeeId === "all");
}

export async function getDocuments() {
  const { data } = await client.get("/documents");
  return data;
}

export async function createDocument(doc) {
  const { data } = await client.post("/documents", doc);
  return data;
}

// Time management: timesheets, punch requests, scheduling

export async function getTimesheets() {
  const { data } = await client.get("/timesheets");
  return data;
}

export async function getTimesheetsForEmployee(employeeId) {
  const { data } = await client.get("/timesheets", { params: { employeeId } });
  return data;
}

export async function createTimesheet(timesheet) {
  const { data } = await client.post("/timesheets", timesheet);
  return data;
}

export async function updateTimesheet(id, changes) {
  const { data } = await client.patch(`/timesheets/${id}`, changes);
  return data;
}

export async function getPunchRequests() {
  const { data } = await client.get("/punchRequests");
  return data;
}

export async function getPunchRequestsForEmployee(employeeId) {
  const { data } = await client.get("/punchRequests", { params: { employeeId } });
  return data;
}

export async function createPunchRequest(request) {
  const { data } = await client.post("/punchRequests", request);
  return data;
}

export async function updatePunchRequest(id, changes) {
  const { data } = await client.patch(`/punchRequests/${id}`, changes);
  return data;
}

export async function getScheduleForEmployee(employeeId) {
  const { data } = await client.get("/schedules", { params: { employeeId } });
  return data[0] || null;
}

// Help center

export async function createHelpRequest(request) {
  const { data } = await client.post("/helpRequests", request);
  return data;
}

export async function getHelpRequests() {
  const { data } = await client.get("/helpRequests");
  return data;
}

export async function updateHelpRequest(id, changes) {
  const { data } = await client.patch(`/helpRequests/${id}`, changes);
  return data;
}

export default client;
