import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";
import { changePasswordSchema } from "@/lib/validators";
import { jsonError, logActivity } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = changePasswordSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  await dbConnect();

  const user = await User.findById(session.user.id);

  if (!user) {
    return jsonError("User not found", 404);
  }

  if (!user.passwordHash) {
    return jsonError("This account uses Google login and has no password.", 400);
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);

  if (!valid) {
    return jsonError("Current password is incorrect", 400);
  }

  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await user.save();

  await logActivity("change_password", "settings", session.user.id);

  return NextResponse.json({ message: "Password updated successfully" });
}
