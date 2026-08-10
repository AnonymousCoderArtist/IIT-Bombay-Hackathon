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

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const [monthlyAgg, deptAgg, applicationAgg, topEvents] = await Promise.all([
    AttendanceRecord.aggregate([
      { $match: { markedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$markedAt" } },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $ne: ["$status", "absent"] }, 1, 0] } },
        },
      },
    ]),
    AttendanceRecord.aggregate([
      {
        $lookup: {
          from: "attendancesessions",
          localField: "sessionId",
          foreignField: "_id",
          as: "session",
        },
      },
      { $unwind: "$session" },
      { $match: { "session.department": { $ne: null } } },
      {
        $group: {
          _id: "$session.department",
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $ne: ["$status", "absent"] }, 1, 0] } },
        },
      },
    ]),
    Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Event.find().sort({ registeredCount: -1 }).limit(5).select("title registeredCount").lean(),
  ]);

  const monthMap = new Map(monthlyAgg.map((m) => [m._id as string, m]));
  const attendanceTrend: { month: string; percentage: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(sixMonthsAgo);
    d.setMonth(d.getMonth() + i);
    const key = d.toISOString().slice(0, 7);
    const bucket = monthMap.get(key);
    const total = bucket?.total ?? 0;
    attendanceTrend.push({
      month: d.toLocaleDateString("en-IN", { month: "short" }),
      percentage: total === 0 ? 0 : Math.round(((bucket.present ?? 0) / total) * 100),
    });
  }

  const departmentPerformance = deptAgg.map((d) => ({
    name: d._id as string,
    percentage:
      d.total === 0 ? 0 : Math.round(((d.present ?? 0) / d.total) * 100),
  }));

  const placementStats = applicationAgg.map((a) => ({
    name: a._id as string,
    value: a.count,
  }));

  const eventParticipation = topEvents.map((e) => ({
    name: (e.title as string).length > 18 ? (e.title as string).slice(0, 18) + "…" : (e.title as string),
    value: e.registeredCount,
  }));

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
      attendanceTrend,
      departmentPerformance,
      placementStats,
      eventParticipation,
    },
  });
}
