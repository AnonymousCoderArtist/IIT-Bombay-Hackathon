const SERVICE_BASE = process.env.AI_SERVICE_URL ?? "";

type Provider = "gemini" | "deepseek" | "mock";

export type AiConfig = {
  provider: "openai" | "gemini";
  baseUrl: string;
  apiKey: string;
  model: string;
};

function getEnvAiConfig(): AiConfig | null {
  const baseUrl = process.env.AI_OPENAI_BASE_URL?.trim();
  const apiKey = process.env.AI_OPENAI_API_KEY?.trim();
  const model = process.env.AI_OPENAI_MODEL?.trim();
  if (baseUrl && apiKey && model) return { provider: "openai", baseUrl, apiKey, model };
  return null;
}

export async function getUserAiConfig(userId: string): Promise<AiConfig | null> {
  try {
    const [{ dbConnect }, { Settings }] = await Promise.all([
      import("@/lib/db"),
      import("@/lib/models"),
    ]);
    await dbConnect();
    const settings = (await Settings.findOne({ userId }).lean()) as
      | { ai?: { provider?: string; baseUrl?: string; apiKey?: string; model?: string } }
      | null;
    const ai = settings?.ai;
    if (ai?.apiKey && ai?.model) {
      const provider = ai.provider === "gemini" ? "gemini" : "openai";
      return {
        provider,
        baseUrl: ai.baseUrl ?? "",
        apiKey: ai.apiKey,
        model: ai.model,
      };
    }
  } catch {
    // DB hiccup — fall through to env config
  }
  return getEnvAiConfig();
}

async function callOpenAICompat(
  prompt: string,
  system: string | undefined,
  config: AiConfig
): Promise<string> {
  const messages = system
    ? [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ]
    : [{ role: "user", content: prompt }];

  const res = await fetch(`${config.baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.4,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI-compatible error ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI-compatible API returned empty response");
  return text;
}

async function callGeminiConfig(prompt: string, system: string | undefined, config: AiConfig): Promise<string> {
  const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;
  return callGemini(fullPrompt, config.apiKey, config.model);
}

function getProvider(): Provider {
  const name = (process.env.AI_PROVIDER ?? "").toLowerCase() as Provider;
  if (name === "gemini" && process.env.GEMINI_API_KEY) return "gemini";
  if (name === "deepseek" && process.env.DEEPSEEK_API_KEY) return "deepseek";
  return "mock";
}

async function callPython<T>(path: string, payload: unknown): Promise<T | null> {
  const r = await callPythonDetail<T>(path, payload);
  return r.ok ? r.data : null;
}

type CallResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function callPythonDetail<T>(path: string, payload: unknown): Promise<CallResult<T>> {
  if (!SERVICE_BASE) return { ok: false, error: "AI service URL configured nahi hai" };
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${SERVICE_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { detail?: string } | null;
      return { ok: false, error: body?.detail ?? `Service error ${res.status}` };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false, error: "AI service unreachable" };
  }
}

async function callGemini(prompt: string, apiKey: string, model: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1500 },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini error ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

async function callDeepSeek(prompt: string): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DeepSeek error ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("DeepSeek returned empty response");
  return text;
}

export async function generateText(
  prompt: string,
  system?: string,
  aiConfig?: AiConfig
): Promise<string> {
  const config = aiConfig ?? getEnvAiConfig();
  if (config) {
    if (config.provider === "gemini") return callGeminiConfig(prompt, system, config);
    return callOpenAICompat(prompt, system, config);
  }

  const provider = getProvider();
  const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;

  if (provider === "gemini") return callGemini(fullPrompt, process.env.GEMINI_API_KEY ?? "", "gemini-2.0-flash");
  if (provider === "deepseek") return callDeepSeek(fullPrompt);
  return "";
}

export type LectureSummary = {
  summary: string;
  key_points: string[];
  action_items: string[];
};

export async function summarizeLecture(
  transcript: string,
  aiConfig?: AiConfig
): Promise<LectureSummary | null> {
  const fromPython = await callPython<LectureSummary>("/summarize", {
    title: "",
    transcript,
    ai: aiConfig
      ? {
          provider: aiConfig.provider,
          base_url: aiConfig.baseUrl,
          api_key: aiConfig.apiKey,
          model: aiConfig.model,
        }
      : undefined,
  });
  if (fromPython) return fromPython;

  const raw = await generateText(
    `Convert this lecture transcript into structured study notes.\n\nTranscript:\n"""\n${transcript.slice(0, 20000)}\n"""\n\n` +
      `Respond in plain text with exactly these sections:\nSUMMARY: 2-3 line gist.\nKEY POINTS:\n- point one\n- point two\nACTION ITEMS:\n- action one`,
    "You are a study assistant. Keep it concise and useful for exam revision.",
    aiConfig
  );

  if (!raw) return null;

  const summary = raw.match(/SUMMARY:\s*([\s\S]*?)(?=KEY POINTS:|$)/i)?.[1]?.trim() ?? raw;
  const keyPoints = (raw.match(/KEY POINTS:\s*([\s\S]*?)(?=ACTION ITEMS:|$)/i)?.[1] ?? "")
    .split("\n")
    .map((l) => l.replace(/^[-*•\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 12);
  const actionItems = (raw.match(/ACTION ITEMS:\s*([\s\S]*?)$/i)?.[1] ?? "")
    .split("\n")
    .map((l) => l.replace(/^[-*•\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 8);

  return { summary, key_points: keyPoints, action_items: actionItems };
}

export type ChatResult = {
  answer: string;
  sources: string[];
  provider?: string;
};

export async function chatWithRag(question: string, aiConfig?: AiConfig): Promise<ChatResult> {
  const fromPython = await callPython<ChatResult>("/chat", {
    question,
    ai: aiConfig
      ? {
          provider: aiConfig.provider,
          base_url: aiConfig.baseUrl,
          api_key: aiConfig.apiKey,
          model: aiConfig.model,
        }
      : undefined,
  });
  if (fromPython) return fromPython;

  const raw = await generateText(
    `Question: ${question}`,
    "You are the IIT Bombay Smart Campus AI assistant. Answer concisely from campus knowledge. If you don't know, say you don't have that information.",
    aiConfig
  );

  if (raw) return { answer: raw, sources: [] };

  return {
    answer:
      "AI service aur LLM dono unavailable hain. Setup ke liye services/ai/.venv me uvicorn chalao aur .env me AI_SERVICE_URL set karo.",
    sources: [],
    provider: "none",
  };
}

export type MatchResult = {
  match_percent: number;
  strengths: string[];
  gaps: string[];
  advice?: string;
};

export async function matchSkills(input: {
  job_role: string;
  job_skills: string[];
  job_requirements?: string;
  profile_skills: string[];
  profile_extra?: string;
}): Promise<MatchResult> {
  const fromPython = await callPython<MatchResult>("/match", input);
  if (fromPython) return fromPython;

  const req = new Set(input.job_skills.map((s) => s.toLowerCase().trim()));
  const prof = new Set(input.profile_skills.map((s) => s.toLowerCase().trim()));
  const overlap = [...req].filter((s) => prof.has(s));
  const percent = req.size ? Math.round((overlap.length / req.size) * 100) : 0;

  return {
    match_percent: percent,
    strengths: [...overlap].sort(),
    gaps: [...req].filter((s) => !prof.has(s)).sort().slice(0, 10),
    advice:
      "Career cell se baat karke in skills par focus karo — LinkedIn Learning ya campus workshops se gaps cover karo.",
  };
}

export type SentimentResult = {
  sentiment: "positive" | "negative" | "neutral";
  score: number;
};

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  const fromPython = await callPython<SentimentResult>("/sentiment", { text });
  if (fromPython) return fromPython;

  const positive = ["great", "good", "nice", "best", "love", "helpful", "clean", "fast", "awesome", "excellent", "achha", "badhiya", "mast"];
  const negative = ["bad", "poor", "slow", "worst", "hate", "useless", "dirty", "broken", "kharab", "bura", "ghatiya"];
  const lowered = text.toLowerCase();
  const pos = positive.filter((w) => lowered.includes(w)).length;
  const neg = negative.filter((w) => lowered.includes(w)).length;
  if (pos === neg) return { sentiment: "neutral", score: 0.5 };
  return pos > neg ? { sentiment: "positive", score: 0.9 } : { sentiment: "negative", score: 0.1 };
}

export type PlagiarismPair = {
  a: string;
  b: string;
  similarity: number;
  reason?: string;
};

export async function checkPlagiarism(items: { id: string; text: string }[]): Promise<PlagiarismPair[]> {
  const fromPython = await callPython<{ pairs: PlagiarismPair[] }>("/plagiarism", { texts: items });
  if (fromPython) return fromPython.pairs;

  const pairs: PlagiarismPair[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const similarity = textSimilarity(items[i].text, items[j].text);
      if (similarity >= 40) {
        pairs.push({ a: items[i].id, b: items[j].id, similarity, reason: "text" });
      }
    }
  }
  return pairs.sort((x, y) => y.similarity - x.similarity);
}

function textSimilarity(a: string, b: string): number {
  const tokensA = new Set((a.toLowerCase().match(/[a-z0-9]+/g) ?? []).map((t) => t.trim()).filter(Boolean));
  const tokensB = new Set((b.toLowerCase().match(/[a-z0-9]+/g) ?? []).map((t) => t.trim()).filter(Boolean));
  if (!tokensA.size || !tokensB.size) return 0;
  if (tokensA.size === tokensB.size && [...tokensA].every((t) => tokensB.has(t))) return 100;
  const overlap = [...tokensA].filter((t) => tokensB.has(t)).length;
  return Math.round((overlap / Math.min(tokensA.size, tokensB.size)) * 100);
}

export type FaceEnrollResult = {
  enrolled: boolean;
  user_id: string;
  dim: number;
};

export class FaceServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FaceServiceError";
  }
}

export async function enrollFace(userId: string, image: string): Promise<FaceEnrollResult | null> {
  const r = await callPythonDetail<FaceEnrollResult>("/face/enroll", { user_id: userId, image });
  if (r.ok) return r.data;
  throw new FaceServiceError(r.error);
}

export async function recognizeFace(image: string): Promise<FaceRecognizeResult | null> {
  const r = await callPythonDetail<FaceRecognizeResult>("/face/recognize", { image });
  if (r.ok) return r.data;
  throw new FaceServiceError(r.error);
}

export type FaceMatch = {
  user_id: string;
  confidence: number;
};

export type FaceRecognizeResult = {
  matched: boolean;
  user_id: string | null;
  confidence: number;
  matches: FaceMatch[];
};

export function faceServiceConfigured(): boolean {
  return Boolean(SERVICE_BASE);
}

export type AiTestResult = { ok: boolean; message: string };

export async function testAiConnection(config: AiConfig): Promise<AiTestResult> {
  try {
    let text: string;
    if (config.provider === "gemini") {
      text = await callGemini("Reply with the single word OK", config.apiKey, config.model);
    } else {
      text = await callOpenAICompat("Reply with the single word OK", undefined, config);
    }
    const clean = text.replace(/\s+/g, " ").trim();
    return { ok: true, message: clean.slice(0, 200) || "Connected successfully" };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Connection failed" };
  }
}

export async function transcribeAudio(
  config: AiConfig,
  file: { name: string; type: string; buffer: ArrayBuffer }
): Promise<string> {
  if (config.provider === "gemini") {
    throw new Error(
      "Gemini provider audio transcription support nahi karta — OpenAI-compatible provider use karo (jaise Groq whisper)"
    );
  }

  const form = new FormData();
  form.append("file", new Blob([file.buffer], { type: file.type || "audio/mpeg" }), file.name);
  form.append("model", config.model);

  const res = await fetch(`${config.baseUrl.replace(/\/+$/, "")}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Transcription error ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as { text?: string };
  const text = data.text?.trim();
  if (!text) throw new Error("Transcription returned empty text");
  return text;
}

export function aiConfigured(): boolean {
  return getProvider() !== "mock" || Boolean(SERVICE_BASE) || Boolean(getEnvAiConfig());
}

export { aiConfigured as hasAI };
