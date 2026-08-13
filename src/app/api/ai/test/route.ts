import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { testAiConnection, getUserAiConfig } from "@/lib/ai";
import { jsonError } from "@/lib/api-helpers";

const testSchema = z.object({
  provider: z.enum(["openai", "gemini"]).default("openai"),
  baseUrl: z.string().max(300).optional(),
  model: z.string().min(1).max(100),
  apiKey: z.string().max(400).optional(),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = testSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0].message, 400);
  }

  let apiKey = parsed.data.apiKey?.trim();
  if (!apiKey) {
    const stored = await getUserAiConfig(session.user.id);
    if (!stored?.apiKey) {
      return jsonError("API key nahi mila — pehle key save karo ya field me daalo", 400);
    }
    apiKey = stored.apiKey;
  }

  const provider = parsed.data.provider;
  const stored = await getUserAiConfig(session.user.id);
  const storedBaseUrl = stored?.provider === "openai" ? stored.baseUrl : "";
  const baseUrl = parsed.data.baseUrl ?? (provider === "openai" ? storedBaseUrl : "");

  if (provider === "openai" && !baseUrl) {
    return jsonError("OpenAI-compatible ke liye base URL required hai", 400);
  }

  const result = await testAiConnection({
    provider,
    baseUrl,
    model: parsed.data.model,
    apiKey,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
