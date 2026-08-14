# Credentials Guide — Konse Credentials Kahan Update Karein

Har credential kis jagah set hota hai aur kaunsa env var use hota hai — ek hi jagah se sab clear.

## 1. MongoDB Atlas (Database)

**Kahan:** [cloud.mongodb.com](https://cloud.mongodb.com) → Security → Database Access

| Kya | Kahan | Note |
| --- | ----- | ---- |
| DB username | Database Access → edit | is project ka user: `lokeshlalmajhi_db_user` |
| DB password | Database Access → edit → Password | change karo toh `.env` + Vercel env dono me `MONGODB_URI` update karna |
| Network Access | Network Access → Add IP | live pe login ke liye `0.0.0.0/0` (Allow access from anywhere) |

**MONGODB_URI format:**
```
mongodb+srv://<db_username>:<db_password>@<cluster>.mongodb.net/?appName=<cluster>
```

## 2. Google Cloud Console (OAuth)

**Kahan:** [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth Client

| Kya | Kahan | Note |
| --- | ----- | ---- |
| Client ID | OAuth client → **Client ID** | `.env` + Vercel env me `GOOGLE_CLIENT_ID` |
| Client Secret | OAuth client → **Client secret** | `.env` + Vercel env me `GOOGLE_CLIENT_SECRET` |
| Authorized redirect URIs | OAuth client → Edit | local: `http://localhost:3000/api/auth/callback/google`<br>live: `https://iit-bombay-hackathon-1r7i.vercel.app/api/auth/callback/google` |

Client ID/Secret bahut jagah le sakte ho: **Clients** tab → tumhara client → 3-dot menu → Download JSON (ya copy).

## 3. Local Development (`.env` file)

`cp .env.example .env` karke fill karo. Ye file **gitignored** hai (GitHub pe nahi jati).

| Variable | Value | Kab zaroori |
| -------- | ----- | ----------- |
| `MONGODB_URI` | Atlas SRV string (password ke saath) | hamesha |
| `AUTH_SECRET` | `openssl rand -base64 32` output | hamesha |
| `AUTH_URL` | `http://localhost:3000` | local dev |
| `GOOGLE_CLIENT_ID` | Google Console se | Google login ke liye |
| `GOOGLE_CLIENT_SECRET` | Google Console se | Google login ke liye |
| `AUTH_TRUST_HOST` | `true` | local standalone / reverse proxy |
| `SMTP_HOST/PORT/USER/PASS/FROM` | apna SMTP | email (OTP) bhejne ke liye |
| `AI_SERVICE_URL` | `http://localhost:8000` | local AI service |
| `AI_PROVIDER` / `GEMINI_API_KEY` / `DEEPSEEK_API_KEY` | free API key | real AI chatbot |

## 4. Vercel (Production)

**Kahan:** Vercel project → Settings → Environment Variables (Environment = Production)

| Variable | Value | Note |
| -------- | ----- | ---- |
| `MONGODB_URI` | `.env` wali (Atlas + password) | required |
| `AUTH_SECRET` | `openssl rand -base64 32` | required, `.env` se same rakh sakte ho |
| `AUTH_TRUST_HOST` | `true` | required |
| `GOOGLE_CLIENT_ID` | `.env` wali | Google login |
| `GOOGLE_CLIENT_SECRET` | `.env` wali | Google login |
| `AUTH_URL` | **khali** | Vercel khud set karta hai |
| `NEXT_PUBLIC_APP_URL` | `https://iit-bombay-hackathon-1r7i.vercel.app` | deploy ke baad |
| `AI_SERVICE_URL` / `GEMINI_API_KEY` / `SMTP_*` | khali ya apna | optional |

Env change ke baad **Redeploy** karna (Vercel env save karne pe khud trigger hota hai).

## 5. In-App AI Credentials (per-user)

Settings → **AI** page me user apna `API Key`, `Base URL`, `Model` daal sakta hai — ye
database me save hoti hai (kisi env ki zaroorat nahi). Mock mode me AI limited answers deta hai.

## Quick "password change" checklist

Agar Atlas DB password change karo:
1. Atlas me password reset karo
2. `.env` me `MONGODB_URI` ka password update karo
3. Vercel env me `MONGODB_URI` ka password update karo (Redeploy)
4. `npm run seed` (agar re-seed chahiye)
