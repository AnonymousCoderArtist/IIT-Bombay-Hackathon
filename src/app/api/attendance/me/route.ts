import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { AttendanceRecord } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

  const records = await AttendanceRecord.find({ studentId: session.user.id })
    .populate("sessionId", "subject date sessionType")
    .sort({ createdAt: -1 })
    .lean();

  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const excused = records.filter((r) => r.status === "excused").length;
  const absent = records.filter((r) => r.status === "absent").length;

  const considered = present + late + excused + absent;
  const percentage = considered === 0 ? 0 : Math.round(((present + late + excused) / considered) * 100);

  const bySubject = new Map<string, { total: number; present: number; records: unknown[] }>();

  for (const record of records) {
    const subject = (record.sessionId as unknown as { subject?: string })?.subject ?? "General";
    const entry = bySubject.get(subject) ?? { total: 0, present: 0, records: [] };
    entry.total += 1;
    if (record.status !== "absent") entry.present += 1;
    entry.records.push(record);
    bySubject.set(subject, entry);
  }

  const subjectWise = Array.from(bySubject.entries()).map(([subject, data]) => ({
    subject,
    total: data.total,
    present: data.present,
    percentage: Math.round((data.present / data.total) * 100),
  }));

  return NextResponse.json({
    summary: { total, present, late, excused, absent, percentage },
    subjectWise,
    history: records,
  });
}
