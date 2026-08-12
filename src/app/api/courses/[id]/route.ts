import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Course } from "@/lib/models";
import { whatsappGroupLinkSchema } from "@/lib/validators";
import { jsonError, logActivity } from "@/lib/api-helpers";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "admin") {
    return jsonError("Admins only", 403);
  }

  const { id } = await params;

  await dbConnect();

  const course = await Course.findByIdAndDelete(id);

  if (!course) {
    return jsonError("Course not found", 404);
  }

  await logActivity("delete_course", id, session.user.id);

  return NextResponse.json({ message: "Course deleted" });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (!["admin", "faculty"].includes(session.user.role)) {
    return jsonError("Admins and faculty only", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = whatsappGroupLinkSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  const { id } = await params;

  await dbConnect();

  const course = await Course.findByIdAndUpdate(
    id,
    { whatsappGroupLink: parsed.data.whatsappGroupLink },
    { new: true }
  );

  if (!course) {
    return jsonError("Course not found", 404);
  }

  await logActivity("update_course_whatsapp", id, session.user.id);

  return NextResponse.json({ course, message: "WhatsApp group link updated" });
}
