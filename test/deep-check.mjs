#!/usr/bin/env node
const BASE = process.env.BASE_URL || "http://localhost:3000";

let failures = 0;
const results = [];

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok) failures++;
  console.log(`  [${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` - ${detail}` : ""}`);
}

async function getJSON(url, headers = {}) {
  const res = await fetch(url, { headers, redirect: "manual" });
  let body = null;
  try {
    body = await res.json();
  } catch {}
  return { res, body };
}

async function login(email, password) {
  const csrf = await getJSON(`${BASE}/api/auth/csrf`);
  const jar = (csrf.res.headers.getSetCookie?.() ?? []).join("; ");
  const csrfToken = csrf.body?.csrfToken;
  if (!csrfToken) throw new Error("no csrf token");

  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: jar },
    body: new URLSearchParams({ csrfToken, email, password, callbackUrl: `${BASE}/dashboard`, redirect: "false" }),
    redirect: "manual",
  });
  const setCookies = res.headers.getSetCookie?.() ?? [];
  const sessionCookie = setCookies.map((c) => c.split(";")[0]).join("; ");
  if (!sessionCookie) throw new Error(`login failed: ${res.status} ${await res.text().catch(() => "")}`);
  return sessionCookie;
}

async function main() {
  console.log(`\n=== Deep functional check ${BASE} ===\n`);

  // 1. Public route smoke — no 404s
  const publicRoutes = [
    "/", "/login", "/register", "/forgot-password",
    "/api/auth/providers", "/api/events", "/api/placements", "/api/notices",
    "/api/courses", "/api/departments", "/api/clubs", "/api/study-materials",
    "/api/chat", "/api/match",
  ];
  for (const path of publicRoutes) {
    const { res } = await getJSON(`${BASE}${path}`);
    record(`GET ${path}`, res.status !== 404, `status=${res.status}`);
  }

  // 2. Auth: login all 4 roles
  const creds = {
    student: ["student@smartcampus.edu", "Student@123"],
    faculty: ["faculty@smartcampus.edu", "Faculty@123"],
    coordinator: ["coordinator@smartcampus.edu", "Coord@123"],
    admin: ["admin@smartcampus.edu", "Admin@123"],
  };
  const cookies = {};
  for (const [role, [email, pw]] of Object.entries(creds)) {
    try {
      cookies[role] = await login(email, pw);
      record(`login ${role}`, true);
    } catch (e) {
      record(`login ${role}`, false, e.message);
    }
  }

  // 3. Role-aware protected routes
  const studentRoutes = [
    "/api/attendance/me", "/api/attendance/me/export",
    "/api/assignments", "/api/search?q=assignment", "/api/analytics",
    "/api/notifications", "/api/placements",
  ];
  for (const path of studentRoutes) {
    const { res } = await getJSON(`${BASE}${path}`, { Cookie: cookies.student });
    record(`student ${path}`, res.status === 200, `status=${res.status}`);
  }

  const facultyRoutes = [
    "/api/attendance/sessions", "/api/attendance/me", "/api/analytics", "/api/users/students",
  ];
  for (const path of facultyRoutes) {
    const { res } = await getJSON(`${BASE}${path}`, { Cookie: cookies.faculty });
    record(`faculty ${path}`, res.status === 200, `status=${res.status}`);
  }

  const adminRoutes = ["/api/admin/users", "/api/admin/logs", "/api/analytics", "/api/users/students"];
  for (const path of adminRoutes) {
    const { res } = await getJSON(`${BASE}${path}`, { Cookie: cookies.admin });
    record(`admin ${path}`, res.status === 200, `status=${res.status}`);
  }

  // 4. RBAC: student must NOT access admin
  const { res: rbacRes } = await getJSON(`${BASE}/api/admin/users`, { Cookie: cookies.student });
  record("RBAC student blocked from /admin/users", rbacRes.status === 403, `status=${rbacRes.status}`);

  // 5. SSE stream exists (abort after connect — it's a live stream)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);
  let sseStatus = 0;
  try {
    const r = await fetch(`${BASE}/api/notifications/stream`, { headers: { Cookie: cookies.student }, signal: controller.signal });
    sseStatus = r.status;
  } catch (e) {
    if (e.name !== "AbortError") sseStatus = -1;
  }
  clearTimeout(timer);
  record("notifications SSE stream", sseStatus === 200, `status=${sseStatus}`);

  // 6. Push subscribe route exists
  const { res: pushRes } = await getJSON(`${BASE}/api/push/subscribe`, { Cookie: cookies.student });
  record("push subscribe endpoint", pushRes.status === 400 || pushRes.status === 200, `status=${pushRes.status}`);

  // 7. Health + AI service reference
  const { body: health } = await getJSON(`${BASE}/api/health`);
  record("health db connected", health?.database === "connected");

  console.log(`\n${results.length} checks, ${failures} failed`);
  if (failures > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exitCode = 1;
});
