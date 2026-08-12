import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Assignment, Submission, Notification, User } from "@/lib/models";
import { assignmentSchema } from "@/lib/validators";
import { jsonError, logActivity } from "@/lib/api-helpers";
import { sendMail } from "@/lib/mailer";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

  let assignments;

  if (session.user.role === "faculty") {
    assignments = await Assignment.find({ facultyId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();
  } else {
    assignments = await Assignment.find().sort({ createdAt: -1 }).lean();

    if (session.user.role === "student") {
      const submissions = await Submission.find({ studentId: session.user.id })
        .select("assignmentId status marks submittedAt")
        .lean();

      const submissionMap = new Map(
        submissions.map((s) => [s.assignmentId.toString(), s])
      );

      assignments = assignments.map((a) => {
        const submission = submissionMap.get(a._id.toString());
        return {
          ...a,
          submitted: Boolean(submission),
          submission,
        };
      });
    }
  }

  return NextResponse.json({ assignments });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "faculty" && session.user.role !== "admin") {
    return jsonError("Only faculty can create assignments", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = assignmentSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  await dbConnect();

  const assignment = await Assignment.create({
    ...parsed.data,
    facultyId: session.user.id,
  });

  const students = await User.find({
    role: "student",
    ...(parsed.data.department ? { department: parsed.data.department } : {}),
  }).select("_id email name");

  const notifications = students.map((student: { _id: unknown }) => ({
    userId: student._id,
    title: "New assignment",
    message: `${parsed.data.title} was just published.`,
    type: "assignment",
    link: `/assignments/${assignment._id}`,
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  const deadline = new Date(parsed.data.deadline);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await Promise.allSettled(
    (students as { _id: unknown; email?: string; name?: string }[])
      .filter((student) => Boolean(student.email))
      .map((student) =>
        sendMail({
          to: student.email as string,
          subject: `New assignment: ${parsed.data.title}`,
          text: `Hi ${student.name ?? "Student"},\n\nNaya assignment publish hua hai:\n\n${parsed.data.title}\n${parsed.data.description ?? ""}\n\nDeadline: ${deadline.toLocaleString()}\n\nDetails aur submission: ${appUrl}/assignments/${assignment._id}\n\n- Smart Campus`,
          html: `<p>Hi ${student.name ?? "Student"},</p><p>Naya assignment publish hua hai:</p><h3>${parsed.data.title}</h3><p>${parsed.data.description ?? ""}</p><p><strong>Deadline:</strong> ${deadline.toLocaleString()}</p><p><a href="${appUrl}/assignments/${assignment._id}">Assignment kholo</a></p><p>- Smart Campus</p>`,
        })
      )
  );

  await logActivity("create_assignment", assignment._id.toString(), session.user.id);

  return NextResponse.json({ assignment }, { status: 201 });
}
