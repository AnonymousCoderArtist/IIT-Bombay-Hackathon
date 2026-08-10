import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Club } from "@/lib/models";
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
