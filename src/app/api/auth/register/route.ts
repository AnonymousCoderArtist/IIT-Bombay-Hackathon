import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";
import { registerSchema } from "@/lib/validators";
import { rateLimit, getClientIp } from "@/lib/api-helpers";
import { createAndSendOtp } from "@/lib/otp";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`register:${ip}`, 5, 60 * 1000);

  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return NextResponse.json({ error: firstError.message }, { status: 400 });
  }

  await dbConnect();

  const existing = await User.findOne({ email: parsed.data.email });

  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    role: parsed.data.role,
    emailVerified: false,
    status: "pending",
  });

  await createAndSendOtp(parsed.data.email, "verify_email");

  return NextResponse.json(
    {
      message: "Account created. Check your email for the verification code.",
      user: { id: user._id, email: user.email, name: user.name },
    },
    { status: 201 }
  );
}
