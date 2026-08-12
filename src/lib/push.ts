import crypto from "crypto";

export type PushSubscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function getVapidKeys() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey };
}

function createVapidToken(endpoint: string, privateKey: string): string {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: new URL(endpoint).origin,
    exp: now + 12 * 60 * 60,
    sub: process.env.VAPID_SUBJECT ?? "mailto:admin@smartcampus.edu",
  };

  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const signature = crypto.sign("sha256", Buffer.from(unsigned), {
    key: privateKey,
    dsaEncoding: "ieee-p1363",
  });

  return `${unsigned}.${b64url(signature)}`;
}

export async function sendPush(subscription: PushSubscription): Promise<{ ok: boolean; status?: number }> {
  const vapid = getVapidKeys();
  if (!vapid) return { ok: false };

  const token = createVapidToken(subscription.endpoint, vapid.privateKey);
  const authHeader = `vapid t=${token}, k=${vapid.publicKey}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        TTL: "86400",
        "Content-Length": "0",
      },
      body: "",
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (res.status === 410 || res.status === 404) {
      return { ok: false, status: res.status };
    }

    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false };
  }
}

export function vapidConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}
