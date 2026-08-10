import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Assignment, Submission } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  const { id } = await params;

  await dbConnect();

  const assignment = await Assignment.findById(id).lean();

  if (!assignment) {
    return jsonError("Assignment not found", 404);
  }

  const submission =
    session.user.role === "student"
      ? await Submission.findOne({
          assignmentId: id,
          studentId: session.user.id,
        }).lean()
      : null;

  return NextResponse.json({ assignment, submission });
}
