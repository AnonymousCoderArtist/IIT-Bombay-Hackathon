import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Course } from "@/lib/models";
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
