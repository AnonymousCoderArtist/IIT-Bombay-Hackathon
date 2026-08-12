import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { AttendanceSession, AttendanceRecord, Notification } from "@/lib/models";
import { verifyCheckInToken } from "@/lib/qr-attendance";
import { recognizeFace } from "@/lib/ai";
import { jsonError, rateLimit, getClientIp } from "@/lib/api-helpers";
import { qrCheckInSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  const ip = getClientIp(request);
  const limited = rateLimit(`qr:${session.user.id}:${ip}`, 20, 60 * 1000);
  if (!limited.allowed) return jsonError("Too many attempts. Try again in a minute.", 429);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = qrCheckInSchema.safeParse(payload);
  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  const sessionId = verifyCheckInToken(parsed.data.token);
  if (!sessionId) {
    return jsonError("QR code invalid ya expire ho gaya. Faculty se naya QR lo.", 400);
  }

  if (parsed.data.faceImage) {
    const faceResult = await recognizeFace(parsed.data.faceImage);
    if (!faceResult) {
      return jsonError("Face service unavailable — QR ya manual code use karo", 503);
    }
    if (!faceResult.matched || faceResult.user_id !== session.user.id) {
      return jsonError("Face match nahi hua. Pehle profile me face enroll karo aur dobara try karo.", 401);
    }
  }

  await dbConnect();

  const attendanceSession = await AttendanceSession.findById(sessionId);
  if (!attendanceSession) {
    return jsonError("Attendance session not found", 404);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sessionDay = new Date(attendanceSession.date);
  sessionDay.setHours(0, 0, 0, 0);

  if (sessionDay.getTime() !== today.getTime()) {
    return jsonError("Yeh session aaj ka nahi hai", 400);
  }

  const existing = await AttendanceRecord.findOne({
    sessionId,
    studentId: session.user.id,
  });

  if (existing && existing.status !== "absent") {
    return NextResponse.json({
      message: "Attendance already marked",
      status: existing.status,
      alreadyMarked: true,
    });
  }

  await AttendanceRecord.updateOne(
    { sessionId, studentId: session.user.id },
    { $set: { status: "present", markedAt: new Date() }, $setOnInsert: { sessionId, studentId: session.user.id } },
    { upsert: true }
  );

  await Notification.create({
    userId: attendanceSession.facultyId.toString(),
    title: "QR check-in",
    message: `${session.user.name ?? "Student"} ne QR se attendance check-in kiya (${attendanceSession.subject}).`,
    type: "attendance",
    link: `/attendance/${sessionId}`,
  });

  return NextResponse.json({ message: "Attendance marked", status: "present" });
}
