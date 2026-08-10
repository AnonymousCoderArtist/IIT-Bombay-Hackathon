import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Club } from "@/lib/models";
import { z } from "zod";
import { jsonError } from "@/lib/api-helpers";

const clubSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional().or(z.literal("")),
  category: z.string().max(80).optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

  const clubs = await Club.find().lean();

  const populated = clubs.map((club) => ({
    ...club,
    memberCount: club.members.length,
    isMember: club.members.some((m: { toString: () => string }) => m.toString() === session.user.id),
  }));

  return NextResponse.json({ clubs: populated });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (!["admin", "coordinator", "faculty"].includes(session.user.role)) {
    return jsonError("Only coordinators, faculty and admins can create clubs", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = clubSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  await dbConnect();

  const existing = await Club.findOne({ name: parsed.data.name });

  if (existing) {
    return jsonError("Club with this name already exists", 400);
  }

  const club = await Club.create({
    ...parsed.data,
    coordinatorId: session.user.id,
  });

  return NextResponse.json({ club }, { status: 201 });
}
