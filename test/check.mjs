#!/usr/bin/env node
/*
 * Quick sanity check for the app.
 * Usage: npm run test
 * Checks that the dev server is up, DB is connected and key routes exist.
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";

let failures = 0;

function ok(label) {
  console.log(`  [PASS] ${label}`);
}

function fail(label, detail) {
  failures++;
  console.log(`  [FAIL] ${label}${detail ? ` - ${detail}` : ""}`);
}

async function check(label, fn) {
  try {
    const result = await fn();
    if (result) {
      ok(label);
    } else {
      fail(label);
    }
  } catch (error) {
    fail(label, error.message);
  }
}

async function main() {
  console.log(`\nChecking ${BASE}\n`);

  await check("Server is reachable", async () => {
    const res = await fetch(`${BASE}/api/health`);
    return res.ok;
  });

  await check("Database is connected", async () => {
    const res = await fetch(`${BASE}/api/health`);
    const json = await res.json();
    return json.database === "connected";
  });

  await check("Auth providers endpoint works", async () => {
    const res = await fetch(`${BASE}/api/auth/providers`);
    return res.ok;
  });

  const routes = [
    ["events", "/api/events"],
    ["placements", "/api/placements"],
    ["notifications", "/api/notifications"],
    ["attendance", "/api/attendance/sessions"],
    ["assignments", "/api/assignments"],
    ["analytics", "/api/analytics"],
  ];

  for (const [name, path] of routes) {
    await check(`${name} API responds`, async () => {
      const res = await fetch(`${BASE}${path}`);
      return res.status === 401 || res.ok;
    });
  }

  console.log("");
  if (failures === 0) {
    console.log("Sab theek hai. App ready hai!");
  } else {
    console.log(`${failures} check(s) failed.`);
    process.exitCode = 1;
  }
}

main();
