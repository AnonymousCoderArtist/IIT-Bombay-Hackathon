# Feature Tests — WhatsApp Groups, AI Match, PWA & Fixes

> Naye features aur fixes ki test checklist. Manual + API dono tareeke se test karo.
> Credentials: `admin@smartcampus.edu / Admin@123`, `student@smartcampus.edu / Student@123`

---

## 1. WhatsApp Group Links (Live chat replacement)

**Setup:** Admin/Coordinator/Faculty kisi bhi club ya course me WhatsApp invite link daal sakte hain. Students click karke join karte hain.

### Clubs (Admin/Faculty/Coordinator)
- [ ] `/clubs` pe login karo → kisi club card pe **"Add group link"** button dikhta hai
- [ ] Dialog kholo → `https://chat.whatsapp.com/Test123` daalo → **Save link** → toast "WhatsApp group link saved" + button ab **"Edit group link"** dikhta hai
- [ ] Galat link (`not-a-url`) daalo → error toast, save nahi hota
- [ ] Link khali karke save karo → link remove ho jaata hai (button wapas "Add group link")
- [ ] **Student** se login → usi club pe green **"Join WhatsApp Group"** button dikhta hai → click pe naye tab me WhatsApp link khulta hai
- [ ] Student pe "Add group link" button NAHI dikhta (role check)

### Courses (Admin)
- [ ] `/admin/academics` pe har course row me WhatsApp icon button hai
- [ ] Icon click → dialog → link daalo → save → toast + course row pe link saved
- [ ] Student dashboard pe **"Campus WhatsApp groups"** card me club/course (jinpe link hai) Join buttons ke saath dikhte hain
- [ ] Koi link nahi hai toh card me "Koi WhatsApp group link abhi add nahi hua" message

### API (curl / Postman)
```bash
# Admin login ke baad (cookie ke saath):
curl -X PATCH http://localhost:3000/api/clubs/<CLUB_ID> \
  -H "Content-Type: application/json" \
  -d '{"whatsappGroupLink":"https://chat.whatsapp.com/Test123"}'
# → 200, club.whatsappGroupLink set

curl -X PATCH http://localhost:3000/api/courses/<COURSE_ID> \
  -d '{"whatsappGroupLink":"https://chat.whatsapp.com/Test123"}'
# → 200 (admin/faculty), 403 (student)

# Invalid link:
curl -X PATCH http://localhost:3000/api/clubs/<CLUB_ID> -d '{"whatsappGroupLink":"nope"}'
# → 400
```

---

## 2. Attendance CSV Export

- [ ] Student → `/attendance` → **"Export CSV"** button (QR check-in ke paas)
- [ ] Click → `attendance_<timestamp>.csv` download hota hai
- [ ] File kholo → header `"Date","Subject","Status","Marked At"` + records (subject populated)
- [ ] Empty attendance wale student pe bhi download hota hai (sirf header)

**API:**
```bash
curl -b <session-cookie> http://localhost:3000/api/attendance/me/export
# → Content-Type: text/csv, attachment filename ke saath
```

---

## 3. Student Attendance Summary (fixed route)

- [ ] Student → `/attendance` → subject-wise %, history, monthly report sab load hota hai (pehle 500 aata tha)
- [ ] Month picker change karo → us month ka summary + day-wise breakdown
- [ ] Month boundary check: 1st of month wale sessions usi month me dikhte hain (UTC bug fix)

**API:**
```bash
curl -b <cookie> "http://localhost:3000/api/attendance/me?month=2026-08"
# → { summary, subjectWise, history, monthly } — monthly null jab month param na ho
```

---

## 4. AI Placement Match %

- [ ] Coordinator/Admin → `/placements` → **Post placement** → **"Required skills"** field me `React, Node.js, MongoDB` daalo → save
- [ ] Student → profile me skills set karo (Profile → Skills) → `/placements` khole
- [ ] Har placement card pe **"X% match"** badge (green ≥60 / amber ≥30 / red <30)
- [ ] Student skills nahi hain toh "Profile me skills add karo" hint
- [ ] **"Check AI match"** button → loading → panel me strengths chips (green), gaps, aur advice
- [ ] Python service chale toh real AI response, nahi toh local overlap fallback (dono kaam karte hain)

**API (Python service, optional):**
```bash
curl -X POST http://localhost:8000/match -H "Content-Type: application/json" \
  -d '{"job_role":"SDE","job_skills":["react","node"],"profile_skills":["react"]}'
# → { match_percent: 50, strengths: ["react"], gaps: ["node"], advice: "..." }
```

---

## 5. Calendar Widget (real data)

- [ ] Student dashboard → **"Upcoming events"** widget real events dikhata hai (mock nahi)
- [ ] Naye events create karo (coordinator) → refresh pe widget me dikhta hai
- [ ] Koi upcoming event nahi → empty state "Koi upcoming event nahi hai"
- [ ] Load hone ke waqt skeleton dikhta hai

---

## 6. QR Check-in Dialog (refactored timer)

- [ ] Faculty → `/attendance` → session kholo → **QR check-in**
- [ ] Dialog khulte hi QR + manual code generate hota hai
- [ ] "Valid for 9:59" countdown har second update hota hai
- [ ] 10 min baad "Expired — QR refresh karo" + **Refresh QR** kaam karta hai
- [ ] Student `/attendance/scan` se QR scan karke attendance mark hoti hai

---

## 7. PWA + Offline Mode

- [ ] DevTools → Application → Service Workers → `sw.js` registered hai
- [ ] Manifest: `/manifest.json` → icon SVG valid hai (DevTools Application → Manifest)
- [ ] **Offline test:** Network tab me "Offline" karo → page reload → app shell khulta hai (offline fallback)
- [ ] Online wapas → naye changes milte hain (network-first navigation, stale nahi)
- [ ] Chrome install prompt (agar eligible) — installable PWA

---

## 8. AI Plagiarism Detection

- [ ] Faculty → assignment open karo → **Submissions** page → **"Plagiarism check"** button
- [ ] Kam se kam 2 submissions hain toh button enabled hai (1 ya 0 pe disabled)
- [ ] Click → loading → "Similarity report" panel dikhta hai
- [ ] Pairwise list: `Student A ↔ Student B` with similarity % (≥70 red, ≥40 amber)
- [ ] Same GitHub link wali submissions → high similarity (100%)
- [ ] Same notes text wali submissions → high similarity
- [ ] Sab unique → "Koi significant similarity nahi mili"
- [ ] Student role → 403 (API se check karo)

**API:**
```bash
curl -X POST http://localhost:3000/api/plagiarism -b <faculty-cookie> \
  -H "Content-Type: application/json" -d '{"assignmentId":"<ID>"}'
# → { pairs: [{ a, b, similarity, studentA, studentB }], note }
# Python service: curl -X POST http://localhost:8000/plagiarism -d '{"texts":[...]}'
```

## 9. Calendar Sync (.ics)

- [ ] Events page → **"Calendar (.ics)"** button
- [ ] Click → `campus-events.ics` download hota hai
- [ ] File kholo → upcoming events with date, time, venue
- [ ] Google Calendar / Outlook me import karke test karo

**API:**
```bash
curl -b <cookie> http://localhost:3000/api/events/export
# → text/calendar, attachment
```

## 10. i18n — EN/HI (Landing page)

- [ ] Landing page navbar me language toggle (हिंदी/EN)
- [ ] Click → hero, features, stats, footer, FAQ heading Hindi me
- [ ] Wapas click → English me
- [ ] Refresh karne pe language persisted (localStorage `lang`)
- [ ] Doosre tab me toggle → live sync (storage event)

## 12. Face Recognition Attendance (UniFace)

> Setup: Python service me `uniface` installed hona chahiye. Models first use par auto-download hote hain (~1-2 min).
> Service chalana: `cd services/ai && .venv/bin/uvicorn app.main:app --port 8000`

### Install (venv me)

```bash
cd services/ai
# Python 3.14 venv pehle se hai (.venv) — usme install karo:
.venv/bin/pip install "uniface[cpu]" opencv-python-headless
# Verify:
.venv/bin/python -c "import uniface; from uniface import FaceAnalyzer; print('uniface OK')"
# (Optional) check health me face.available:
curl http://localhost:8000/health   # → "face": {"available": true, ...}
```

> Note: `uniface` ya models missing ho toh bhi app kaam karta hai — face check-in 503 deta hai
> aur QR/manual code check-in normal chalta rehta hai (face optional hai).

### Python service
- [ ] `curl http://localhost:8000/health` → `"face": {"available": true, ...}` (uniface installed)
- [ ] `curl -X POST http://localhost:8000/face/enroll -H "Content-Type: application/json" -d '{"user_id":"test1","image":"<base64-photo>"}'` → 200 `{enrolled: true, dim: 512}`
- [ ] Same photo se `recognize` → 200 `{matched: true, user_id: "test1", confidence: >0.5}`
- [ ] Kisi aur photo se → `matched: false` (ya low confidence)
- [ ] Garib/blank image → 422 with "chehra detect nahi hua"

### Enroll (student)
- [ ] Student login → `/profile` → **"Enroll face"** card dikhta hai
- [ ] Click → camera khulta hai → photo capture karo → "Face enrolled" success card + toast
- [ ] Enroll hone ke baad button ki jagah green "Face enrolled" status dikhta hai
- [ ] Camera deny karo → error message + koi crash nahi

### Face check-in (attendance)
- [ ] Faculty → session → QR check-in dialog → student ko code do
- [ ] Student → `/attendance/scan` → **"Face check-in"** card
- [ ] Code paste karo (bin code submit kiye) → "Pehle check-in code paste karo" error
- [ ] Code paste karke **"Face se check-in karo"** → camera → capture → "Attendance marked!"
- [ ] Doosra student apna face (enrolled nahi ya match na ho) use kare → 401 "Face match nahi hua"
- [ ] Faculty notification "... ne QR se attendance check-in kiya" (face wale bhi)
- [ ] Face service down (uvicorn band) → QR/manual code se check-in still kaam karta hai (face optional hai)

**API:**
```bash
curl -X POST http://localhost:3000/api/face/enroll -b <cookie> -H "Content-Type: application/json" -d '{"image":"<base64>"}'
# → 200 {enrolled:true} | 401 (bina login) | 503 (AI_SERVICE_URL missing)

curl -X POST http://localhost:3000/api/attendance/qr-checkin -b <cookie> \
  -H "Content-Type: application/json" -d '{"token":"<code>","faceImage":"<base64>"}'
# → 200 attendance marked | 401 face match nahi | 400 token invalid
```

## 13. Email Reminders

### Assignments
- [ ] Faculty → create assignment (department set karo, e.g. Computer Science)
- [ ] SMTP configured nahi hai toh console me `[mail:<email>] New assignment: ...` preview log aata hai (mailer preview mode)
- [ ] SMTP configured hai (SMTP_HOST/USER/PASS in `.env`) toh real email jaata hai with title + deadline + link
- [ ] Department filter: us department ke students ko hi email + notification jaata hai
- [ ] Bina department ke → saare students ko jaata hai

### Events
- [ ] Student event register kare → confirmation email (ticket ID ke saath)
- [ ] Console me `[mail:<email>] Registered: <event>` preview log (SMTP set nahi toh)

### Placements
- [ ] Coordinator/Admin nayi placement post kare → saare students ko email (company, CTC, deadline, apply link)
- [ ] Student apply kare → confirmation email ("Application submitted: <company>")

**API/console:**
```bash
# Dev server logs me (SMTP set nahi toh):
# [mail:student@smartcampus.edu] New assignment: Test Assignment
# [mail:student@smartcampus.edu] Registered: Tech Fest
# [mail:student@smartcampus.edu] Application submitted: Google
```

## 14. Live Updates (SSE — real-time unread badge)

- [ ] 2 tabs me dashboard kholo (same user)
- [ ] Tab A me koi action karo jo notification banaye (e.g. assignment submit)
- [ ] Tab B ka notification bell badge ~5 sec me update ho jaata hai (bina refresh ke)
- [ ] Notifications read karne pe badge gir jaata hai
- [ ] Network tab me `/api/notifications/stream` SSE connection visible hai (event-stream)
- [ ] Page close karne pe SSE connection cleanly band hota hai (koi error nahi)

**API:**
```bash
curl -N -b <cookie> http://localhost:3000/api/notifications/stream
# → data: {"unreadCount": 3}\n\n (jab count change ho)
```

## 15. Push Notifications (Web Push)

> Setup (ek baar):
> ```bash
> npx web-push generate-vapid-keys --json
> # output me publicKey aur privateKey ko .env me daalo:
> VAPID_PUBLIC_KEY=<publicKey>
> VAPID_PRIVATE_KEY=<privateKey>
> NEXT_PUBLIC_VAPID_PUBLIC_KEY=<publicKey>  # same value
> VAPID_SUBJECT=mailto:admin@smartcampus.edu
> ```
> Service worker registered hona chahiye (PWA setup se). Browser HTTPS/localhost pe hi push
> allow karta hai.

- [ ] Settings → Notifications tab → **Push notifications** toggle dikhta hai
- [ ] VAPID keys set nahi → toggle pe "VAPID keys set nahi — admin se setup karwao" message
- [ ] VAPID set hoke toggle ON karo → browser permission prompt → Allow
- [ ] ON hone ke baad **"Test push"** button dikhta hai
- [ ] Test push click → native OS notification "Smart Campus" aati hai
- [ ] Notification click → notifications page khulta hai
- [ ] Toggle OFF → push disabled (subscription delete)
- [ ] Invalid subscription (server 410) → auto-cleanup + "dobara subscribe karo" message

**API:**
```bash
# Subscription status + public key:
curl -b <cookie> http://localhost:3000/api/push/subscribe
# → { configured: true, vapidPublicKey: "..." }

# Test push:
curl -X POST -b <cookie> http://localhost:3000/api/push/test
# → 200 { message: "Push notification bhej di gayi" } | 503 (VAPID missing) | 400 (subscribe nahi kiya)
```

---

## 11. Regression — core flows

- [ ] Landing → register/verify → login (all 4 roles)
- [ ] Student: dashboard, attendance %, assignment submit, event register + QR pass, placement apply, club join/leave, notices
- [ ] Faculty: attendance session + mark, assignment create + grade, notice post, study material upload
- [ ] Coordinator: event create, placement post, club create
- [ ] Admin: users manage, academics (department/course), activity logs, analytics charts
- [ ] Global search (Ctrl+K), notifications unread badge, dark/light mode, mobile responsive
- [ ] `npm run check` clean (0 errors), `npm run test` → "Sab theek hai. App ready hai!"

---

## Automation notes

- `npm run check` — eslint + typecheck (har change ke baad)
- `npm run test` — API sanity (dev server ON hone par)
- `/tmp/func-test.mjs` — authenticated API test script (WhatsApp PATCH, CSV, attendance summary, events) — login via seeded credentials
