import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import {
  User,
  Department,
  Event,
  EventRegistration,
  Assignment,
  Submission,
  AttendanceSession,
  AttendanceRecord,
  Placement,
  Application,
  Notification,
  ActivityLog,
} from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  await dbConnect();

  const role = session.user.role;

  if (role === "student") {
    const [assignments, submissions, registrations, unread, records] = await Promise.all([
      Assignment.countDocuments(),
      Submission.countDocuments({ studentId: session.user.id }),
      EventRegistration.countDocuments({ studentId: session.user.id, status: "registered" }),
      Notification.countDocuments({ userId: session.user.id, isRead: false }),
      AttendanceRecord.find({ studentId: session.user.id }).select("status"),
    ]);

    const considered = records.length;
    const present = records.filter((r) => r.status !== "absent").length;

    return NextResponse.json({
      role,
      data: {
        totalAssignments: assignments,
        submissions,
        eventsRegistered: registrations,
        unreadNotifications: unread,
        attendance: {
          considered,
          present,
          percentage: considered === 0 ? 0 : Math.round((present / considered) * 100),
        },
      },
    });
  }

  if (role === "faculty") {
    const [sessions, assignments, students, submissions, unread] = await Promise.all([
      AttendanceSession.countDocuments({ facultyId: session.user.id }),
      Assignment.countDocuments({ facultyId: session.user.id }),
      User.countDocuments({ role: "student" }),
      Submission.countDocuments({
        assignmentId: { $in: await Assignment.find({ facultyId: session.user.id }).distinct("_id") },
      }),
      Notification.countDocuments({ userId: session.user.id, isRead: false }),
    ]);

    return NextResponse.json({
      role,
      data: {
        classes: sessions,
        assignments,
        students,
        submissions,
        unreadNotifications: unread,
      },
    });
  }

  if (role === "coordinator") {
    const [events, upcomingEvents, registrations, students] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ status: "upcoming" }),
      EventRegistration.countDocuments({ status: "registered" }),
      User.countDocuments({ role: "student" }),
    ]);

    return NextResponse.json({
      role,
      data: {
        events,
        upcomingEvents,
        registrations,
        students,
      },
    });
  }

  const [totalStudents, totalFaculty, totalCoordinators, departments, events, assignments, submissions, attendanceSessions, placements, applications, unreadLogs, unreadNotifications] =
    await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "faculty" }),
      User.countDocuments({ role: "coordinator" }),
      Department.countDocuments(),
      Event.countDocuments(),
      Assignment.countDocuments(),
      Submission.countDocuments(),
      AttendanceSession.countDocuments(),
      Placement.countDocuments(),
      Application.countDocuments(),
      ActivityLog.countDocuments(),
      Notification.countDocuments({ isRead: false }),
    ]);

  const records = await AttendanceRecord.find().select("status");
  const presentCount = records.filter((r) => r.status !== "absent").length;

  const pendingApplications = await Application.countDocuments({ status: "pending" });

  return NextResponse.json({
    role,
    data: {
      totalStudents,
      totalFaculty,
      totalCoordinators,
      departments,
      events,
      assignments,
      submissions,
      attendanceSessions,
      placements,
      applications,
      pendingApplications,
      unreadLogs,
      unreadNotifications,
      attendancePercentage:
        records.length === 0 ? 0 : Math.round((presentCount / records.length) * 100),
    },
  });
}
