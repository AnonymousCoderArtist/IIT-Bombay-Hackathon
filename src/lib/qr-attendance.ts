import crypto from "crypto";

type CheckInPayload = {
  sid: string;
  exp: number;
};

function getSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.QR_SECRET ?? "dev-checkin-secret";
  return secret;
}

function b64url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export function createCheckInToken(sessionId: string, ttlMinutes = 10): string {
  const payload: CheckInPayload = {
    sid: sessionId,
    exp: Math.floor(Date.now() / 1000) + ttlMinutes * 60,
  };
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = crypto.createHmac("sha256", getSecret()).update(body).digest();
  return `${body}.${b64url(sig)}`;
}

export function verifyCheckInToken(token: string): string | null {
  try {
    const [body, sigPart] = token.split(".");
    if (!body || !sigPart) return null;

    const expected = crypto.createHmac("sha256", getSecret()).update(body).digest();
    const provided = b64urlDecode(sigPart);
    if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
      return null;
    }

    const payload = JSON.parse(b64urlDecode(body).toString("utf8")) as CheckInPayload;
    if (!payload.sid || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload.sid;
  } catch {
    return null;
  }
}
