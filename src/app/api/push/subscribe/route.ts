import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { z } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Settings } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";
import { vapidConfigured } from "@/lib/push";

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(500),
  keys: z.object({
    p256dh: z.string().min(1).max(500),
    auth: z.string().min(1).max(500),
  }),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  return NextResponse.json({
    configured: vapidConfigured(),
    vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? process.env.VAPID_PUBLIC_KEY ?? "",
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = subscriptionSchema.safeParse(payload);
  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  await dbConnect();

  await Settings.findOneAndUpdate(
    { userId: session.user.id },
    { $set: { pushSubscription: parsed.data } },
    { upsert: true }
  );

  return NextResponse.json({ message: "Push subscribed" });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  await dbConnect();

  await Settings.findOneAndUpdate(
    { userId: session.user.id },
    { $set: { pushSubscription: null } }
  );

  return NextResponse.json({ message: "Push unsubscribed" });
}
