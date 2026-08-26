# Society Activity Tracker

A society management system that tracks how actively members participate in meetings, events, and society-related work. It handles event check-ins, contribution logging, calculates an activity score per member, and automatically flags members as inactive based on recent participation.

## Core Workflow

```
Member
  ↓
Meeting/Event Check-In
  ↓
Contribution Logging
  ↓
Activity Score
  ↓
Inactivity Detection
  ↓
Admin Dashboard
```

Two roles use the same application:
- **Admin** — manages members, creates events, logs contributions, and views analytics.
- **Member** — checks in to events and views their own activity.

## Features

### Admin
- Add, search, and filter members
- View individual member profiles and activity
- Activate/deactivate member accounts
- Create events (meetings, workshops, orientations, etc.)
- Log contributions on behalf of members
- View a dashboard with summary stats, an activity status chart, and recent activity

### Member
- Log in and view a personal dashboard
- Check in to an event using a temporary check-in code
- View a personal activity timeline
- View profile and activity statistics

## Tech Stack

| Layer          | Technology                          |
|----------------|--------------------------------------|
| Frontend       | React, Vite, React Router, Axios, Recharts |
| Backend        | Node.js, Express                    |
| Database       | MongoDB (Atlas), Mongoose           |
| Authentication | JWT (jsonwebtoken), bcryptjs         |

## Architecture

```
React Frontend
      |
      | HTTP / JSON
      ↓
Express REST API
      |
      ↓
Routes → Controllers → Services → Models
      |
      ↓
MongoDB (via Mongoose)
```

Business logic for scoring and inactivity detection is centralized in a single service (`services/activityService.js`) rather than spread across controllers.

## Project Structure

```
society-activity-tracker/
├── client/
│   └── src/
│       ├── components/     Layout, ProtectedRoute, StatusBadge
│       ├── pages/          login, member/*, admin/*
│       ├── services/       api.js (axios instance + interceptors)
│       └── context/        AuthContext.jsx
│
├── server/
│   └── src/
│       ├── models/         User, Event, Attendance, Contribution
│       ├── routes/
│       ├── controllers/
│       ├── middleware/     auth.js, errorHandler.js
│       ├── services/       activityService.js
│       └── config/         db.js
│
├── start.bat
└── README.md
```

## Database Design

| Model        | Purpose                              |
|--------------|---------------------------------------|
| User         | Stores admin and member accounts      |
| Event        | Stores meetings/events and check-in details |
| Attendance   | Links a member to an event they checked into |
| Contribution | Stores work logged on behalf of a member |

```
User
 ├── creates    → Event
 ├── has many   → Attendance
 └── has many   → Contribution
```

The **Attendance** model has a unique compound index on `{ member, event }`, ensuring a member can only have one attendance record per event.

## Authentication & Authorization

- **Authentication** answers "who are you?" — passwords are hashed with bcrypt before being stored, and login issues a JWT containing the user's id and role.
- **Authorization** answers "what are you allowed to do?" — every protected route is guarded by middleware (`authenticate`, `requireAdmin`, `requireMember`) on the backend.

Role checks are enforced at the API level, not just hidden in the UI — a member calling an admin-only endpoint directly receives a 403 regardless of what the frontend shows.

## Attendance Check-In Flow

```
Member enters code
      ↓
Authenticate request
      ↓
Validate member role
      ↓
Find event by check-in code
      ↓
Validate check-in window (start/end time)
      ↓
Check for existing attendance record
      ↓
Create attendance record
      ↓
Assign attendance points (server-side)
```

## Duplicate Attendance Prevention

Duplicate check-ins are prevented in two layers:

1. **Application-level check** — the controller looks for an existing Attendance record for that member/event before inserting a new one.
2. **Database-level constraint** — a MongoDB unique compound index on `{ member, event }` guarantees this at the database layer, regardless of timing.

The database constraint matters because two nearly-simultaneous requests could both pass the application-level check before either insert completes. The unique index prevents the second insert from ever succeeding, and the resulting duplicate-key error is caught and converted into a clear `409 Conflict` response.

## Activity Score Calculation

```
Activity Score = Attendance Points + Contribution Points
```

- **Attendance points** are determined by event type: `Weekly Meeting` / `Project Meeting` = 5 points, `Orientation` / `Workshop` / `Event` = 10 points.
- **Contribution points** are determined by the contribution type an admin selects: `MINOR` = 5, `MAJOR` = 15.
- Points are always decided on the backend — the client never sends a raw point value.
- The score is **not stored** on the User document. It's recalculated on demand from Attendance and Contribution records, so it can never drift out of sync.

## Inactivity Detection

1. Identify the 3 most recent events that have already occurred (fewer than 3 if the society hasn't held that many yet).
2. Check the member's attendance and contribution activity within that window.
3. Classify the member:
   - **INACTIVE** — no attendance and no contributions in that window.
   - **LOW ACTIVITY** — some activity, but attendance at fewer than half of those recent events.
   - **ACTIVE** — otherwise.

This is deterministic business logic, not a predictive or learned model.

## API Endpoints

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/members` | Admin | List/search/filter members |
| POST | `/api/members` | Admin | Create a member |
| GET | `/api/members/me/activity` | Authenticated | Own activity summary |
| GET | `/api/members/:id` | Admin | Member profile |
| PATCH | `/api/members/:id/status` | Admin | Activate/deactivate account |
| GET | `/api/members/:id/activity` | Admin | Member activity summary |
| GET | `/api/events` | Authenticated | List events |
| GET | `/api/events/:id` | Authenticated | Event details |
| POST | `/api/events` | Admin | Create event |
| POST | `/api/attendance/check-in` | Member | Check in to an event |
| GET | `/api/attendance/my` | Member | Own attendance history |
| GET | `/api/attendance/event/:eventId` | Admin | Attendance for an event |
| GET | `/api/contributions` | Admin | List contributions |
| POST | `/api/contributions` | Admin | Log a contribution |
| GET | `/api/contributions/member/:memberId` | Admin, or the member's own | Contributions for a member |
| GET | `/api/dashboard/summary` | Admin | Dashboard analytics |

Responses follow `{ success: true, data }` on success or `{ success: false, message }` on error.

## Validation & Error Handling

Common validation errors and their responses:

| Scenario | Status |
|----------|--------|
| Missing/invalid login credentials | 401 |
| Missing or invalid JWT | 401 |
| Insufficient role for the endpoint | 403 |
| Invalid check-in code | 400 |
| Check-in attempted outside the check-in window | 400 |
| Duplicate attendance | 409 |
| Resource not found (member, event, etc.) | 404 |

Errors are handled by a centralized Express error-handling middleware, which also catches Mongoose validation errors, invalid ObjectIds, and MongoDB duplicate-key errors.

## Application Screens

**Admin:** Dashboard, Members, Member Details, Events, Event Details, Contributions

**Member:** Dashboard, Check-In, My Activity, My Profile

## Setup & Installation

### Prerequisites

- Node.js 18+
- A MongoDB connection string (MongoDB Atlas or local MongoDB)

### Clone

```bash
git clone <your-repository-url>
```

### Windows — one-click setup

Run `start.bat` from the project root. It will:

```
start.bat
   ↓
Creates server/.env and client/.env from .env.example if missing
   ↓
Installs dependencies for server/ and client/ if missing
   ↓
Starts the backend (http://localhost:5000)
   ↓
Starts the frontend (http://localhost:5173)
```

### Manual setup (any OS)

**Backend**
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

**Frontend**
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Then open `http://localhost:5173`.

### Environment Variables

`server/.env`
```env
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
PORT=5000
```

`client/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

Real `.env` files are never committed to this repository — only `.env.example` templates are tracked.

## Demo Credentials

Demo credentials are provided separately for evaluation and are not published in this README, since this project connects to a persistent database rather than a disposable local sandbox.

## Important Technical Decisions

**Temporary check-in code instead of QR scanning**
Simpler to implement, test, and demonstrate without requiring camera access.

**Server-side point calculation**
The client only sends an event type or a MINOR/MAJOR contribution choice — never a raw point value — so points can't be tampered with from the frontend.

**Dynamically calculated activity score**
Calculating the score on read, rather than storing it, avoids the score ever drifting out of sync with the underlying Attendance/Contribution records.

**MongoDB unique compound index for attendance**
Provides a database-level guarantee against duplicate check-ins that application code alone cannot fully provide under concurrent requests.

**React Context instead of Redux**
The app's state is shallow (auth user plus per-page fetched data), so Context and `useState`/`useEffect` are sufficient without added complexity.

## Assumptions

- Single society/organization — no multi-tenant support.
- One check-in code per event, valid for the entire configured check-in window.
- "Meetings" (`Weekly Meeting`, `Project Meeting`) are worth fewer points than other event types (`Orientation`, `Workshop`, `Event`).
- Server's local time is used for all time-based checks.

## Limitations

- JWT is stored in `localStorage`, which is more vulnerable to XSS than an httpOnly cookie.
- No password-reset or email-verification flow.
- No pagination on member/event/contribution lists.
- Inactivity detection uses a fixed rule (last 3 meetings) rather than a configurable policy.
- No automated test suite.

## Future Improvements

- Pagination and server-side sorting for large lists
- Configurable inactivity window
- Email notifications when a member becomes inactive
- Move JWT to an httpOnly cookie with CSRF protection
- Automated tests (Jest/Supertest for the API, React Testing Library for the frontend)