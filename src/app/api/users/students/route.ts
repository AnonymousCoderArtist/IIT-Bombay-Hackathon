import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department") || undefined;
  const semester = searchParams.get("semester") || undefined;

  await dbConnect();

  const filter: Record<string, unknown> = { role: "student", status: "active" };

  if (department) filter.department = department;
  if (semester) filter.semester = Number(semester);

  const students = await User.find(filter)
    .select("name email rollNumber department semester image")
    .sort({ name: 1 })
    .lean();

  return NextResponse.json({ students });
}
