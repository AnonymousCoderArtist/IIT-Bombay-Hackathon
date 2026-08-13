import { dbConnect } from "../src/lib/db";
import { User, AttendanceSession } from "../src/lib/models";
import { createCheckInToken } from "../src/lib/qr-attendance";

async function main() {
  await dbConnect();

  const student = await User.findOne({ email: "student@smartcampus.edu" });
  if (!student) {
    console.log("STUDENT_NOT_FOUND");
    return;
  }

  const faculty =
    (await User.findOne({ role: "faculty" })) ??
    (await User.findOne({ role: "admin" })) ??
    (await User.findOne({}));

  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  let session = await AttendanceSession.findOne({
    date: { $gte: start, $lt: end },
    status: "active",
  });

  if (!session) {
    session = await AttendanceSession.create({
      subject: "Face Attendance Test",
      facultyId: faculty?._id,
      department: student.department ?? "CSE",
      semester: student.semester ?? 5,
      date: today,
      sessionType: "theory",
      status: "active",
    });
  }

  const token = createCheckInToken(session._id.toString(), 30);

  console.log(JSON.stringify({ user_id: student._id.toString(), name: student.name, email: student.email, session_id: session._id.toString(), subject: session.subject, token }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
