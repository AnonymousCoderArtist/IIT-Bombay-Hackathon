import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Event, EventRegistration } from "@/lib/models";
import { eventSchema } from "@/lib/validators";
import { jsonError, logActivity } from "@/lib/api-helpers";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

  const events = await Event.find().sort({ startDate: 1 }).lean();

  let registrations: string[] = [];

  if (session.user.role === "student") {
    const regs = await EventRegistration.find({
      studentId: session.user.id,
      status: "registered",
    }).select("eventId");
    registrations = regs.map((r) => r.eventId.toString());
  }

  const populated = events.map((event) => ({
    ...event,
    isRegistered: registrations.includes(event._id.toString()),
  }));

  return NextResponse.json({ events: populated });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "admin" && session.user.role !== "coordinator") {
    return jsonError("Only admins and coordinators can create events", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = eventSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  await dbConnect();

  const event = await Event.create({
    ...parsed.data,
    organizerId: session.user.id,
  });

  await logActivity("create_event", event._id.toString(), session.user.id);

  return NextResponse.json({ event }, { status: 201 });
}
