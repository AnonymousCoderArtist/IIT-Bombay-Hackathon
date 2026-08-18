import "dotenv/config";
import mongoose from "mongoose";
import { ActivityLog, User } from "../src/lib/models";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);

  const admin = await User.findOne({ email: "admin@smartcampus.edu" });
  const coordinator = await User.findOne({ role: "coordinator" });
  const students = await User.find({ role: "student" }).limit(3);
  const faculty = await User.findOne({ role: "faculty" });
  if (!admin || !faculty || !coordinator || students.length === 0) {
    console.log("REQUIRED_USERS_MISSING");
    return;
  }

  const samples = [
    { userId: admin._id, action: "login", targetResource: "Admin Portal", details: { method: "email" } },
    { userId: admin._id, action: "update_user", targetResource: students[0]._id.toString(), details: { from: "student", to: "student" } },
    { userId: faculty._id, action: "create_assignment", targetResource: "DBMS Assignment 3", details: { deadline: "5 days" } },
    { userId: faculty._id, action: "create_attendance_session", targetResource: "DBMS · Theory", details: { subject: "DBMS" } },
    { userId: admin._id, action: "update_user", targetResource: students[1]._id.toString(), details: { status: "active" } },
    { userId: students[2]._id, action: "register_event", targetResource: "Tech Talk 2026", details: { role: "student" } },
    { userId: faculty._id, action: "create_notice", targetResource: "Mid-term exam schedule", details: { category: "exam" } },
    { userId: coordinator._id, action: "create_event", targetResource: "Hackathon 4.0", details: { venue: "Main Auditorium" } },
    { userId: admin._id, action: "login", targetResource: "Admin Portal", details: { method: "email" } },
    { userId: coordinator._id, action: "create_placement", targetResource: "TCS · SDE", details: { ctc: "8 LPA" } },
  ];

  const existing = await ActivityLog.countDocuments();
  if (existing > 0) {
    console.log("LOGS_EXIST", existing);
    return;
  }

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    await ActivityLog.create({
      ...s,
      ipAddress: "127.0.0.1",
      createdAt: new Date(Date.now() - i * 3600 * 1000),
    });
  }

  console.log("SEEDED", samples.length, "logs");
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });