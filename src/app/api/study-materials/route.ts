import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { StudyMaterial, User } from "@/lib/models";
import { studyMaterialSchema } from "@/lib/validators";
import { jsonError, logActivity } from "@/lib/api-helpers";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

  const materials = await StudyMaterial.find()
    .populate("facultyId", "name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ materials });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "faculty" && session.user.role !== "admin") {
    return jsonError("Only faculty can upload study material", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = studyMaterialSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  await dbConnect();

  const material = await StudyMaterial.create({
    ...parsed.data,
    facultyId: session.user.id,
  });

  const students = await User.find({
    role: "student",
    ...(parsed.data.department ? { department: parsed.data.department } : {}),
  }).select("_id");

  if (students.length > 0) {
    const { Notification } = await import("@/lib/models");
    await Notification.insertMany(
      students.map((student: { _id: unknown }) => ({
        userId: student._id,
        title: "New study material",
        message: `${parsed.data.title} was uploaded.`,
        type: "assignment",
        link: `/materials`,
      }))
    );
  }

  await logActivity("upload_study_material", material._id.toString(), session.user.id);

  return NextResponse.json({ material }, { status: 201 });
}
