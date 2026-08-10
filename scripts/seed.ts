import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { dbConnect } from "../src/lib/db";
import {
  Department,
  User,
  Event,
  Placement,
  Assignment,
  AttendanceSession,
  AttendanceRecord,
  Submission,
  Notification,
} from "../src/lib/models";

const departments = [
  { name: "Computer Science", code: "CS", description: "Computer Science & Engineering" },
  { name: "Electronics", code: "EC", description: "Electronics & Communication" },
  { name: "Mechanical", code: "ME", description: "Mechanical Engineering" },
  { name: "Civil", code: "CE", description: "Civil Engineering" },
  { name: "Electrical", code: "EE", description: "Electrical Engineering" },
];

const users = [
  {
    name: "System Admin",
    email: "admin@smartcampus.edu",
    password: "Admin@123",
    role: "admin",
  },
  {
    name: "Rohit Verma",
    email: "coordinator@smartcampus.edu",
    password: "Coord@123",
    role: "coordinator",
    department: "CS",
    phone: "9876500001",
  },
  {
    name: "Prof. Anil Sharma",
    email: "faculty@smartcampus.edu",
    password: "Faculty@123",
    role: "faculty",
    department: "CS",
    phone: "9876500002",
  },
  {
    name: "Priya Patel",
    email: "student@smartcampus.edu",
    password: "Student@123",
    role: "student",
    department: "CS",
    semester: 5,
    rollNumber: "CS2023001",
    phone: "9876500003",
    skills: ["React", "Node.js", "MongoDB"],
    linkedin: "https://linkedin.com/in/priyapatel",
    github: "https://github.com/priyapatel",
    bio: "Final year CS student, interested in full-stack development.",
  },
  {
    name: "Rahul Mehta",
    email: "rahul@smartcampus.edu",
    password: "Student@123",
    role: "student",
    department: "CS",
    semester: 5,
    rollNumber: "CS2023002",
    phone: "9876500004",
    skills: ["Python", "ML", "Django"],
  },
  {
    name: "Sneha Iyer",
    email: "sneha@smartcampus.edu",
    password: "Student@123",
    role: "student",
    department: "EC",
    semester: 3,
    rollNumber: "EC2024001",
    phone: "9876500005",
    skills: ["VLSI", "Verilog", "PCB Design"],
  },
];

const events = [
  {
    title: "Tech Fest 2026",
    description: "Annual technology festival with workshops, hackathons and tech talks.",
    venue: "Main Auditorium",
    startDate: new Date(Date.now() + 10 * 86400000),
    registrationDeadline: new Date(Date.now() + 6 * 86400000),
    seats: 200,
    speakers: ["Dr. Kavita Rao", "Mr. Arjun Nair"],
    status: "upcoming",
  },
  {
    title: "AI & ML Workshop",
    description: "Hands-on workshop covering transformers, fine-tuning and deployment.",
    venue: "Seminar Hall 3",
    startDate: new Date(Date.now() + 4 * 86400000),
    registrationDeadline: new Date(Date.now() + 2 * 86400000),
    seats: 80,
    speakers: ["Prof. Anil Sharma"],
    status: "upcoming",
  },
  {
    title: "Cultural Night",
    description: "An evening of music, dance and performances by students.",
    venue: "Open Air Theatre",
    startDate: new Date(Date.now() + 20 * 86400000),
    registrationDeadline: new Date(Date.now() + 15 * 86400000),
    seats: 500,
    speakers: [],
    status: "upcoming",
  },
];

const placements = [
  {
    company: "Google",
    jobRole: "Software Engineer",
    description: "Full-stack role in the Bengaluru office. Strong DSA skills preferred.",
    eligibility: "B.Tech CS/IT, CGPA >= 7.5",
    ctc: "36 LPA",
    location: "Bengaluru",
    deadline: new Date(Date.now() + 12 * 86400000),
    link: "https://careers.google.com",
    status: "active",
  },
  {
    company: "Microsoft",
    jobRole: "SDE Intern",
    description: "6-month internship with a pre-placement offer option.",
    eligibility: "2nd year onwards, CGPA >= 7.0",
    ctc: "Stipend 80k/month",
    location: "Hyderabad",
    deadline: new Date(Date.now() + 8 * 86400000),
    link: "https://careers.microsoft.com",
    status: "active",
  },
  {
    company: "TCS",
    jobRole: "Systems Engineer",
    description: "Entry level engineering role across multiple locations.",
    eligibility: "All branches, CGPA >= 6.0",
    ctc: "7 LPA",
    location: "Multiple",
    deadline: new Date(Date.now() + 30 * 86400000),
    link: "https://www.tcs.com/careers",
    status: "active",
  },
];

async function main() {
  await dbConnect();

  console.log("\n--- Seeding departments ---");
  for (const d of departments) {
    await Department.updateOne({ code: d.code }, { $setOnInsert: d }, { upsert: true });
  }
  console.log(`${departments.length} departments ready`);

  console.log("\n--- Seeding users ---");
  const createdIds: Record<string, string> = {};
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const doc = await User.findOneAndUpdate(
      { email: u.email },
      {
        $set: {
          name: u.name,
          passwordHash,
          role: u.role,
          department: u.department,
          semester: u.semester,
          rollNumber: u.rollNumber,
          phone: u.phone,
          skills: u.skills,
          linkedin: u.linkedin,
          github: u.github,
          bio: u.bio,
          emailVerified: true,
          status: "active",
        },
      },
      { upsert: true, new: true }
    );
    createdIds[u.role + u.email] = doc._id.toString();
    console.log(`  ${u.email} (${u.role}) - password: ${u.password}`);
  }

  const studentIds = users
    .filter((u) => u.role === "student")
    .map((u) => createdIds[u.role + u.email]);
  const facultyId = createdIds["facultyfaculty@smartcampus.edu"];
  const coordinatorId = createdIds["coordinatorcoordinator@smartcampus.edu"];

  console.log("\n--- Seeding events ---");
  const eventIds: string[] = [];
  for (const e of events) {
    const doc = await Event.create({ ...e, organizerId: coordinatorId });
    eventIds.push(doc._id.toString());
    console.log(`  ${doc.title}`);
  }

  console.log("\n--- Seeding placements ---");
  for (const p of placements) {
    const doc = await Placement.create(p);
    console.log(`  ${doc.company} - ${doc.jobRole}`);
  }

  console.log("\n--- Seeding assignments ---");
  const assignmentDocs = await Assignment.create([
    {
      title: "DBMS Assignment 1 - ER Diagrams",
      description: "Design ER diagrams for a library management system.",
      subject: "DBMS",
      course: "CS301",
      facultyId,
      department: "CS",
      semester: 5,
      deadline: new Date(Date.now() + 5 * 86400000),
      rubric: "Correctness 40%, Completeness 30%, Neatness 30%",
    },
    {
      title: "OS Lab - Producer Consumer",
      description: "Implement producer-consumer problem using semaphores in C.",
      subject: "Operating Systems",
      course: "CS302",
      facultyId,
      department: "CS",
      semester: 5,
      deadline: new Date(Date.now() + 3 * 86400000),
      rubric: "Working code 50%, Explanation 25%, Report 25%",
    },
    {
      title: "Web Dev - Portfolio Project",
      description: "Build a responsive portfolio with React and Tailwind.",
      subject: "Web Development",
      course: "CS401",
      facultyId,
      department: "CS",
      semester: 5,
      deadline: new Date(Date.now() - 2 * 86400000),
      rubric: "Design 40%, Code quality 40%, Deploy 20%",
    },
  ]);
  console.log(`${assignmentDocs.length} assignments created`);

  console.log("\n--- Seeding attendance ---");
  const sessions = await AttendanceSession.create([
    {
      subject: "DBMS",
      facultyId,
      department: "CS",
      semester: 5,
      date: new Date(Date.now() - 7 * 86400000),
      sessionType: "theory",
      status: "closed",
    },
    {
      subject: "Operating Systems",
      facultyId,
      department: "CS",
      semester: 5,
      date: new Date(Date.now() - 4 * 86400000),
      sessionType: "lab",
      status: "closed",
    },
    {
      subject: "DBMS",
      facultyId,
      department: "CS",
      semester: 5,
      date: new Date(Date.now() - 1 * 86400000),
      sessionType: "theory",
      status: "closed",
    },
  ]);

  let records = 0;
  for (const session of sessions) {
    for (let i = 0; i < studentIds.length; i++) {
      const status = (i + sessionIndex(session)) % 4 === 0 ? "absent" : "present";
      await AttendanceRecord.create({
        sessionId: session._id,
        studentId: studentIds[i],
        status,
      });
      records++;
    }
  }
  console.log(`${sessions.length} sessions, ${records} attendance records`);

  console.log("\n--- Seeding submissions ---");
  for (let i = 0; i < assignmentDocs.length; i++) {
    for (let j = 0; j < studentIds.length; j++) {
      const late = i === 2;
      await Submission.create({
        assignmentId: assignmentDocs[i]._id,
        studentId: studentIds[j],
        fileUrl: "https://example.com/solution.pdf",
        githubLink: `https://github.com/student${j}/assignment-${i + 1}`,
        notes: late ? "Submitted late, but completed." : "Done.",
        status: late ? "late" : "submitted",
        marks: late ? undefined : 85 + (i * 3 + j * 2) % 15,
        feedback: late ? undefined : "Good work, keep it up!",
        submittedAt: late ? new Date(Date.now() - 86400000) : new Date(Date.now() - 3 * 86400000),
      });
    }
  }
  console.log(`${assignmentDocs.length * studentIds.length} submissions created`);

  console.log("\n--- Seeding notifications ---");
  const studentId = studentIds[0];
  await Notification.create([
    {
      userId: studentId,
      title: "Assignment due soon",
      message: "OS Lab - Producer Consumer deadline is in 3 days.",
      type: "assignment",
      link: "/assignments",
    },
    {
      userId: studentId,
      title: "Event reminder",
      message: "AI & ML Workshop starts tomorrow. Don't forget to register.",
      type: "event",
      link: "/events",
    },
  ]);
  console.log("2 notifications created");

  await mongoose.disconnect();
  console.log("\nDone! Login with the test credentials above.\n");
}

function sessionIndex(session: { _id: unknown }) {
  return String(session._id).charCodeAt(0) % 3;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
