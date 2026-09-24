# BrightPath HR Portal

A responsive HR portal built with React and React Router. Employees can log in,
manage their profile, submit leave requests, and see a dashboard they can
customize. HR staff get everything an employee gets, plus an Admin Panel for
managing the employee directory, approving leave, tracking onboarding, and
posting company announcements.

## Tech Stack

- React (Vite)
- React Router for routing and protected/role-based routes
- Context API for authentication state
- Axios for API calls
- json-server as a mock REST API, backed by `db.json`
- Plain CSS with a shared design system (`src/index.css`)

## Getting Started

Install dependencies once:

```bash
npm install
```

Run the app (starts both the Vite dev server and the json-server API together):

```bash
npm run start
```

- Frontend: http://localhost:5173
- API: http://localhost:4000

You can also run them separately with `npm run dev` and `npm run server`.

## Test Credentials

Use the two "Test Login" buttons on the login page to auto-fill credentials,
or enter them manually:

| Role     | Username    | Password    |
| -------- | ----------- | ----------- |
| Employee | employee1   | employee123 |
| HR Staff | hradmin     | hr123456    |

New employees can also register their own account from the Sign Up page.

## Project Structure

```
src/
  api.js                 API calls to the json-server backend
  context/AuthContext.jsx Authentication state and session persistence
  components/            Navbar, Sidebar, ProtectedRoute, Modal
  pages/                 Login, Signup, Dashboard, Profile, Leave, Admin, Info pages
db.json                  Seed data for employees, users, leave requests, onboarding, announcements
```

## Features

- Role-based login (Employee / HR Staff) with route protection
- Employee self-registration
- Customizable dashboard widgets (profile, leave balance, announcements, onboarding, quick actions)
- Leave request submission and history
- HR Admin Panel: employee directory (add/edit/remove), leave approvals, onboarding tracker, announcements
