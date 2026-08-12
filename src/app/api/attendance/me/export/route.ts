import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { AttendanceRecord } from "@/lib/models";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  await dbConnect();

  const records = await AttendanceRecord.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  const exportData = records.map((r: any) => ({
    date: r.createdAt?.toISOString() || "",
    subject: r.sessionId?.subject || "",
    status: r.status || "",
    sessionId: r.sessionId || "",
    markedAt: r.markedAt?.toISOString() || "",
  }));

  const csv = [
    ["Date", "Subject", "Status", "Session ID", "Marked At"],
    ...exportData.map((r) => [
      r.date,
      r.subject,
      r.status,
      r.sessionId,
      r.markedAt,
    ]),
  ].map((row) => row.join(",")).join("\n");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const csvPath = `/tmp/opencode/attendance_export_${session.user.id}_${timestamp}.csv`;

  fs.writeFileSync(csvPath, csv);

  return NextResponse.json({
    message: "Downloaded",
    path: csvPath,
    count: records.length,
  });
}
