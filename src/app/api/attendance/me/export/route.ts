import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { AttendanceRecord } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  await dbConnect();

  const records = await AttendanceRecord.find({ studentId: session.user.id })
    .populate("sessionId", "subject")
    .sort({ createdAt: -1 })
    .lean();

  const rows = records.map((record) => {
    const sessionInfo = record.sessionId as unknown as { subject?: string } | null;
    const marked = record.markedAt instanceof Date ? record.markedAt : new Date();
    return {
      date: dateKey(marked),
      subject: sessionInfo?.subject ?? "",
      status: record.status ?? "",
      markedAt: marked.toISOString(),
    };
  });

  const csv = [
    ["Date", "Subject", "Status", "Marked At"],
    ...rows.map((r) => [r.date, r.subject, r.status, r.markedAt]),
  ]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="attendance_${timestamp}.csv"`,
    },
  });
}
