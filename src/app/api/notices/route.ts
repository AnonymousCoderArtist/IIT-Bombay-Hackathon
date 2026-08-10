import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { z } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Notice } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

const noticeSchema = z.object({
  title: z.string().min(3).max(150),
  body: z.string().min(3).max(2000),
  category: z.string().max(80).optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

  const notices = await Notice.find()
    .populate("authorId", "name role")
    .sort({ pinned: -1, createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json({ notices });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (!["admin", "coordinator", "faculty"].includes(session.user.role)) {
    return jsonError("Only faculty, coordinators and admins can publish notices", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = noticeSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  await dbConnect();

  const notice = await Notice.create({
    ...parsed.data,
    authorId: session.user.id,
  });

  return NextResponse.json({ notice }, { status: 201 });
}
