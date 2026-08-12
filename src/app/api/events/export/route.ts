import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Event } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

function formatIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeField(value: string) {
  return value.replace(/[\\;,]/g, (m) => `\\${m}`);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  await dbConnect();

  const events = await Event.find({ startDate: { $gte: new Date() } })
    .sort({ startDate: 1 })
    .lean();

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Smart Campus//Events//EN",
    ...events.flatMap((event) => {
      const start = event.startDate instanceof Date ? event.startDate : new Date(event.startDate);
      const end = event.endDate instanceof Date ? event.endDate : start;
      return [
        "BEGIN:VEVENT",
        `UID:${event._id.toString()}@smart-campus`,
        `DTSTART:${formatIcsDate(start)}`,
        `DTEND:${formatIcsDate(end)}`,
        `SUMMARY:${escapeField(event.title ?? "")}`,
        event.venue ? `LOCATION:${escapeField(event.venue)}` : "",
        "END:VEVENT",
      ].filter(Boolean);
    }),
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(lines, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="campus-events.ics"',
    },
  });
}
