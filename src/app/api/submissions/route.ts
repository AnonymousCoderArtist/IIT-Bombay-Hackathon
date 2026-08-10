import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Submission, Assignment } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "faculty" && session.user.role !== "admin") {
    return jsonError("Only faculty can view submissions", 403);
  }

  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get("assignmentId");

  await dbConnect();

  const assignmentFilter = assignmentId
    ? { _id: assignmentId }
    : { facultyId: session.user.id };

  const assignments = await Assignment.find(assignmentFilter).select("_id title").lean();
  const assignmentIds = assignments.map((a) => a._id);

  const submissions = await Submission.find({ assignmentId: { $in: assignmentIds } })
    .populate("studentId", "name email rollNumber")
    .populate("assignmentId", "title deadline")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ submissions });
}
