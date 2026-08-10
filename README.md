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

## Testing

```bash
# Static checks (lint + typecheck)
npm run check

# Server chal raha ho toh API sanity check
npm run test

# Test credentials se login karo:
#   - Student: attendance, assignments submit, events register, placements apply
#   - Faculty: attendance session banao, assignment create + grade karo
#   - Coordinator: events aur placements post karo
#   - Admin: users manage karo, logs dekho
```

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
