import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { z } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Settings } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  emailOptIn: z.boolean().optional(),
  language: z.string().max(10).optional(),
  notificationPrefs: z
    .object({
      assignment: z.boolean().optional(),
      attendance: z.boolean().optional(),
      event: z.boolean().optional(),
      placement: z.boolean().optional(),
    })
    .optional(),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

  let settings = await Settings.findOne({ userId: session.user.id }).lean();

  if (!settings) {
    settings = {
      userId: session.user.id,
      theme: "system",
      emailOptIn: true,
      language: "en",
      notificationPrefs: {
        assignment: true,
        attendance: true,
        event: true,
        placement: true,
      },
    };
  }

  return NextResponse.json({ settings });
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

  const parsed = settingsSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  await dbConnect();

  const settings = await Settings.findOneAndUpdate(
    { userId: session.user.id },
    { $set: parsed.data },
    { upsert: true, new: true }
  );

  return NextResponse.json({ settings });
}
