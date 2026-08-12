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

## 8. Regression — core flows

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
