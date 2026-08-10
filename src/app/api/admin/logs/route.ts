import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { ActivityLog } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "admin") {
    return jsonError("Admins only", 403);
  }

  await dbConnect();

  const logs = await ActivityLog.find()
    .populate("userId", "name email role")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json({ logs });
}
