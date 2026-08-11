# Smart Campus — Progress Tracker

> Har feature yahan track hota hai. Build karte waqt `[ ]` → `[x]` karte jao.
> Priority: **Tier 1 (PS PDF) → Tier 2 (Bonus) → Tier 3 (Strategy X-Factor) → Tier 4 (Deliverables)**

---

## Tier 1 — PS PDF Requirements (FIRST PRIORITY)

### 1. Authentication & Roles
- [x] Sign up (Email + Password + Google)
- [x] Login (Email + Google)
- [x] Forgot password (OTP se)
- [x] Email verification (OTP) — bina verify login blocked
- [x] Session management (JWT, secure HttpOnly cookies)
- [x] Logout (session invalidate)
- [x] Protected routes (middleware)
- [x] 4 roles: Student / Faculty / Coordinator / Admin
- [x] Student "cannot" rules — users delete nahi kar sakta, notice nahi bana sakta, attendance manage nahi kar sakta
- [x] Faculty "cannot" rules — college data delete nahi, admin manage nahi

### 2. Landing Page
- [x] Hero, Features, Testimonials, Statistics, FAQ, Footer
- [x] Responsive navigation
- [x] Dark mode
- [x] Animations (framer-motion)
- [ ] Loading screens / skeletons (sirf kuch pages pe hai)
- [x] SEO metadata
- [x] Mobile friendly

### 3. Dashboards
- [x] Student dashboard (attendance %, assignments, events, placements)
- [ ] Student dashboard — Calendar widget (upcoming classes/deadlines/events)
- [x] Faculty dashboard (classes, attendance, assignments, student count, submissions)
- [x] Coordinator dashboard
- [x] Admin dashboard (total students/faculty/departments/events, attendance %, charts, logs)

### 4. Student Profile
- [x] Profile picture, name, email, phone, roll number, department, semester
- [x] Skills, LinkedIn, GitHub
- [x] Resume upload, bio
- [x] Change password
- [x] Delete account

### 5. Attendance Module
- [x] Faculty attendance session bana sakta hai
- [x] Faculty present/absent mark karta hai
- [x] Student % + history + subject-wise analytics dekhta hai
- [x] Monthly attendance report (month filter + summary + day-wise breakdown)

### 6. Assignment Module
- [x] Faculty upload (title, description, deadline, attachments, rubric)
- [x] Student submit (PDF / ZIP / GitHub link)
- [x] Submission history (student side)
- [x] Late submission status (Late badge)
- [x] Faculty review / marks / feedback
- [x] Study material upload (faculty + students browse/download)

### 7. Event Management
- [x] Event create (banner, description, venue, registration deadline, seats, QR)
- [x] Speakers field
- [x] Student register / cancel registration
- [x] Ticket view + QR pass download

### 8. Placement Module
- [x] Company, job role, eligibility, CTC, deadline
- [x] Apply button, application status, resume upload

### 9. Notifications
- [x] Notification page + unread badge + mark-as-read
- [x] Generate hoti hain: assignment submit, submission grade, placement apply pe
- [ ] Auto-notify: attendance mark hone pe
- [ ] Auto-notify: event reminder
- [ ] Auto-notify: nayi placement khulne pe
- [ ] System alerts

### 10. Search
- [x] Global search — students, faculty, events, assignments, placements

### 11. Analytics
- [x] Role-aware analytics + admin charts
- [ ] CSV/Excel export

### 12. Admin Panel
- [x] User management (list, role change, status, delete)
- [x] Activity logs
- [x] Events / placements management
- [ ] Departments & Courses management UI

### 13. Settings
- [x] Profile, password, theme, notification preferences, delete account
- [ ] Connected accounts (Google)
- [ ] Privacy settings

### 14. UI/UX
- [x] Responsive design, dark & light mode, toasts, forms, animations, mobile friendly
- [ ] Loading skeletons (saare data pages pe)
- [ ] Empty states (har list pe)
- [x] Error page (`error.tsx`) + 404 (`not-found.tsx`)
- [ ] Success screens (action ke baad)
- [ ] Accessibility pass (keyboard nav, contrast, semantic HTML)

### 15. Security
- [x] Password hashing (bcrypt cost 12)
- [x] Input validation (zod — server-side har protected action pe)
- [x] Rate limiting (auth endpoints + login brute-force)
- [x] CSRF protection (NextAuth)
- [x] XSS protection (React escaping)
- [x] Secure cookies
- [x] Environment variables (repo mein koi secret nahi)
- [x] File upload validation (size 10MB + type whitelist)
- [x] Authorization middleware (RBAC)
- [x] Audit logging (admin user changes, placement actions, account delete)

### 16. Database
- [x] Minimum 13 entities (actual: 17 models)
- [x] Users, Roles, Departments, Attendance, Assignments, Submissions
- [x] Events, Event Registrations, Notifications, Placements, Applications
- [x] Settings, Activity Logs (+ Otps, Clubs, Notices)

---

## Tier 2 — PS Bonus Features

- [x] Admin audit logs
- [x] API documentation
- [ ] AI chatbot (campus FAQs)
- [ ] QR attendance scanner (faculty student ka QR scan kare)
- [ ] Live chat (students ↔ faculty)
- [ ] Calendar sync
- [ ] PWA support
- [ ] Offline mode
- [ ] Multi-language support (i18n)
- [ ] Face recognition attendance
- [ ] AI assignment plagiarism detection
- [ ] Email reminders
- [ ] Push notifications
- [ ] WebSockets (live updates)
- [ ] CSV/Excel export
- [ ] Dockerized deployment
- [ ] CI/CD pipeline

---

## Tier 3 — Strategy X-Factor (Innovation)

- [x] Command palette (Ctrl+K global search)
- [ ] Campus Knowledge RAG assistant (chatbot + citations)
- [ ] AI resume parsing + placement match %
- [ ] Ambient lecture intelligence (transcribe → study notes + action items)
- [ ] Sentiment analytics (student feedback)
- [ ] Plagiarism detector (submission similarity)
- [ ] Intel OpenVINO / oneAPI / DevCloud (sirf docs strategy — hardware-level, cloud demo impossible)
- [ ] Multi-language (EN/HI toggle)

---

## Tier 4 — Deliverables

- [x] Source code (GitHub, incremental Hinglish commits)
- [x] README (setup + testing guide)
- [x] API documentation (`docs/API.md`)
- [x] ER diagram (`docs/ERD.md`)
- [x] Architecture diagram (`docs/ARCHITECTURE.md`)
- [x] Test credentials (4 roles, seeded)
- [x] Environment variable template (`.env.example`)
- [x] License (MIT)
- [ ] Live deployed application (Vercel)
- [ ] Demo video (3–5 min)

---

## Seed test credentials

| Role | Email | Password |
| ---- | ----- | -------- |
| Admin | `admin@smartcampus.edu` | `Admin@123` |
| Coordinator | `coordinator@smartcampus.edu` | `Coord@123` |
| Faculty | `faculty@smartcampus.edu` | `Faculty@123` |
| Student | `student@smartcampus.edu` | `Student@123` |

> Testing ka full guide README → "Testing Guide" section mein hai.
