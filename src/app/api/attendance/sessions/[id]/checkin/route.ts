import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { AttendanceSession } from "@/lib/models";
import { createCheckInToken } from "@/lib/qr-attendance";
import { jsonError } from "@/lib/api-helpers";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  const { id } = await params;

  await dbConnect();
  const attendanceSession = await AttendanceSession.findById(id);
  if (!attendanceSession) return jsonError("Attendance session not found", 404);

  if (
    attendanceSession.facultyId.toString() !== session.user.id &&
    session.user.role !== "admin"
  ) {
    return jsonError("You do not own this session", 403);
  }

  const token = createCheckInToken(id, 10);

  return NextResponse.json({
    token,
    code: token,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
}
