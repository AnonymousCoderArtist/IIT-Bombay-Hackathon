import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Club } from "@/lib/models";
import { whatsappGroupLinkSchema } from "@/lib/validators";
import { jsonError } from "@/lib/api-helpers";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "student") {
    return jsonError("Only students can join clubs", 403);
  }

  const { id } = await params;

  await dbConnect();

  const club = await Club.findById(id);

  if (!club) {
    return jsonError("Club not found", 404);
  }

  const userId = session.user.id;

  if (club.members.some((m: { toString: () => string }) => m.toString() === userId)) {
    return jsonError("You are already a member", 400);
  }

  club.members.push(userId);
  await club.save();

  return NextResponse.json({ message: "Joined the club", memberCount: club.members.length });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  const { id } = await params;

  await dbConnect();

  const club = await Club.findById(id);

  if (!club) {
    return jsonError("Club not found", 404);
  }

  const userId = session.user.id;

  if (!club.members.some((m: { toString: () => string }) => m.toString() === userId)) {
    return jsonError("You are not a member of this club", 400);
  }

  club.members = club.members.filter((m: { toString: () => string }) => m.toString() !== userId);
  await club.save();

  return NextResponse.json({ message: "Left the club", memberCount: club.members.length });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (!["admin", "coordinator", "faculty"].includes(session.user.role)) {
    return jsonError("Only coordinators, faculty and admins can update group links", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = whatsappGroupLinkSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  const { id } = await params;

  await dbConnect();

  const club = await Club.findByIdAndUpdate(
    id,
    { whatsappGroupLink: parsed.data.whatsappGroupLink },
    { new: true }
  );

  if (!club) {
    return jsonError("Club not found", 404);
  }

  return NextResponse.json({ club, message: "WhatsApp group link updated" });
}
