import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Placement, Application, User, Notification } from "@/lib/models";
import { jsonError, logActivity } from "@/lib/api-helpers";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "student") {
    return jsonError("Only students can apply for placements", 403);
  }

  const { id } = await params;

  await dbConnect();

  const placement = await Placement.findById(id);

  if (!placement) {
    return jsonError("Placement not found", 404);
  }

  if (new Date() > placement.deadline) {
    return jsonError("Application deadline has passed", 400);
  }

  const existing = await Application.findOne({
    placementId: id,
    studentId: session.user.id,
  });

  if (existing) {
    return jsonError("You have already applied for this position", 400);
  }

  const user = await User.findById(session.user.id).select("resumeUrl");

  const application = await Application.create({
    placementId: id,
    studentId: session.user.id,
    resumeUrl: user?.resumeUrl,
    status: "pending",
  });

  await Notification.create({
    userId: session.user.id,
    title: "Application submitted",
    message: `Your application for ${placement.company} (${placement.jobRole}) was submitted.`,
    type: "placement",
    link: `/placements`,
  });

  await logActivity("apply_placement", id, session.user.id);

  return NextResponse.json({ application }, { status: 201 });
}
