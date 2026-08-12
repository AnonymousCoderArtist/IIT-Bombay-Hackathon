import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { jsonError } from "@/lib/api-helpers";
import { recognizeFace, faceServiceConfigured } from "@/lib/ai";
import { faceRecognizeSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  if (!faceServiceConfigured()) {
    return jsonError("Face service configured nahi hai (AI_SERVICE_URL missing)", 503);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = faceRecognizeSchema.safeParse(payload);
  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  const result = await recognizeFace(parsed.data.image);
  if (!result) {
    return jsonError("Face service unavailable — dobara try karo", 503);
  }

  return NextResponse.json(result);
}
