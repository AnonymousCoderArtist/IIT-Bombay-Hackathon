import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Course } from "@/lib/models";
import { courseSchema } from "@/lib/validators";
import { jsonError, logActivity } from "@/lib/api-helpers";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

  const courses = await Course.find().sort({ code: 1 }).lean();

  const populated = courses.map((course) => ({
    ...course,
    whatsappGroupLink: course.whatsappGroupLink ?? "",
  }));

  return NextResponse.json({ courses: populated });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "admin") {
    return jsonError("Admins only", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = courseSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  await dbConnect();

  const existing = await Course.findOne({ code: parsed.data.code });

  if (existing) {
    return jsonError("Course with this code already exists", 409);
  }

  const course = await Course.create(parsed.data);

  await logActivity("create_course", course._id.toString(), session.user.id);

  return NextResponse.json({ course }, { status: 201 });
}
