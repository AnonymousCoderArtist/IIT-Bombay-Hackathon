import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { AttendanceRecord } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? "";

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

  let monthly: {
    month: string;
    summary: { total: number; present: number; late: number; excused: number; absent: number; percentage: number };
    subjectWise: { subject: string; total: number; present: number; percentage: number }[];
    byDay: { date: string; subject: string; status: string }[];
  } | null = null;

  if (/^\d{4}-\d{2}$/.test(month)) {
    const [year, monthNum] = month.split("-").map(Number);

    const inMonth = records.filter((record) => {
      const date = (record.sessionId as unknown as { date?: string })?.date;
      if (!date) return false;
      const d = new Date(date);
      return d.getFullYear() === year && d.getMonth() + 1 === monthNum;
    });

    const mPresent = inMonth.filter((r) => r.status === "present").length;
    const mLate = inMonth.filter((r) => r.status === "late").length;
    const mExcused = inMonth.filter((r) => r.status === "excused").length;
    const mAbsent = inMonth.filter((r) => r.status === "absent").length;
    const mTotal = inMonth.length;
    const mConsidered = mPresent + mLate + mExcused + mAbsent;

    const byMonthSubject = new Map<string, { total: number; present: number }>();

    const byDay = inMonth.map((record) => {
      const subject = (record.sessionId as unknown as { subject?: string })?.subject ?? "General";
      const date = (record.sessionId as unknown as { date?: string })?.date ?? "";
      const entry = byMonthSubject.get(subject) ?? { total: 0, present: 0 };
      entry.total += 1;
      if (record.status !== "absent") entry.present += 1;
      byMonthSubject.set(subject, entry);
      return { date, subject, status: record.status };
    });

    byDay.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    monthly = {
      month,
      summary: {
        total: mTotal,
        present: mPresent,
        late: mLate,
        excused: mExcused,
        absent: mAbsent,
        percentage: mConsidered === 0 ? 0 : Math.round(((mPresent + mLate + mExcused) / mConsidered) * 100),
      },
      subjectWise: Array.from(byMonthSubject.entries()).map(([subject, data]) => ({
        subject,
        total: data.total,
        present: data.present,
        percentage: Math.round((data.present / data.total) * 100),
      })),
      byDay,
    };
  }

  return NextResponse.json({
    summary: { total, present, late, excused, absent, percentage },
    subjectWise,
    history: records,
    monthly,
  });
}
