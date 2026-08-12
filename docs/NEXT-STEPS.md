# Next Steps (current plan)

## Status
- [x] Saare PS-mandatory features implement + verified
- [x] Saare bonus features bhi implement + tested (AI RAG, plagiarism, face recognition, push, SSE, i18n, PWA, WhatsApp groups, CSV/.ics export)
- [x] Sab commits `origin/main` pe push ho chuke hain ✅
- [x] `npm run check` clean, `npm run build` pass, `npm run test` → "App ready hai!", func-test 13/13
- [x] PWA manifest + sw.js middleware redirect fix (ab installable hai)
- [x] Connected accounts (Google) tracking + Settings UI, accessibility aria-labels

## 1. Credentials (user ke paas hone chahiye — code ready hai)
- [ ] Google OAuth: `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
  - [ ] [console.cloud.google.com](https://console.cloud.google.com) → OAuth consent screen (External) → Credentials → OAuth Client ID (Web)
  - [ ] Redirect URI: `http://localhost:3000/api/auth/callback/google`
  - [ ] Deploy pe production redirect bhi add karo
- [ ] SMTP: `SMTP_USER` + `SMTP_PASS` (Gmail App Password — 2-Step Verification ON karke)
  - [ ] Pehle Gmail app-password se test karo, phir Vercel env me daalo
  - [ ] Abhi bina creds ke emails preview mode me console pe `[mail:...]` log hoti hain

## 2. Deploy (aakhri deliverables)
- [ ] Vercel deploy (ya koi bhi host):
  - [ ] GitHub repo connect karo (`AnonymousCoderArtist/IIT-Bombay-Hackathon`)
  - [ ] Env vars daalo (`.env.example` se) — MONGODB_URI, AUTH_SECRET, AUTH_TRUST_HOST
  - [ ] Deploy ke baad `/`, `/dashboard`, aur kisi ek module ka smoke test
- [ ] Demo recording: login flow + 2-3 modules ka quick walkthrough

## 3. Final checklist (demo se pehle)
- [ ] `npm run seed` fresh DB pe — sab modules ka data aaya?
- [ ] `npm run build && npm run start` — production mode me sab roles test karo
- [ ] Student `student@smartcampus.edu` / `Student@123` — dashboard, calendar, attendance, materials, placements
- [ ] Faculty `faculty@smartcampus.edu` / `Faculty@123` — attendance mark, assignment, materials upload
- [ ] Admin `admin@smartcampus.edu` / `Admin@123` — users, academics, system alerts
- [ ] Coordinator `coordinator@smartcampus.edu` / `Coord@123` — placements, clubs
- [ ] Google login (creds aa jaye toh) + email OTP verify flow
- [ ] Mobile pe responsive check
- [ ] PROGRESS.md final verify + README update (Google/SMTP setup steps)

## Yaad rakhne wali baatein
- Commit messages sirf Hinglish me (AGENTS.md)
- Har commit pehle `npm run build` chala ke verify karo
- PROGRESS.md + PS (`/tmp/opencode/ps.txt`) ko source of truth maano
- Test dependencies (puppeteer/playwright) kabhi `package.json` me commit mat karo — browser testing ke liye nikal ke alag use karo
