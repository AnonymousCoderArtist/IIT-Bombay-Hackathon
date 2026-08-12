import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { chatWithRag } from "@/lib/ai";
import { chatSchema } from "@/lib/validators";
import { jsonError, rateLimit, getClientIp } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  const ip = getClientIp(request);
  const limited = rateLimit(`chat:${session.user.id}:${ip}`, 30, 60 * 1000);
  if (!limited.allowed) return jsonError("Too many questions. Try again in a minute.", 429);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = chatSchema.safeParse(payload);
  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return NextResponse.json({ error: firstError.message }, { status: 400 });
  }

  const result = await chatWithRag(parsed.data.question);

  return NextResponse.json({ answer: result.answer, sources: result.sources, provider: result.provider });
}
