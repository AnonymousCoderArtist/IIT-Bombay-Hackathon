import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { AttendanceSession, AttendanceRecord } from "@/lib/models";
import { attendanceSessionSchema } from "@/lib/validators";
import { jsonError, logActivity } from "@/lib/api-helpers";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

  const sessions = await AttendanceSession.find()
    .sort({ date: -1 })
    .populate("facultyId", "name")
    .lean();

  const populated = await Promise.all(
    sessions.map(async (s) => {
      const count = await AttendanceRecord.countDocuments({ sessionId: s._id });
      return { ...s, recordCount: count };
    })
  );

  return NextResponse.json({ sessions: populated });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "faculty" && session.user.role !== "admin") {
    return jsonError("Only faculty can create attendance sessions", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = attendanceSessionSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  await dbConnect();

  const attendanceSession = await AttendanceSession.create({
    ...parsed.data,
    facultyId: session.user.id,
  });

  await logActivity("create_attendance_session", attendanceSession._id.toString(), session.user.id);

  return NextResponse.json({ session: attendanceSession }, { status: 201 });
}
