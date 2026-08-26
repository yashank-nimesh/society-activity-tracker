# Society Activity Tracker

An internal society-management system that tracks how actively members participate in meetings, events, and society-related work: check-ins, contribution logging, an automatically computed activity score, and inactivity detection surfaced on an admin dashboard.

## 1. Project Overview

Core workflow:

```
Member → Meeting/Event Check-In → Contribution Logging → Activity Score → Inactivity Detection → Admin Dashboard
```

Two roles use the same app: **Admins** manage members, events and contributions and view analytics; **Members** check in to events and view their own activity.

## 2. Features

- JWT authentication with bcrypt password hashing
- Role-based access control enforced on the backend (not just hidden buttons)
- Admin: create/search/filter members, create events, log contributions, activate/deactivate accounts
- Member: check in with a temporary code, view personal activity timeline and profile
- Backend-only point calculation (frontend can never set points directly)
- MongoDB unique compound index preventing duplicate attendance
- Deterministic inactivity detection based on the last 3 meetings
- Admin dashboard with summary cards, a pie chart, and several ranked/recent lists

## 3. Tech Stack

- **Frontend:** React 18, Vite, React Router, Axios, Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Auth:** JWT (jsonwebtoken), bcryptjs

## 4. Architecture

Standard three-tier REST architecture:

```
React (Vite SPA) --HTTP/JSON--> Express REST API --Mongoose--> MongoDB
```

The backend follows routes → controllers → services → models. Business logic (points, activity score, inactivity status) lives in a single service file (`services/activityService.js`) rather than scattered across controllers, so it's easy to find and reason about.

## 5. Folder Structure

```
society-activity-tracker/
├── client/
│   ├── src/
│   │   ├── components/     Layout, ProtectedRoute, StatusBadge
│   │   ├── pages/           login, member/*, admin/*
│   │   ├── services/api.js  axios instance + interceptors
│   │   ├── context/AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── models/          User, Event, Attendance, Contribution
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/      auth.js, errorHandler.js
│   │   ├── services/        activityService.js (scoring + inactivity logic)
│   │   ├── config/db.js
│   │   ├── utils/           AppError, catchAsync
│   │   ├── app.js
│   │   └── server.js
│   ├── seed.js
│   └── package.json
│
├── .gitignore
├── .env.example
├── README.md
└── INTERVIEW_GUIDE.md
```

## 6. Database Schema

**User**: name, email (unique), passwordHash (never returned by any API), role (`ADMIN`/`MEMBER`), department, position, joiningDate, isActive.

**Event**: title, date, startTime, type (enum), checkInCode (unique, auto-generated), checkInStart, checkInEnd, createdBy (ref User).

**Attendance**: member (ref User), event (ref Event), checkedInAt, attendancePoints. **Unique compound index on `{ member, event }`.**

**Contribution**: member (ref User), title, description, category (enum), date, points, loggedBy (ref User).

## 7. Setup Instructions

Requires Node.js 18+ and a running MongoDB instance (local `mongod` or a MongoDB Atlas connection string).

**Terminal 1 — backend**

```bash
cd server
cp .env.example .env      # edit MONGO_URI / JWT_SECRET if needed
npm install
npm run seed               # populates demo data
npm run dev                # starts on http://localhost:5000
```

**Terminal 2 — frontend**

```bash
cd client
cp .env.example .env       # VITE_API_URL, defaults to http://localhost:5000/api
npm install
npm run dev                # starts on http://localhost:5173
```

Open `http://localhost:5173` and log in.

## 8. Environment Variables

`server/.env`:

```
MONGO_URI=mongodb://127.0.0.1:27017/society_tracker
JWT_SECRET=replace_this_with_a_long_random_secret
PORT=5000
```

`client/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

## 9. Seed Instructions

`npm run seed` (inside `server/`) wipes and repopulates the four collections: 1 admin, 6 members, 8 events across all event types, a spread of attendance records (deliberately varied so the dashboard shows ACTIVE, LOW ACTIVITY and INACTIVE members), and 7 contributions. The script prints each event's check-in code to the terminal so you can test the check-in flow immediately.

## 10. Demo Credentials

These are demo credentials seeded for local development only — do not reuse them anywhere real.

- **Admin:** `admin@example.com` / `Admin@123`
- **Member (any of the 6 seeded members):** `aisha@example.com`, `rohan@example.com`, `priya@example.com`, `karan@example.com`, `sneha@example.com`, `dev@example.com` — all use password `Member@123`

## 11. API Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/login | Public |
| GET | /api/members | Admin |
| POST | /api/members | Admin |
| GET | /api/members/me/activity | Any authenticated user (own data) |
| GET | /api/members/:id | Admin |
| PATCH | /api/members/:id/status | Admin |
| GET | /api/members/:id/activity | Admin |
| GET | /api/events | Any authenticated user |
| GET | /api/events/:id | Any authenticated user |
| POST | /api/events | Admin |
| POST | /api/attendance/check-in | Member |
| GET | /api/attendance/my | Member |
| GET | /api/attendance/event/:eventId | Admin |
| GET | /api/contributions | Admin |
| POST | /api/contributions | Admin |
| GET | /api/contributions/member/:memberId | Admin, or the member viewing their own |
| GET | /api/dashboard/summary | Admin |

All responses follow `{ success: true, data }` or `{ success: false, message }`.

## 12. Activity Score Calculation

```
Activity Score = Attendance Points + Contribution Points
```

- Attendance points are decided by **event type**, not the frontend: `Weekly Meeting` / `Project Meeting` = 5 points, everything else (`Orientation`, `Workshop`, `Event`) = 10 points.
- Contribution points are decided by the **contribution type** the admin picks (`MINOR` = 5, `MAJOR` = 15) — the admin never types in a raw number, and the frontend never sends points directly.
- The score is never stored on the User document; it's recomputed on demand from the Attendance and Contribution collections in `services/activityService.js`, so it can never drift out of sync or be tampered with directly.

## 13. Inactivity Detection Logic

Deterministic rule, no machine learning:

1. Take the 3 most recent events that have already happened (by date). If fewer than 3 events exist yet, use however many exist.
2. **INACTIVE** — zero attendance records **and** zero contributions during that window.
3. **LOW ACTIVITY** — some activity, but attendance at fewer than half of those recent events.
4. **ACTIVE** — otherwise.

This runs in `computeInactivityStatus()` inside `activityService.js` and is reused by both the admin dashboard and the member's own activity view, so the same rule always produces the same status everywhere.

## 14. Validation Rules

Check-in (`POST /api/attendance/check-in`) validates, in order:

1. Caller is authenticated (401 if not).
2. Caller has role `MEMBER` (403 if not).
3. The code matches an existing event (400 `Invalid check-in code` if not).
4. The current time is within `checkInStart`–`checkInEnd` (400 if not).
5. No existing Attendance record for this member+event (409 `Already checked in`).
6. As a final safety net, the MongoDB unique index also rejects the insert if two requests race past step 5 simultaneously — that duplicate-key error is caught and turned into the same 409 message.

## 15. Authentication / Authorization

- Passwords are hashed with `bcryptjs` before storage; `passwordHash` has `select: false` in the schema and is stripped from every response.
- `POST /api/auth/login` verifies the hash and issues a JWT (`jsonwebtoken`) containing the user's id and role, expiring in 7 days.
- `middleware/auth.js` exports three middleware functions:
  - `authenticate` — verifies the JWT and loads the user onto `req.user`.
  - `requireAdmin` — 403s unless `req.user.role === 'ADMIN'`.
  - `requireMember` — 403s unless `req.user.role === 'MEMBER'`.
- Every protected route composes `authenticate` with the relevant role check, so hitting an admin-only endpoint as a member returns a real 403 from the server, not just a hidden button on the frontend.

## 16. Important Technical Decisions

- **Temporary check-in code instead of QR scanning** — the assignment allows either; the code is far simpler to implement, test, and demo without a camera.
- **Score computed on read, not stored** — avoids a whole class of bugs where a stored score gets out of sync with the underlying attendance/contribution records.
- **Points decided server-side only** — the client sends an event type or a MINOR/MAJOR choice, never a number, closing off a simple abuse vector.
- **No Redux** — the app's state is shallow (auth user + per-page fetched data), so React Context + `useState`/`useEffect` is enough and keeps the codebase approachable.
- **JWT in localStorage** — simplest approach for a local college project; a production app would likely use httpOnly cookies instead (see Limitations).

## 17. Assumptions

- Single MongoDB instance running locally or reachable via `MONGO_URI`; no multi-tenant / multi-society support.
- One check-in code per event, valid for the entire configured window (no rotation).
- "Meetings" for the attendance points table means `Weekly Meeting` and `Project Meeting`; all other event types count as the higher-value "event/workshop" tier.
- Time zones are handled using the server's local time; no explicit multi-timezone support.

## 18. Limitations

- JWT stored in `localStorage` is vulnerable to XSS in a way an httpOnly cookie is not; acceptable for a local assignment, not for production.
- No password-reset or email-verification flow.
- No pagination on member/event/contribution lists — fine at seed-data scale, would need it at real scale.
- Inactivity detection uses a simple fixed rule (last 3 meetings) rather than a configurable policy.
- No automated test suite included (manual/self-check verification only, documented in the project's final self-check).

## 19. Future Improvements

- Pagination and server-side sorting for large member lists.
- Configurable inactivity window (e.g., admin sets "last N meetings").
- Email notifications when a member becomes INACTIVE.
- Move JWT to an httpOnly cookie with CSRF protection.
- Automated tests (Jest/Supertest for the API, React Testing Library for the frontend).

## Duplicate Attendance Prevention (interview-relevant detail)

This is intentionally called out because it's a strong interview topic: relying on "check if a record exists, then insert" from application code is subject to a race condition — two nearly-simultaneous requests can both pass the "does it exist?" check before either insert completes, creating two records. The fix here is a **MongoDB unique compound index** on `{ member: 1, event: 1 }` in `models/Attendance.js`. The database itself guarantees the invariant regardless of timing. The application-level check in the controller still runs first (so most users get a fast, friendly error), and the duplicate-key error (Mongo error code `11000`) is caught as a fallback and converted into the same `409 "You have already checked in to this event."` response in `middleware/errorHandler.js`.
