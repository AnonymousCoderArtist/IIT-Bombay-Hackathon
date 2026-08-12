import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Placement, Application, Notification, User } from "@/lib/models";
import { placementSchema } from "@/lib/validators";
import { jsonError, logActivity } from "@/lib/api-helpers";
import { sendMail } from "@/lib/mailer";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

  const placements = await Placement.find().sort({ createdAt: -1 }).lean();

  let appliedIds: string[] = [];

  if (session.user.role === "student") {
    const applications = await Application.find({ studentId: session.user.id }).select(
      "placementId status"
    );
    const statusMap = new Map(
      applications.map((a) => [a.placementId.toString(), a.status])
    );
    appliedIds = Array.from(statusMap.keys());

    return NextResponse.json({
      placements: placements.map((p) => ({
        ...p,
        applied: appliedIds.includes(p._id.toString()),
        applicationStatus: statusMap.get(p._id.toString()),
      })),
    });
  }

  return NextResponse.json({
    placements: placements.map((p) => ({ ...p, applied: false })),
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "admin" && session.user.role !== "coordinator") {
    return jsonError("Only admins and coordinators can create placements", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = placementSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  await dbConnect();

  const placement = await Placement.create(parsed.data);

  const students = await User.find({ role: "student" }).select("_id email name");

  if (students.length > 0) {
    await Notification.insertMany(
      students.map((student: { _id: unknown }) => ({
        userId: student._id,
        title: "New placement opening",
        message: `${parsed.data.company} is hiring for ${parsed.data.jobRole}.`,
        type: "placement",
        link: "/placements",
      }))
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await Promise.allSettled(
      (students as { _id: unknown; email?: string; name?: string }[])
        .filter((student) => Boolean(student.email))
        .map((student) =>
          sendMail({
            to: student.email as string,
            subject: `New placement: ${parsed.data.company}`,
            text: `Hi ${student.name ?? "Student"},\n\nNayi placement opening aa gayi hai:\n\n${parsed.data.company} — ${parsed.data.jobRole}\nCTC: ${parsed.data.ctc ?? "N/A"}\nDeadline: ${new Date(parsed.data.deadline).toLocaleString()}\n\nApply karo: ${appUrl}/placements\n\n- Smart Campus`,
            html: `<p>Hi ${student.name ?? "Student"},</p><p>Nayi placement opening aa gayi hai:</p><h3>${parsed.data.company} — ${parsed.data.jobRole}</h3><p><strong>CTC:</strong> ${parsed.data.ctc ?? "N/A"}<br/><strong>Deadline:</strong> ${new Date(parsed.data.deadline).toLocaleString()}</p><p><a href="${appUrl}/placements">Apply karo</a></p><p>- Smart Campus</p>`,
          })
        )
    );
  }

  await logActivity("create_placement", placement._id.toString(), session.user.id);

  return NextResponse.json({ placement }, { status: 201 });
}
