import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Department } from "@/lib/models";
import { jsonError, logActivity } from "@/lib/api-helpers";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

  const departments = await Department.find().sort({ name: 1 });

  return NextResponse.json({ departments });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "admin") {
    return jsonError("Admins only", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const { name, code, description } = payload as {
    name?: string;
    code?: string;
    description?: string;
  };

  if (!name || !code) {
    return jsonError("name and code are required", 400);
  }

  await dbConnect();

  const existing = await Department.findOne({ $or: [{ name }, { code }] });

  if (existing) {
    return jsonError("Department with this name or code already exists", 409);
  }

  const department = await Department.create({ name, code, description });

  await logActivity("create_department", department._id.toString(), session.user.id);

  return NextResponse.json({ department }, { status: 201 });
}
