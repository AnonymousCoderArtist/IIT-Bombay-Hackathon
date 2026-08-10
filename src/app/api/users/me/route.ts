import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";
import { jsonError, logActivity } from "@/lib/api-helpers";

export async function DELETE() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

  await logActivity("delete_own_account", "user", session.user.id);

  await User.findByIdAndDelete(session.user.id);

  return NextResponse.json({ message: "Account deleted" });
}
