import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Department, User } from "@/lib/models";
import { jsonError, logActivity } from "@/lib/api-helpers";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "admin") {
    return jsonError("Admins only", 403);
  }

  const { id } = await params;

  await dbConnect();

  const department = await Department.findById(id);

  if (!department) {
    return jsonError("Department not found", 404);
  }

  const usersInDept = await User.countDocuments({ department: department.code });

  if (usersInDept > 0) {
    return jsonError(
      `${usersInDept} user(s) is department me hain. Pehle unhe kisi aur department me shift karo.`,
      409
    );
  }

  await Department.findByIdAndDelete(id);

  await logActivity("delete_department", id, session.user.id);

  return NextResponse.json({ message: "Department deleted" });
}
