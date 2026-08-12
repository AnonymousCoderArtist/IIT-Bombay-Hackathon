import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Notification, EventRegistration } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

  const upcomingEvents = await EventRegistration.find({
    studentId: session.user.id,
    status: "registered",
  })
    .populate("eventId", "title startDate venue")
    .lean();

  const now = Date.now();
  const soon = new Date(now + 24 * 60 * 60 * 1000);

  for (const reg of upcomingEvents) {
    const event = reg.eventId as unknown as { _id: string; title: string; startDate: string; venue?: string };
    if (!event?.startDate) continue;

    const start = new Date(event.startDate).getTime();
    if (start < now || start > soon.getTime()) continue;

    const eventId = (event._id ?? (reg.eventId as unknown as string)).toString();
    const existing = await Notification.exists({
      userId: session.user.id,
      type: "event",
      link: `/events/${eventId}`,
    });

    if (existing) continue;

    await Notification.create({
      userId: session.user.id,
      title: "Event reminder",
      message: `${event.title} ${event.venue ? `at ${event.venue}` : ""} is starting soon.`,
      type: "event",
      link: `/events/${eventId}`,
    });
  }

  const notifications = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = await Notification.countDocuments({
    userId: session.user.id,
    isRead: false,
  });

  return NextResponse.json({ notifications, unreadCount });
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

  const { id, markAll } = payload as { id?: string; markAll?: boolean };

  await dbConnect();

  if (markAll) {
    await Notification.updateMany({ userId: session.user.id, isRead: false }, { isRead: true });
    return NextResponse.json({ message: "All notifications marked as read" });
  }

  if (!id) {
    return jsonError("Notification id is required", 400);
  }

  await Notification.updateOne({ _id: id, userId: session.user.id }, { isRead: true });

  return NextResponse.json({ message: "Notification marked as read" });
}
