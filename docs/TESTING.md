# Smart Campus — Full Manual Testing Guide

> Har feature ka step-by-step test. **Steps** follow karo → **Expected** result milna chahiye.
> Test credentials saare niche hain. Bug milne pe: page + kya kiya + kya aaya — note karke batao.

## Test credentials

| Role | Email | Password |
| ---- | ----- | -------- |
| Admin | `admin@smartcampus.edu` | `Admin@123` |
| Coordinator | `coordinator@smartcampus.edu` | `Coord@123` |
| Faculty | `faculty@smartcampus.edu` | `Faculty@123` |
| Student | `student@smartcampus.edu` | `Student@123` |

---

## Setup (pehli baar)

1. MongoDB start karo — `npm run mongo:start` (data `~/data/mongodb` mein, background mein)
2. `npm run seed` — sample data daalo
3. `npm run dev` — server on
4. Browser mein `http://localhost:3000` kholo

---

## TEST 1 — Landing page (bina login)

| # | Step | Expected |
|---|---|---|
| 1.1 | `localhost:3000` kholo | Hero section dikhe — heading + "Get started free" button |
| 2 | Scroll karo | Features (6 cards), Stats (4), Testimonials (3), FAQ (5), Footer |
| 3 | Top-right theme icon click karo | Dark/light mode toggle ho |
| 4 | FAQ mein kisi question pe click karo | Answer expand ho |
| 5 | Browser resize karo / F12 → phone icon (360px) | Sab responsive dikhe, koi overflow na ho |
| 6 | `Ctrl+K` press karo | Command palette khule (search box) |
| 7 | Navbar mein "Sign in" click karo | `/login` pe le jaye |

---

## TEST 2 — Registration + Email Verification (full auth flow)

| # | Step | Expected |
|---|---|---|
| 2.1 | `/register` kholo | Name, email, password, role dropdown |
| 2.2 | Role: Student, email koi naya (e.g. `new@test.com`), password `Test@123` → Submit | "Check your email" message |
| 2.3 | **Terminal mein dekho** — `[mail:...]` wali line mein OTP dikhta hai (SMTP set nahi hai) | 6-digit code mila |
| 2.4 | `/verify-email` pe email + OTP daalo → Verify | "Email verified. You can now sign in." |
| 2.5 | Abhi login karo | Login ho jata hai (pehle nahi hota tha) |
| 2.6 | `/forgot-password` pe email daalo | OTP aata hai (terminal mein) |
| 2.7 | `/reset-password` pe OTP + naya password daalo | Password change ho jata hai |
| 2.8 | Naye password se login karo | Success |

---

## TEST 3 — Protected routes & logout

| # | Step | Expected |
|---|---|---|
| 3.1 | Logout karo | `/login` pe redirect |
| 3.2 | `localhost:3000/dashboard` direct kholo | Login pe redirect hota hai (unauthorized access blocked) |
| 3.3 | `curl http://localhost:3000/api/events` | `{"error":"Unauthorized"}` — 401 |

---

## TEST 4 — STUDENT portal (`student@smartcampus.edu` / `Student@123`)

### 4.1 Dashboard
| # | Step | Expected |
|---|---|---|
| 1 | Login karke dashboard kholo | Stat cards: Attendance %, Assignments, Events, Placements |
| 2 | Neeche scroll karo | Upcoming assignments/events + recent activity dikhe |
| 3 | Search bar mein "AI" type karo | Events/placements/assignments matches dikhein, click pe page khule |

### 4.2 Profile
| # | Step | Expected |
|---|---|---|
| 1 | Profile page kholo | Name, email, phone, roll, department, semester, skills fields |
| 2 | Phone `+91 9876543210`, skills `Python, React`, GitHub, LinkedIn bharo → Save | Toast "Profile updated" |
| 3 | Page refresh karo | Saare values save rehne chahiye |
| 4 | Resume upload (PDF) karo | File upload ho, link save ho |
| 5 | Profile picture (avatar) upload karo | Image update ho |

### 4.3 Attendance
| # | Step | Expected |
|---|---|---|
| 1 | Attendance page | Subject-wise % dikhta hai (e.g. CS 92%) |
| 2 | Kisi subject pe click karo | Session history — har date pe present/absent |

### 4.4 Assignments (student view)
| # | Step | Expected |
|---|---|---|
| 1 | Assignments page | Published assignments list with deadline |
| 2 | Kisi assignment pe click karo | Description + rubric + submit form |
| 3 | GitHub link daalo → Submit | Toast success, notification banti hai |
| 4 | Phir se submit karne try karo | Already submitted message (ya overwrite — jo ho, note karo) |

### 4.5 Events
| # | Step | Expected |
|---|---|---|
| 1 | Events page | Upcoming events cards |
| 2 | Kisi event pe **Register** click karo | Success + **QR pass** screen aata hai (image) |
| 3 | QR pass download karo | Image download hoti hai |
| 4 | Register karne pe Event pe status check karo | "Registered" dikhta hai |
| 5 | **Cancel registration** karo | Confirmation, status wapas "Not registered" |

### 4.6 Placements
| # | Step | Expected |
|---|---|---|
| 1 | Placements page | Company listings — role, CTC, eligibility, deadline |
| 2 | Kisi pe **Apply** click karo | Application submit ho, status "Applied" |
| 3 | Apply karke phir se check karo | Already applied message |

### 4.7 Clubs
| # | Step | Expected |
|---|---|---|
| 1 | Clubs page | Clubs + member count |
| 2 | Kisi club pe Join karo | Member ban jao, count +1 |
| 3 | Leave karo | Member list se hat jao |

### 4.8 Notices
| # | Step | Expected |
|---|---|---|
| 1 | Notices page | Notices list (faculty/admin ne daali hain) |
| 2 | Kisi notice pe click karo | Full content |

### 4.9 Notifications
| # | Step | Expected |
|---|---|---|
| 1 | Top-right bell icon | Unread count badge |
| 2 | Notifications page | List — assignment/placement/grade notifications |
| 3 | Kisi pe click karo | Mark as read ho |
| 4 | "Mark all read" (agar hai) | Sab read ho jaye, badge 0 |

### 4.10 Settings (student)
| # | Step | Expected |
|---|---|---|
| 1 | Settings → Theme pe Dark click karo | App dark ho jaye |
| 2 | Notification toggle off karo | Toggle save ho |
| 3 | **Refresh karo** | Theme + toggles wahi rehne chahiye (persist) |
| 4 | Change password | Naye password se login ho |

### 4.11 Can't-access checks (RBAC)
| # | Step | Expected |
|---|---|---|
| 1 | `localhost:3000/admin/users` kholo | Access denied / redirect (students admin nahi dekh sakte) |
| 2 | API: `curl -b <session> http://localhost:3000/api/admin/users` | 403 |

---

## TEST 5 — FACULTY portal (`faculty@smartcampus.edu` / `Faculty@123`)

### 5.1 Dashboard
| # | Step | Expected |
|---|---|---|
| 1 | Login karo | Classes, student count, attendance, recent submissions |

### 5.2 Attendance
| # | Step | Expected |
|---|---|---|
| 1 | Attendance page | Previous sessions + "Create session" |
| 2 | Naya session banao — subject select, date, students check karo → Create | Session ban jata hai |
| 3 | Present/absent mark karo → Save | Records update ho |
| 4 | Ab student login karke check karo | Student ko session + percentage dikhe |

### 5.3 Assignments
| # | Step | Expected |
|---|---|---|
| 1 | Assignments page | List + "New assignment" |
| 2 | Naya banao — title, description, deadline, rubric → Create | Assignment published |
| 3 | Assignment pe click → Submissions tab | Student submissions dikhein |
| 4 | Kisi pe score + feedback do → Save | Grade save ho |
| 5 | Student login karke check karo | Grade + feedback visible, notification aayi |

### 5.4 Notices
| # | Step | Expected |
|---|---|---|
| 1 | Notices page → "New notice" | Form |
| 2 | Title + content daalo → Publish | Notice list mein dikhe |
| 3 | Student login karke check karo | Student ko notice dikhe |

### 5.5 Faculty can't-checks
| # | Step | Expected |
|---|---|---|
| 1 | `/admin/users` | Blocked |
| 2 | Event create karne try karo | Permission denied |

---

## TEST 6 — COORDINATOR portal (`coordinator@smartcampus.edu` / `Coord@123`)

### 6.1 Events
| # | Step | Expected |
|---|---|---|
| 1 | Events page → "New event" | Form — title, description, venue, date, capacity, deadline |
| 2 | Sab bharo → Create | Event create ho |
| 3 | Student login karke check | Naya event list mein |

### 6.2 Placements
| # | Step | Expected |
|---|---|---|
| 1 | Placements → "New opening" | Form — company, role, CTC, eligibility, deadline |
| 2 | Create karo | Listing dikhe |
| 3 | Student se apply karwao | Application coordinator ko dikhe |

### 6.3 Clubs
| # | Step | Expected |
|---|---|---|
| 1 | Clubs → "New club" | Form |
| 2 | Create karo | Club ban jaye |

---

## TEST 7 — ADMIN portal (`admin@smartcampus.edu` / `Admin@123`)

### 7.1 Dashboard
| # | Step | Expected |
|---|---|---|
| 1 | Login karo | Total students, faculty, departments, events, attendance %, charts, logs link |

### 7.2 Users
| # | Step | Expected |
|---|---|---|
| 1 | Users page | All users — role, status filters |
| 2 | Kisi ka role change karo → Save | Update ho |
| 3 | Kisi ko Block karo | Woh login na kar paye |
| 4 | Kisi ko Delete karo | User hat jaye |
| 5 | Activity Logs page kholo | User update/delete actions logged |

### 7.3 Analytics/Reports
| # | Step | Expected |
|---|---|---|
| 1 | Dashboard charts dekho | Attendance, submissions, placement charts render hon |

---

## TEST 8 — Security checks

| # | Test | Expected |
|---|---|---|
| 8.1 | Galat password se login | Error message, login fail |
| 8.2 | Login 10+ baar galat password (same email) | Rate limit — temporary block |
| 8.3 | Register endpoint 6 baar same IP se hit karo (`curl`) | 6th request pe `429` |
| 8.4 | Upload `.exe` file | Reject — file type not allowed |
| 8.5 | Upload 10MB+ file | Reject — size limit |
| 8.6 | API pe invalid JSON bhejo | `400` valid error |

---

## TEST 9 — UI/UX checks (saare pages pe)

| # | Check | Expected |
|---|---|---|
| 9.1 | F12 → phone view (375px) | Hamburger menu → sidebar drawer khule |
| 9.2 | Har page pe refresh karo | Data load ho (skeleton dikh sakta hai) |
| 9.3 | Keyboard se tab-press karke navigate karo | Buttons/links focusable ho |
| 9.4 | Dark mode mein har page kholo | Text readable, no contrast issue |
| 9.5 | Har action pe toast | Success/error notification aaye |

---

## Agar bug mile toh

Is format mein batao:

```
Feature: <kon sa feature>
Action: <kya kiya>
Expected: <kya hona chahiye tha>
Got: <kya aaya>
Screenshot/console: <agar hai>
```
