import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { z } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Settings, User } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

const aiSchema = z
  .object({
    provider: z.enum(["openai", "gemini"]).optional(),
    baseUrl: z.string().max(300).optional(),
    apiKey: z.string().max(400).optional(),
    model: z.string().min(1).max(100).optional(),
  })
  .strict();

const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  emailOptIn: z.boolean().optional(),
  language: z.string().max(10).optional(),
  publicProfile: z.boolean().optional(),
  ai: z.union([aiSchema, z.literal(null)]).optional(),
  notificationPrefs: z
    .object({
      assignment: z.boolean().optional(),
      attendance: z.boolean().optional(),
      event: z.boolean().optional(),
      placement: z.boolean().optional(),
    })
    .optional(),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

  let settings = await Settings.findOne({ userId: session.user.id }).lean();

  if (!settings) {
    settings = {
      userId: session.user.id,
      theme: "system",
      emailOptIn: true,
      language: "en",
      publicProfile: true,
      ai: null,
      notificationPrefs: {
        assignment: true,
        attendance: true,
        event: true,
        placement: true,
      },
    };
  }

  const ai = settings.ai as
    | { provider?: string; baseUrl?: string; apiKey?: string; model?: string }
    | null
    | undefined;
  const aiProvider = ai?.provider === "gemini" ? "gemini" : "openai";
  const aiConfigured = Boolean(ai?.apiKey && ai?.model);

  const user = await User.findById(session.user.id).select("authProvider email name image").lean();

  return NextResponse.json({
    settings: {
      ...settings,
      ai: aiConfigured
        ? {
            provider: aiProvider,
            baseUrl: aiProvider === "openai" ? (ai?.baseUrl ?? "") : "",
            model: ai?.model ?? "",
            hasKey: true,
            keySuffix: ai?.apiKey?.slice(-4) ?? "",
          }
        : null,
    },
    account: {
      authProvider: user?.authProvider ?? "credentials",
      email: user?.email ?? "",
      name: user?.name ?? "",
      image: user?.image ?? null,
      googleConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  });
}

export async function PATCH(request: Request) {
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

  const parsed = settingsSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  await dbConnect();

  const patch = { ...parsed.data };

  if (patch.ai !== undefined) {
    if (patch.ai === null) {
      patch.ai = null;
    } else {
      const existing = await Settings.findOne({ userId: session.user.id }).lean();
      const prev = (existing?.ai ?? {}) as {
        provider?: string;
        baseUrl?: string;
        apiKey?: string;
        model?: string;
      };
      const provider = (patch.ai.provider as "openai" | "gemini") ?? prev.provider ?? "openai";
      const merged = {
        provider,
        baseUrl: patch.ai.baseUrl ?? prev.baseUrl ?? "",
        apiKey: patch.ai.apiKey ?? prev.apiKey ?? "",
        model: patch.ai.model ?? prev.model ?? "",
      };
      if (!merged.apiKey || !merged.model) {
        return jsonError("API key aur model dono required hain", 400);
      }
      if (provider === "openai") {
        if (!merged.baseUrl) {
          return jsonError("OpenAI-compatible ke liye base URL bhi required hai", 400);
        }
        try {
          new URL(merged.baseUrl);
        } catch {
          return jsonError("Base URL valid nahi hai", 400);
        }
      }
      patch.ai = merged;
    }
  }

  const settings = await Settings.findOneAndUpdate(
    { userId: session.user.id },
    { $set: patch },
    { upsert: true, new: true }
  );

  return NextResponse.json({ settings });
}
