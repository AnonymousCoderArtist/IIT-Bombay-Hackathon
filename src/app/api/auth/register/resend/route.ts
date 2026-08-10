import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";
import { forgotPasswordSchema } from "@/lib/validators";
import { createAndSendOtp } from "@/lib/otp";
import { rateLimit, getClientIp } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`resend:${ip}`, 5, 60 * 1000);

  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return NextResponse.json({ error: firstError.message }, { status: 400 });
  }

  await dbConnect();

  const user = await User.findOne({ email: parsed.data.email });

  if (!user) {
    return NextResponse.json({ error: "No account found for this email" }, { status: 404 });
  }

  await createAndSendOtp(parsed.data.email, "verify_email");

  return NextResponse.json({ message: "Verification code sent" }, { status: 200 });
}
