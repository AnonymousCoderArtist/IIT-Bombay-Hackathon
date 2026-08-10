import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { User, Event, Assignment, Placement } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  await dbConnect();

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  const [students, faculty, events, assignments, placements] = await Promise.all([
    User.find({ role: "student", $or: [{ name: regex }, { email: regex }, { rollNumber: regex }] })
      .select("name email rollNumber image department")
      .limit(8)
      .lean(),
    User.find({ role: { $in: ["faculty", "coordinator"] }, $or: [{ name: regex }, { email: regex }, { department: regex }] })
      .select("name email department image role")
      .limit(6)
      .lean(),
    Event.find({ title: regex }).select("title venue startDate status").limit(6).lean(),
    Assignment.find({ title: regex }).select("title subject deadline").limit(6).lean(),
    Placement.find({ $or: [{ company: regex }, { jobRole: regex }] })
      .select("company jobRole ctc deadline")
      .limit(6)
      .lean(),
  ]);

  const results = [
    ...students.map((s) => ({
      type: "student",
      id: s._id.toString(),
      title: s.name,
      subtitle: `${s.email}${s.rollNumber ? ` · ${s.rollNumber}` : ""}`,
      link: "/admin/users",
    })),
    ...faculty.map((f) => ({
      type: f.role,
      id: f._id.toString(),
      title: f.name,
      subtitle: f.email,
      link: "/admin/users",
    })),
    ...events.map((e) => ({
      type: "event",
      id: e._id.toString(),
      title: e.title,
      subtitle: e.venue ?? "",
      link: `/events/${e._id}`,
    })),
    ...assignments.map((a) => ({
      type: "assignment",
      id: a._id.toString(),
      title: a.title,
      subtitle: a.subject ?? "",
      link: `/assignments/${a._id}`,
    })),
    ...placements.map((p) => ({
      type: "placement",
      id: p._id.toString(),
      title: `${p.company} — ${p.jobRole}`,
      subtitle: p.ctc ?? "",
      link: "/placements",
    })),
  ];

  return NextResponse.json({ results });
}
