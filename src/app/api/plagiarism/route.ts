import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { z } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Submission } from "@/lib/models";
import { checkPlagiarism, type PlagiarismPair } from "@/lib/ai";
import { jsonError } from "@/lib/api-helpers";

const requestSchema = z.object({
  assignmentId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  if (session.user.role !== "faculty" && session.user.role !== "admin") {
    return jsonError("Only faculty can run plagiarism checks", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  await dbConnect();

  const submissions = await Submission.find({ assignmentId: parsed.data.assignmentId })
    .populate("studentId", "name rollNumber email")
    .lean();

  if (submissions.length < 2) {
    return NextResponse.json({
      pairs: [],
      note: "Kam se kam 2 submissions hone chahiye plagiarism check ke liye.",
    });
  }

  const items = submissions.map((submission) => {
    const parts = [submission.notes ?? ""];
    if (submission.githubLink) parts.push(`github:${submission.githubLink}`);
    if (submission.fileUrl) parts.push(`file:${submission.fileUrl}`);
    return { id: String(submission._id), text: parts.join(" | ") };
  });

  const pairs = await checkPlagiarism(items);

  const students = new Map<string, unknown>(
    submissions.map((submission) => [String(submission._id), submission.studentId] as const)
  );

  const enriched: (PlagiarismPair & {
    studentA?: { name?: string; email?: string };
    studentB?: { name?: string; email?: string };
  })[] = pairs.map((pair) => ({
    ...pair,
    studentA: students.get(pair.a) as { name?: string; email?: string } | undefined,
    studentB: students.get(pair.b) as { name?: string; email?: string } | undefined,
  }));

  return NextResponse.json({ pairs: enriched, note: null });
}
