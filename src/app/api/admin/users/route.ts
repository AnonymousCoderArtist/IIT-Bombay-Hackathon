import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { User, Notification } from "@/lib/models";
import { adminUserUpdateSchema } from "@/lib/validators";
import { jsonError, logActivity } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "admin") {
    return jsonError("Admins only", 403);
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") || undefined;
  const q = searchParams.get("q")?.trim();

  await dbConnect();

  const filter: Record<string, unknown> = {};

  if (role) filter.role = role;

  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: regex }, { email: regex }, { rollNumber: regex }];
  }

  const users = await User.find(filter)
    .select("name email role status department semester rollNumber image createdAt")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "admin") {
    return jsonError("Admins only", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const { id, ...updates } = payload as { id: string } & Record<string, unknown>;

  if (!id) {
    return jsonError("User id is required", 400);
  }

  const parsed = adminUserUpdateSchema.safeParse(updates);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  await dbConnect();

  const user = await User.findById(id);

  if (!user) {
    return jsonError("User not found", 404);
  }

  if (parsed.data.role) user.role = parsed.data.role;
  if (parsed.data.status) user.status = parsed.data.status;

  await user.save();

  const changes: string[] = [];
  if (parsed.data.role) changes.push(`role: ${parsed.data.role}`);
  if (parsed.data.status) changes.push(`status: ${parsed.data.status}`);

  if (changes.length > 0) {
    await Notification.create({
      userId: id,
      title: "System alert",
      message: `Admin ne aapka account update kiya (${changes.join(", ")}).`,
      type: "system",
      link: "/settings",
    });
  }

  await logActivity("update_user", id, session.user.id);

  return NextResponse.json({ user });
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "admin") {
    return jsonError("Admins only", 403);
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return jsonError("User id is required", 400);
  }

  if (id === session.user.id) {
    return jsonError("You cannot delete your own account", 400);
  }

  await dbConnect();

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return jsonError("User not found", 404);
  }

  await logActivity("delete_user", id, session.user.id);

  return NextResponse.json({ message: "User deleted" });
}
