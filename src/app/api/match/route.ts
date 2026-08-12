import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { z } from "zod";
import { auth } from "@/auth";
import { matchSkills } from "@/lib/ai";
import { jsonError } from "@/lib/api-helpers";

const matchSchema = z.object({
  job_role: z.string().min(2).max(200),
  job_skills: z.array(z.string().max(60)).default([]),
  job_requirements: z.string().max(1000).optional().or(z.literal("")),
  profile_skills: z.array(z.string().max(60)).min(1),
  profile_extra: z.string().max(1000).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = matchSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = (parsed.error as ZodError).issues[0];
    return jsonError(firstError.message, 400);
  }

  const result = await matchSkills({
    job_role: parsed.data.job_role,
    job_skills: parsed.data.job_skills,
    job_requirements: parsed.data.job_requirements,
    profile_skills: parsed.data.profile_skills,
    profile_extra: parsed.data.profile_extra,
  });

  return NextResponse.json(result);
}
