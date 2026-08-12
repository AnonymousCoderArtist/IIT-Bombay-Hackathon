# Smart Campus API Reference

Base URL: `http://localhost:3000` (production URL varies)

All routes except auth endpoints require a valid session cookie set by NextAuth
(`/api/auth/[...nextauth]`).

## Conventions

- **Auth:** Session cookie `authjs.session-token` (or `__Secure-authjs.session-token` on https).
  Unauthenticated requests get `401 { "error": "Unauthorized" }`.
- **Roles:** `student`, `faculty`, `coordinator`, `admin`. Role-restricted endpoints return
  `403 { "error": "<reason>" }`.
- **Errors:** always `{ "error": "<message>" }` with an appropriate status code.
- **Validation:** `zod` — first failing field message is returned as `400`.
- **Rate limiting:** in-memory fixed window per IP/email.

  | Key | Limit |
  |---|---|
  | `register:<ip>` | 5 / min |
  | `verify:<ip>` | 10 / min |
  | `resend:<ip>` | 5 / min |
  | `forgot:<ip>` | 3 / min |
  | `reset:<ip>` | 5 / min |
  | `login:<email>` | 10 / min |

  Exceeding returns `429 { "error": "Too many attempts. Try again later." }`.

## Auth

### `POST /api/auth/register`

Create an account and send a verification OTP.

Body:
```json
{ "name": "Aarav Mehta", "email": "aarav@example.com", "password": "secret123", "role": "student" }
```

- `201` → `{ "message": "...", "user": { "id", "email", "name" } }`
- `409` email already registered.

### `POST /api/auth/register/resend`

Resend the email-verification OTP. Body: `{ "email": "..." }`.

- `200` → `{ "message": "Verification code sent" }`
- `404` no account for email.

### `POST /api/auth/verify-email`

Body: `{ "email": "...", "otp": "123456" }`.

- `200` → `{ "message": "...", "user": { ... } }`
- `400` invalid/expired OTP.

### `POST /api/auth/forgot-password`

Body: `{ "email": "..." }` → sends a password-reset OTP.

- `200` → `{ "message": "..." }` (always, to avoid user enumeration)

### `POST /api/auth/reset-password`

Body: `{ "email": "...", "otp": "...", "password": "..." }`.

- `200` → `{ "message": "..." }`
- `400` invalid/expired OTP or weak password.

### `POST/GET /api/auth/[...nextauth]`

NextAuth handlers — session, sign-in (credentials), sign-out. Passwords are bcrypt-hashed
(cost 12). New accounts start with `emailVerified: false` and `status: "pending"`; login is
blocked until the email is verified and the account is approved/activated.

## Users & profile

### `GET /api/users/me`

Current user profile (joined with department/subjects where applicable).
`200` → `{ "user": { ... } }`

### `DELETE /api/users/me`

Delete the current account. `200` → `{ "message": "..." }`

### `GET /api/users/profile`

Current user's public profile (subjects, bio, etc.).
`200` → `{ "profile": { ... } }`

### `PATCH /api/users/profile`

Update profile fields. Body: any updatable field (e.g. `{ "bio": "...", "subjects": [...] }`).
`200` → `{ "profile": { ... } }`

### `POST /api/users/change-password`

Body: `{ "currentPassword": "...", "newPassword": "..." }`.
`200` → `{ "message": "Password changed" }` · `400` wrong current password.

### `GET /api/users/settings`

Saved preferences.
`200` → `{ "settings": { "theme"?, "emailOptIn"?, "notificationPrefs"? } }`

### `PATCH /api/users/settings`

Body (partial): `{ "theme": "dark", "emailOptIn": true, "notificationPrefs": { "assignment": true, "attendance": false, "event": true, "placement": true } }`
`200` → `{ "settings": { ... } }`

## Dashboard, analytics & search

### `GET /api/analytics`

Role-aware dashboard aggregates (attendance %, upcoming deadlines, events, placements).

### `GET /api/departments`

List all departments.

### `GET /api/search?q=<term>`

Global search across users, notices, events, placements, clubs and assignments.

### `GET /api/health`

Infrastructure health check. `200` → `{ "ok": true, ... }`

## Attendance

### `GET /api/attendance/me`

Student's own attendance records (subject-wise summary + per-session detail).

### `GET /api/attendance/sessions`

List attendance sessions (subject/faculty filtered by role).

### `POST /api/attendance/sessions`

Create a session (faculty/admin).

Body: `{ "subject": "...", "date": "...", "present": ["studentId", ...] }`
`200` → created session.

### `GET /api/attendance/sessions/[id]`

Session detail including per-student status.

### `PATCH /api/attendance/sessions/[id]`

Update session (mark/unmark students). Body: `{ "present": ["studentId", ...] }`

## Assignments & submissions

### `GET /api/assignments`

List assignments — students see published ones, faculty/admin see all.

### `POST /api/assignments`

Publish an assignment (faculty/admin).

Body: `{ "title": "...", "description": "...", "subject"?, "deadline": "...", "rubric"?, "subjects"?: [...] }`

### `GET /api/assignments/[id]`

Assignment detail with rubric and, for faculty, submission summary.

### `POST /api/assignments/[id]/submissions`

Submit an assignment (student). Body: `{ "content"?: "...", "files"?: [...] }`

### `GET /api/submissions`

List the current user's submissions.

### `PATCH /api/submissions/[id]`

Grade or give feedback (faculty/admin). Body: `{ "score"?: number, "feedback"?: "...", "status"? }`

## Events

### `GET /api/events`

List events (future/scheduled, with registration status for the caller).

### `POST /api/events`

Create an event (admin/coordinator).

Body: `{ "title": "...", "description": "...", "date": "...", "venue"?, "capacity"?, "registrationDeadline"? }`

### `GET /api/events/[id]/register`

Registration status for the current user; returns the QR pass (data URL) if registered.

### `POST /api/events/[id]/register`

Register the current student. Validates deadline, capacity and duplicate registration.
`201` → `{ "registration": { ... }, "qrCode": "<data-url>" }` (QR payload is signed with HMAC).

### `POST /api/events/[id]/cancel`

Cancel the current user's registration.

## Placements

### `GET /api/placements`

List openings — students see only those matching eligibility.

### `POST /api/placements`

Create an opening (admin/coordinator).

Body: `{ "company": "...", "role": "...", "ctc"?, "eligibility"? }`

### `POST /api/placements/[id]/apply`

Apply to an opening (student). `200` → `{ "message": "Applied", "application": { ... } }`

## Clubs

### `GET /api/clubs`

List clubs with member counts.

### `POST /api/clubs`

Create a club (admin/coordinator/faculty).

### `POST /api/clubs/[id]`

Join/leave the club (student toggles membership).

### `DELETE /api/clubs/[id]`

Delete a club (admin).

## Notices

### `GET /api/notices`

List notices.

### `POST /api/notices`

Publish a notice (admin/coordinator/faculty).

## Notifications

### `GET /api/notifications`

`200` → `{ "notifications": [...], "unreadCount": number }`

### `PATCH /api/notifications`

Body: `{ "all": true }` (mark all read) **or** `{ "id": "<notificationId>" }` (mark one).
`200` → `{ "message": "..." }`

## Admin

### `GET /api/admin/users`

List all users with filters (`role`, `status`, `search`). Admin only.

### `PATCH /api/admin/users`

Update a user (role, status, department). Body: `{ "id": "...", "role"?, "status"?, "department"? }`. Admin only.

### `DELETE /api/admin/users`

Delete a user. Body: `{ "id": "..." }`. Admin only.

### `GET /api/admin/logs`

Recent activity logs (paged). Admin only.

## Files

### `POST /api/upload`

Upload a file (multipart). `200` → `{ "url": "/uploads/..." }` (local dev) or a CDN URL.

## AI (Python service — `services/ai/`)

Next.js `/api/chat` aur `/api/lecture-notes` call karte hain. Python service
direct bhi use kar sakte ho (FastAPI Swagger: `http://localhost:8000/docs`).

### `POST /api/chat`

Body: `{ "question": string }` → `200` `{ "answer", "sources": string[], "provider" }`
IIT Bombay campus RAG — grounded answers with citations. Rate limited (30/min).

### `GET/POST/DELETE /api/lecture-notes`

GET → apne saved notes; POST body `{ title, subject?, transcript, durationSec?, source? }`
→ structured study notes (summary, keyPoints, actionItems); DELETE `?id=` → note delete.

### Python service direct

| Method | Path | Purpose |
|---|---|---|
| GET | `:8000/health` | Status + provider + KB size |
| POST | `:8000/chat` | RAG chatbot (citations) |
| POST | `:8000/summarize` | Transcript → summary + key points + action items |
| POST | `:8000/match` | Job skills vs student skills → match % + gaps |
| POST | `:8000/sentiment` | Feedback → positive/negative/neutral |

> AI service down ho ya API key na ho toh sab gracefully fallback/mock hota hai —
> app kabhi break nahi hota.

## Common status codes

| Code | Meaning |
|---|---|
| 200/201 | Success |
| 400 | Validation / bad request |
| 401 | Not authenticated |
| 403 | Wrong role for action |
| 404 | Resource not found |
| 409 | Duplicate / conflict |
| 429 | Rate limited |
| 500 | Server error |
