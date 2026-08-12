import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { AttendanceSession, AttendanceRecord } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  const { id } = await params;

  await dbConnect();

  const attendanceSession = await AttendanceSession.findById(id)
    .populate("facultyId", "name")
    .lean();

  if (!attendanceSession) {
    return jsonError("Attendance session not found", 404);
  }

  const records = await AttendanceRecord.find({ sessionId: id }).lean();

  return NextResponse.json({ session: attendanceSession, records });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const { statuses } = payload as { statuses: Record<string, "present" | "absent" | "late" | "excused"> };

  if (!statuses || typeof statuses !== "object") {
    return jsonError("statuses object is required", 400);
  }

  await dbConnect();

  const attendanceSession = await AttendanceSession.findById(id);

  if (!attendanceSession) {
    return jsonError("Attendance session not found", 404);
  }

  if (
    attendanceSession.facultyId.toString() !== session.user.id &&
    session.user.role !== "admin"
  ) {
    return jsonError("You do not own this session", 403);
  }

  const ops = Object.entries(statuses).map(([studentId, status]) => ({
    updateOne: {
      filter: { sessionId: id, studentId },
      update: {
        $set: { status, markedAt: new Date() },
        $setOnInsert: { sessionId: id, studentId },
      },
      upsert: true,
    },
  }));

  await AttendanceRecord.bulkWrite(ops);

  const studentIds = Object.keys(statuses);

  if (studentIds.length > 0) {
    await Notification.insertMany(
      studentIds.map((studentId) => ({
        userId: studentId,
        title: "Attendance marked",
        message: `Attendance marked for ${attendanceSession.subject}: ${statuses[studentId]}.`,
        type: "attendance",
        link: "/attendance",
      }))
    );
  }

  return NextResponse.json({ message: "Attendance updated" });
}
