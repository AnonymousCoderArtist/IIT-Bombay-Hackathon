# Smart Campus Management Platform

Ek hi platform pe campus ki saari cheezein — attendance, assignments, events, placements, notifications. Students, faculty, coordinators aur admin ke liye alag dashboards.

Built for **DevFusion 4.0: The Developers Hackathon**.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Next.js API routes, MongoDB (Mongoose)
- **Auth:** NextAuth v5 — Email + OTP, Google OAuth, JWT sessions
- **Extras:** QR event passes, email via SMTP, activity logs, dark/light mode

## Features

- Role-based dashboards (Student / Faculty / Coordinator / Admin)
- Attendance — faculty creates sessions, students get subject-wise analytics
- Assignments — upload with deadline + rubric, submit (file / GitHub link), grade with feedback
- Events — register, cancel, QR pass download
- Placements — company listings, apply with resume, application status
- Notifications — assignments, attendance, events, placements, alerts
- Global search + analytics charts
- Admin panel — user management, roles, activity logs

## Quick Start

Pehle kuch cheezein chahiye:

- Node.js 18.18+ (20+ recommended)
- MongoDB — local ya [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier kaafi hai)

```bash
# 1. Repo clone karo
git clone https://github.com/AnonymousCoderArtist/IIT-Bombay-Hackathon.git
cd IIT-Bombay-Hackathon

# 2. Dependencies install karo
npm install

# 3. Environment setup
cp .env.example .env
# .env mein MONGODB_URI daalo (aur AUTH_SECRET - `openssl rand -base64 32` se bana sakte ho)

# 4. Database seed karo (sample data + test users)
npm run seed

# 5. Dev server chalayo
npm run dev
```

[http://localhost:3000](http://localhost:3000) pe kholo.

## Test Credentials

| Role | Email | Password |
| ---- | ----- | -------- |
| Admin | `admin@smartcampus.edu` | `Admin@123` |
| Coordinator | `coordinator@smartcampus.edu` | `Coord@123` |
| Faculty | `faculty@smartcampus.edu` | `Faculty@123` |
| Student | `student@smartcampus.edu` | `Student@123` |

## Testing Guide

> **Full detailed step-by-step guide har feature ke liye:** [`docs/TESTING.md`](docs/TESTING.md)

### Step 1 — Setup

```bash
# 1. Local MongoDB chalu karo (ya Atlas URL .env mein daalo)
# Docker ke bina (Arch): sudo systemctl start mongodb   (install: yay -S mongodb-bin mongosh-bin)
# Docker se: docker run -d --name smc-mongo -p 27017:27017 mongo:7

# 2. Dependencies + env
npm install
cp .env.example .env
# .env mein AUTH_SECRET daalo:  openssl rand -base64 32

# 3. Sample data daalo (4 test users + departments + events + assignments etc.)
npm run seed

# 4. Dev server
npm run dev
```

[http://localhost:3000](http://localhost:3000) pe kholo.

### Step 2 — Automated checks

```bash
# Typecheck + lint (fast, har baar chalao)
npm run check

# API sanity check (dev server ON hona chahiye)
npm run test
# Output: "Sab theek hai. App ready hai!" — matlab health, DB aur saare APIs responding hain
```

### Step 3 — Manual testing (demo flow)

Har role ke saath login karke is flow pe chalo. Ek tab mein app, ek tab mein API route check kar sakte ho.

**Login flow:**
1. Register page pe jao, `name + email + password` se sign up karo (OTP aayega)
2. OTP kaise milega? `.env` mein SMTP nahi hai toh email send nahi hoti — **dev server ke terminal log mein `[mail:...]` wali line mein OTP dikhta hai**. Wahi 6-digit code daalo. (10 min valid)
3. Verify ke baad login karo

**Student (`student@smartcampus.edu` / `Student@123`):**
- Dashboard — attendance %, deadlines, upcoming events
- Attendance — apni subject-wise percentage dekho
- Assignments — list dekho, kisi pe submit karo (content ya GitHub link)
- Events — kisi event pe register karo → **QR pass milta hai** (download karo), phir cancel bhi karo
- Placements — listing dekho, apply karo, status track karo
- Clubs — kisi club mein join/leave karo
- Settings — theme dark/light karo, notification toggles on/off karo, **page refresh karke check karo sab save rehta hai**

**Faculty (`faculty@smartcampus.edu` / `Faculty@123`):**
- Attendance — naya session banao, students present/absent mark karo
- Assignments — assignment create karo (deadline + rubric ke saath), submissions dekho, grade + feedback do
- Notices — naya notice post karo

**Coordinator (`coordinator@smartcampus.edu` / `Coord@123`):**
- Events — naya event banao (date, venue, capacity ke saath)
- Placements — nayi company opening post karo (role, CTC, eligibility)
- Clubs — naya club banao

**Admin (`admin@smartcampus.edu` / `Admin@123`):**
- Dashboard — pura analytics (students, events, submissions sab)
- Users — list dekho, role/status change karo, delete karo
- Activity Logs — saari activity dekh sakte ho

**Cross-cutting checks (kisi bhi role se):**
- 🔍 Top search bar — "AI", "hackathon", "club" type karke global search test karo
- 🔔 Notifications — bell icon pe unread count, notifications page pe mark-as-read
- 📱 **Mobile** — browser devtools se phone view (360px) kholo, hamburger menu se sidebar khulna chahiye
- 🌙 Dark mode — topbar toggle + Settings dono se check karo
- Password change — Settings → Change Password (purana password + naya)
- Logout → phir se login

### Step 4 — API quick checks (curl)

```bash
# Health + DB
curl http://localhost:3000/api/health

# Public auth flow (nae email se)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@123","role":"student"}'

# Bina login ke protected route → 401 aana chahiye
curl http://localhost:3000/api/events            # → {"error":"Unauthorized"}

# Rate limit test (5+ baar same IP se register karo → 429)
for i in $(seq 1 6); do curl -s -o /dev/null -w "%{http_code} " \
  -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Spam","email":"spam@example.com","password":"Test@123","role":"student"}'; done
# Output: 201 201 201 201 201 429   ← 6th request rate-limited
```

### Step 5 — Demo recording tips

- 2-minute video ke liye: landing → register/verify → login (student) → dashboard → attendance → assignment submit → event register (QR) → placements apply → admin login → analytics + users → dark mode + mobile view
- Screen recorder ke saath `npm run dev` terminal dikhana mat bhoolo jahan OTP log hota hai (registration demo ke liye)

## Deploy on Vercel

1. Repo ko GitHub pe push karo (already hai)
2. [Vercel](https://vercel.com/new) pe "Import Project" → repo select karo
3. Environment variables `.env` se daalo:
   - `MONGODB_URI` (Atlas URL)
   - `AUTH_SECRET`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   - `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM`
4. Deploy karo, done

> Note: Vercel ke serverless filesystem pe files save nahi hoti, isliye resume/attachment upload ke liye Cloudinary ya Vercel Blob jaise service use karni padti hai.

## Environment Variables

`MONGODB_URI`, `AUTH_SECRET`, Google OAuth credentials aur SMTP details — full list `.env.example` mein hai.

## Deliverables

- Source code + live app (Vercel)
- README (yehi hai)
- Test credentials (upar)
- Env template (`.env.example`)
- Database schema — `src/lib/models/`
- License — [MIT](LICENSE)

## License

MIT
