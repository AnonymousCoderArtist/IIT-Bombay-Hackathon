import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";
import { resetPasswordSchema } from "@/lib/validators";
import { verifyOtp } from "@/lib/otp";
import { rateLimit, getClientIp } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`reset:${ip}`, 5, 60 * 1000);

  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return NextResponse.json({ error: firstError.message }, { status: 400 });
  }

  await dbConnect();

  const user = await User.findOne({ email: parsed.data.email });

  if (!user) {
    return NextResponse.json({ error: "No account found for this email" }, { status: 404 });
  }

  const valid = await verifyOtp(parsed.data.email, parsed.data.code, "reset_password");

  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  user.passwordHash = passwordHash;
  await user.save();

  return NextResponse.json({ message: "Password updated. You can now sign in." }, { status: 200 });
}
