import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Assignment, Submission, Notification } from "@/lib/models";
import { submissionSchema } from "@/lib/validators";
import { jsonError, logActivity } from "@/lib/api-helpers";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "student") {
    return jsonError("Only students can submit assignments", 403);
  }

  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = submissionSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  if (!parsed.data.fileUrl && !parsed.data.githubLink) {
    return jsonError("Upload a file or provide a GitHub link", 400);
  }

  await dbConnect();

  const assignment = await Assignment.findById(id);

  if (!assignment) {
    return jsonError("Assignment not found", 404);
  }

  const isLate = new Date() > assignment.deadline;

  const existing = await Submission.findOne({
    assignmentId: id,
    studentId: session.user.id,
  });

  let submission;

  if (existing) {
    submission = await Submission.findByIdAndUpdate(
      existing._id,
      {
        ...parsed.data,
        status: isLate ? "late" : "submitted",
        submittedAt: new Date(),
      },
      { new: true }
    );
  } else {
    submission = await Submission.create({
      assignmentId: id,
      studentId: session.user.id,
      ...parsed.data,
      status: isLate ? "late" : "submitted",
    });
  }

  await Notification.create({
    userId: assignment.facultyId,
    title: "New submission",
    message: `${session.user.email} submitted "${assignment.title}".`,
    type: "assignment",
    link: `/assignments/${id}`,
  });

  await logActivity("submit_assignment", id, session.user.id);

  return NextResponse.json({ submission });
}
