# Next Steps (kal ka plan)

## Status
- [x] Saare PS-mandatory features implement + verified
- [x] Build clean, seed idempotent, working tree clean
- [ ] 10 commits `origin/main` pe abhi bhi push nahi hue (pehle push karo!)

## 1. Push + Deploy
- [ ] `git push` — pehla kaam, taaki aaj ka kaam safe rahe
- [ ] Vercel deploy (ya koi bhi host):
  - [ ] GitHub repo connect karo (`AnonymousCoderArtist/IIT-Bombay-Hackathon`)
  - [ ] Env vars daalo (`.env.example` se) — MONGODB_URI, AUTH_SECRET, AUTH_TRUST_HOST, NEXTAUTH_URL
  - [ ] Deploy ke baad `/`, `/dashboard`, aur kisi ek module ka smoke test
- [ ] Demo recording: login flow + 2-3 modules ka quick walkthrough

## 2. Credentials (blocked, user ke paas hone chahiye)
- [ ] Google OAuth: `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
  - [ ] Redirect URI: `http://localhost:3000/api/auth/callback/google`
  - [ ] Deploy pe production redirect bhi add karo
- [ ] SMTP: `SMTP_HOST/PORT/USER/PASS/FROM` — OTP email ke liye (code ready hai, creds chahiye)
  - [ ] Pehle Gmail app-password se test karo, phir Vercel env me daalo

## 3. Bonus features (optional, time mile toh)
Priority order:
- [ ] AI chatbot for campus FAQs (sabse high-value — local model prefer karo, AGENTS.md ke hisaab se)
- [ ] QR attendance scanner (faculty QR generate, students scan)
- [ ] CSV/Excel export (analytics + attendance)
- [ ] Email reminders, push notifications

## 4. Final checklist (demo se pehle)
- [ ] `npm run seed` fresh DB pe — sab modules ka data aaya?
- [ ] `npm run build && npm run start` — production mode me sab roles test karo
- [ ] Student `student@smartcampus.edu` / `student123` — dashboard, calendar, attendance, materials, placements
- [ ] Faculty `faculty@smartcampus.edu` / `faculty123` — attendance mark, assignment, materials upload
- [ ] Admin `admin@smartcampus.edu` / `admin123` — users, academics, system alerts
- [ ] Coordinator `coordinator@smartcampus.edu` / `coordinator123` — placements, clubs
- [ ] Google login (creds aa jaye toh) + email OTP verify flow
- [ ] Mobile pe responsive check
- [ ] PROGRESS.md final verify + README update (Google/SMTP setup steps)

## Yaad rakhne wali baatein
- Commit messages sirf Hinglish me (AGENTS.md)
- Har commit pehle `npm run build` chala ke verify karo
- PROGRESS.md + PS (`/tmp/opencode/ps.txt`) ko source of truth maano
