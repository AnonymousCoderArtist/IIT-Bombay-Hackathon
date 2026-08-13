import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserAiConfig, transcribeAudio } from "@/lib/ai";
import { jsonError } from "@/lib/api-helpers";

const MAX_SIZE = 25 * 1024 * 1024;
const AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/ogg",
  "audio/m4a",
  "audio/mp4",
  "audio/aac",
  "audio/flac",
  "audio/x-m4a",
]);

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  const aiConfig = await getUserAiConfig(session.user.id);
  if (!aiConfig) {
    return jsonError(
      "AI provider configure nahi hai — Settings > AI me apna OpenAI-compatible base URL, API key aur model daalo.",
      400
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid upload", 400);
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("No audio file provided", 400);
  }

  if (file.size > MAX_SIZE) {
    return jsonError("Audio file 25MB se bada hai", 400);
  }

  const type = file.type.toLowerCase();
  if (!AUDIO_TYPES.has(type)) {
    return jsonError("Supported formats: MP3, WAV, M4A, WEBM, OGG, AAC, FLAC", 400);
  }

  try {
    const buffer = await file.arrayBuffer();
    const transcript = await transcribeAudio(
      aiConfig,
      { name: file.name, type, buffer }
    );
    return NextResponse.json({ transcript });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    return jsonError(message, 502);
  }
}
