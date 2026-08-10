import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Event, EventRegistration } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  const { id } = await params;

  await dbConnect();

  const registration = await EventRegistration.findOne({
    eventId: id,
    studentId: session.user.id,
    status: "registered",
  });

  if (!registration) {
    return jsonError("No active registration found for this event", 404);
  }

  registration.status = "cancelled";
  await registration.save();

  await Event.updateOne(
    { _id: id, registeredCount: { $gt: 0 } },
    { $inc: { registeredCount: -1 } }
  );

  return NextResponse.json({ message: "Registration cancelled" });
}
