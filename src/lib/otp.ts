import crypto from "crypto";
import { Otp } from "./models";

export function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function createAndSendOtp(email: string, purpose: "verify_email" | "reset_password") {
  const { sendMail } = await import("./mailer");
  const code = generateOtp();

  await Otp.create({
    email,
    code,
    purpose,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  const subject =
    purpose === "verify_email"
      ? "Verify your Smart Campus email"
      : "Reset your Smart Campus password";

  const text = `Your verification code is ${code}. It expires in 10 minutes.`;

  await sendMail({
    to: email,
    subject,
    text,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="margin:0 0 8px">Smart Campus</h2>
        <p>${subject}</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">${code}</p>
        <p style="color:#6b7280;font-size:14px">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });

  return code;
}

export async function verifyOtp(email: string, code: string, purpose: "verify_email" | "reset_password") {
  const otp = await Otp.findOne({ email, purpose, used: false, expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 });

  if (!otp) {
    return false;
  }

  if (otp.attempts >= 5) {
    otp.used = true;
    await otp.save();
    return false;
  }

  if (otp.code !== code) {
    otp.attempts += 1;
    await otp.save();
    return false;
  }

  otp.used = true;
  await otp.save();
  return true;
}
