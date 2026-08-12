import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { AttendanceRecord } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

type Status = "present" | "absent" | "late" | "excused";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  const month = request.nextUrl.searchParams.get("month") ?? "";

  await dbConnect();

  const records = await AttendanceRecord.find({ studentId: session.user.id })
    .populate("sessionId", "subject date")
    .sort({ createdAt: -1 })
    .lean();

  const rows = records.map((record) => {
    const sessionInfo = record.sessionId as unknown as
      | { subject?: string; date?: Date }
      | null;
    const rawDate = sessionInfo?.date ?? record.createdAt ?? record.markedAt ?? new Date();
    return {
      id: String(record._id),
      status: (record.status ?? "present") as Status,
      subject: sessionInfo?.subject ?? "General",
      date: rawDate instanceof Date ? rawDate : new Date(rawDate),
    };
  });

  function summarize(items: { status: Status }[]) {
    const present = items.filter((i) => i.status === "present").length;
    const late = items.filter((i) => i.status === "late").length;
    const excused = items.filter((i) => i.status === "excused").length;
    const absent = items.filter((i) => i.status === "absent").length;
    const total = items.length;
    const attended = present + late + excused;
    return {
      total,
      present,
      late,
      excused,
      absent,
      percentage: total === 0 ? 0 : Math.round((attended / total) * 100),
    };
  }

  function bySubject(items: { subject: string; status: Status }[]) {
    const map = new Map<string, { total: number; present: number }>();
    for (const item of items) {
      const entry = map.get(item.subject) ?? { total: 0, present: 0 };
      entry.total += 1;
      if (item.status !== "absent") entry.present += 1;
      map.set(item.subject, entry);
    }
    return Array.from(map.entries()).map(([subject, counts]) => ({
      subject,
      total: counts.total,
      present: counts.present,
      percentage: counts.total === 0 ? 0 : Math.round((counts.present / counts.total) * 100),
    }));
  }

  const monthly = month
    ? (() => {
        const monthRows = rows.filter((r) => r.date.toISOString().slice(0, 7) === month);
        return {
          month,
          summary: summarize(monthRows),
          subjectWise: bySubject(monthRows),
          byDay: monthRows.map((r) => ({
            date: r.date.toISOString(),
            subject: r.subject,
            status: r.status,
          })),
        };
      })()
    : null;

  return NextResponse.json({
    summary: summarize(rows),
    subjectWise: bySubject(rows),
    history: rows.map((r) => ({
      _id: r.id,
      status: r.status,
      sessionId: { subject: r.subject, date: r.date.toISOString() },
    })),
    monthly,
  });
}
