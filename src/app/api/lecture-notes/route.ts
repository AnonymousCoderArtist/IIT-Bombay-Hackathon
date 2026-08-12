import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { dbConnect } from "@/lib/db";
import { LectureNote } from "@/lib/models";
import { auth } from "@/auth";
import { lectureNoteSchema } from "@/lib/validators";
import { summarizeLecture } from "@/lib/ai";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

  await dbConnect();
  const notes = await LectureNote.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = lectureNoteSchema.safeParse(payload);
  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return NextResponse.json({ error: firstError.message }, { status: 400 });
  }

  const { title, subject, transcript, durationSec, source } = parsed.data;
  if (!transcript || transcript.trim().length < 30) {
    return NextResponse.json({ error: "Transcript kaafi lamba nahi hai (min 30 chars)" }, { status: 400 });
  }

  await dbConnect();

  let summary = "";
  let keyPoints: string[] = [];
  let actionItems: string[] = [];

  const result = await summarizeLecture(transcript);
  if (result) {
    summary = result.summary;
    keyPoints = result.key_points;
    actionItems = result.action_items;
  } else {
    summary = "AI summary generate nahi hua. Python AI service ya LLM API key check karo.";
  }

  const note = await LectureNote.create({
    userId: session.user.id,
    title,
    subject,
    transcript,
    summary,
    keyPoints,
    actionItems,
    durationSec,
    source,
  });

  return NextResponse.json({ note }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Note id required" }, { status: 400 });

  await dbConnect();
  await LectureNote.deleteOne({ _id: id, userId: session.user.id });

  return NextResponse.json({ message: "Note deleted" });
}
