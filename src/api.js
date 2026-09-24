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

export default client;
