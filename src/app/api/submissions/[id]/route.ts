import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Submission, Notification } from "@/lib/models";
import { gradeSchema } from "@/lib/validators";
import { jsonError, logActivity } from "@/lib/api-helpers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "faculty" && session.user.role !== "admin") {
    return jsonError("Only faculty can grade submissions", 403);
  }

  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = gradeSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  await dbConnect();

  const submission = await Submission.findById(id).populate("assignmentId", "title");

  if (!submission) {
    return jsonError("Submission not found", 404);
  }

  submission.marks = parsed.data.marks;
  submission.feedback = parsed.data.feedback;
  submission.status = "graded";
  submission.gradedAt = new Date();
  await submission.save();

  await Notification.create({
    userId: submission.studentId,
    title: "Assignment graded",
    message: `Your submission for "${(submission.assignmentId as unknown as { title: string }).title}" was graded: ${parsed.data.marks}/100`,
    type: "assignment",
    link: `/assignments/${(submission.assignmentId as unknown as { _id: string })._id}`,
  });

  await logActivity("grade_submission", id, session.user.id);

  return NextResponse.json({ submission });
}
