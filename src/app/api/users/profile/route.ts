import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";
import { profileSchema } from "@/lib/validators";
import { jsonError } from "@/lib/api-helpers";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

  const user = await User.findById(session.user.id).select(
    "name email role image phone rollNumber department semester skills linkedin github resumeUrl bio emailVerified createdAt"
  );

  if (!user) {
    return jsonError("User not found", 404);
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
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

  const parsed = profileSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  await dbConnect();

  const user = await User.findById(session.user.id);

  if (!user) {
    return jsonError("User not found", 404);
  }

  const updates = parsed.data;

  if (updates.name !== undefined) user.name = updates.name;
  if (updates.phone !== undefined) user.phone = updates.phone || undefined;
  if (updates.rollNumber !== undefined) user.rollNumber = updates.rollNumber || undefined;
  if (updates.department !== undefined) user.department = updates.department || undefined;
  if (updates.semester !== undefined) user.semester = updates.semester;
  if (updates.skills !== undefined) user.skills = updates.skills;
  if (updates.linkedin !== undefined) user.linkedin = updates.linkedin || undefined;
  if (updates.github !== undefined) user.github = updates.github || undefined;
  if (updates.bio !== undefined) user.bio = updates.bio || undefined;
  if (updates.resumeUrl !== undefined) user.resumeUrl = updates.resumeUrl || undefined;
  if (updates.image !== undefined) user.image = updates.image || undefined;

  await user.save();

  return NextResponse.json({ user });
}
