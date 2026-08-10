import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Notification } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

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
