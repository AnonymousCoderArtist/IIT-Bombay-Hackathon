import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Assignment, Submission, Notification, User } from "@/lib/models";
import { assignmentSchema } from "@/lib/validators";
import { jsonError, logActivity } from "@/lib/api-helpers";

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
  }).select("_id");

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

  await logActivity("create_assignment", assignment._id.toString(), session.user.id);

  return NextResponse.json({ assignment }, { status: 201 });
}
