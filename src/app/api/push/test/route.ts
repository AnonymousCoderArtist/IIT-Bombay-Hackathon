import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Settings } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";
import { sendPush, vapidConfigured, type PushSubscription } from "@/lib/push";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  if (!vapidConfigured()) {
    return jsonError("VAPID keys set nahi hain — .env me VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY daalo", 503);
  }

  await dbConnect();

  const settings = await Settings.findOne({ userId: session.user.id }).lean();
  const subscription = settings?.pushSubscription as PushSubscription | null | undefined;

  if (!subscription) {
    return jsonError("Pehle push subscribe karo (browser permission ke saath)", 400);
  }

  const result = await sendPush(subscription);

  if (!result.ok && (result.status === 410 || result.status === 404)) {
    await Settings.findOneAndUpdate(
      { userId: session.user.id },
      { $set: { pushSubscription: null } }
    );
    return jsonError("Subscription invalid ho gayi — dobara subscribe karo", 410);
  }

  if (!result.ok) {
    return jsonError(`Push service error (${result.status ?? "unknown"})`, 502);
  }

  return NextResponse.json({ message: "Push notification bhej di gayi" });
}
