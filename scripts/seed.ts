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
  Club,
  Notice,
  StudyMaterial,
  Course,
  ActivityLog,
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
    name: "Lokesh Lal",
    email: "student@smartcampus.edu",
    password: "Student@123",
    role: "student",
    department: "CS",
    semester: 5,
    rollNumber: "CS2023001",
    phone: "9876500003",
    skills: ["React", "Node.js", "MongoDB"],
    linkedin: "https://linkedin.com/in/lokeshlal",
    github: "https://github.com/lokeshlal",
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
  const adminId = createdIds["adminadmin@smartcampus.edu"];

  console.log("\n--- Seeding courses ---");
  const courseDocs = await Course.bulkWrite(
    [
      { name: "Database Management", code: "CS301", department: "CS", credits: 4 },
      { name: "Operating Systems", code: "CS302", department: "CS", credits: 4 },
      { name: "Data Structures", code: "CS201", department: "CS", credits: 4 },
      { name: "Web Development", code: "CS401", department: "CS", credits: 3 },
      { name: "Digital Electronics", code: "EC201", department: "EC", credits: 4 },
    ].map((c) => ({
      updateOne: {
        filter: { code: c.code },
        update: { $setOnInsert: c },
        upsert: true,
      },
    }))
  );
  console.log(`${Object.keys(courseDocs.upsertedIds ?? {}).length || courseDocs.modifiedCount + courseDocs.upsertedCount} courses ready`);

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

  console.log("\n--- Seeding study materials ---");
  await StudyMaterial.bulkWrite(
    [
      {
        title: "DBMS - Normalization Notes",
        description: "1NF se BCNF tak complete notes with examples.",
        subject: "DBMS",
        course: "CS301",
        fileUrl: "/uploads/files/dbms-normalization-notes.pdf",
        fileType: "application/pdf",
        facultyId,
        department: "CS",
        semester: 5,
      },
      {
        title: "OS - Process Scheduling Slides",
        description: "Round robin, priority aur multilevel queues.",
        subject: "Operating Systems",
        course: "CS302",
        fileUrl: "/uploads/files/os-scheduling-slides.pdf",
        fileType: "application/pdf",
        facultyId,
        department: "CS",
        semester: 5,
      },
      {
        title: "Web Dev - React Fundamentals",
        description: "Components, props, state aur hooks ka quick reference.",
        subject: "Web Development",
        course: "CS401",
        fileUrl: "/uploads/files/react-fundamentals.pdf",
        fileType: "application/pdf",
        facultyId,
        department: "CS",
        semester: 5,
      },
    ].map((m) => ({
      updateOne: {
        filter: { title: m.title },
        update: { $setOnInsert: m },
        upsert: true,
      },
    }))
  );
  console.log("3 study materials ready");

  console.log("\n--- Seeding attendance (6 months history) ---");
  function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
      a += 0x6d2b79f5;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rand = mulberry32(20260813);
  const sessionTemplates = [
    { subject: "DBMS", code: "CS301", type: "theory" },
    { subject: "Operating Systems", code: "CS302", type: "theory" },
    { subject: "Data Structures", code: "CS201", type: "lab" },
    { subject: "Web Development", code: "CS401", type: "lab" },
  ];
  const monthlyRate = [88, 94, 82, 91, 86, 96];

  const today = new Date();
  let sessionCount = 0;
  let recordCount = 0;

  for (let m = 5; m >= 0; m--) {
    const rate = monthlyRate[m];
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() - m + 1, 0).getDate();

    for (let s = 0; s < 4; s++) {
      const day = Math.min(1 + s * 6 + Math.floor(rand() * 2), daysInMonth);
      const date = new Date(firstOfMonth);
      date.setDate(day);
      date.setHours(9 + s * 2, Math.floor(rand() * 45), 0, 0);
      if (date.getTime() > today.getTime()) continue;

      const template = sessionTemplates[(m + s) % sessionTemplates.length];
      const session = await AttendanceSession.create({
        subject: template.subject,
        facultyId,
        department: "CS",
        semester: 5,
        date,
        sessionType: template.type,
        status: "closed",
      });
      sessionCount++;

      for (const studentId of studentIds) {
        const present = rand() * 100 < rate;
        const markedAt = new Date(date.getTime() + Math.floor(rand() * 3600 * 1000));
        await AttendanceRecord.create({
          sessionId: session._id,
          studentId,
          status: present ? "present" : "absent",
          markedAt,
        });
        recordCount++;
      }
    }
  }
  console.log(`${sessionCount} sessions, ${recordCount} attendance records over 6 months`);

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

  console.log("\n--- Seeding clubs ---");
  await Club.updateOne(
    { name: "Coding Club" },
    {
      $set: {
        description: "DSA, competitive programming aur project building ke liye.",
        category: "Technical",
        coordinatorId: coordinatorId,
        members: studentIds.slice(0, 2),
      },
    },
    { upsert: true }
  );
  await Club.updateOne(
    { name: "Robotics Society" },
    {
      $set: {
        description: "Robots banao, competitions khelo, electronics seekho.",
        category: "Technical",
        coordinatorId: coordinatorId,
        members: studentIds.slice(0, 1),
      },
    },
    { upsert: true }
  );
  await Club.updateOne(
    { name: "Dance & Music Club" },
    {
      $set: {
        description: "Cultural nights aur inter-college fests ka hissa bano.",
        category: "Cultural",
        coordinatorId: coordinatorId,
        members: [],
      },
    },
    { upsert: true }
  );
  console.log("3 clubs created");

  console.log("\n--- Seeding notices ---");
  await Notice.create([
    {
      title: "Mid-sem exam schedule out",
      body: "Mid-semester exams start from 1st of next month. Detailed timetable on the notice board.",
      category: "Exam",
      authorId: coordinatorId,
      pinned: true,
    },
    {
      title: "Tech Fest registrations open",
      body: "Tech Fest 2026 registrations are open. Hurry, seats are limited!",
      category: "Event",
      authorId: facultyId,
    },
  ]);
  console.log("2 notices created");

  console.log("\n--- Seeding activity logs ---");
  const existingLogs = await ActivityLog.countDocuments();
  if (existingLogs === 0) {
    const logSamples = [
      { userId: adminId, action: "login", targetResource: "Admin Portal", details: { method: "email" } },
      { userId: adminId, action: "update_user", targetResource: "Admin Portal", details: { status: "active" } },
      { userId: facultyId, action: "create_assignment", targetResource: "DBMS Assignment 3", details: { deadline: "5 days" } },
      { userId: facultyId, action: "create_attendance_session", targetResource: "DBMS · Theory", details: { subject: "DBMS" } },
      { userId: coordinatorId, action: "create_event", targetResource: "Tech Talk 2026", details: { venue: "Main Auditorium" } },
      { userId: coordinatorId, action: "create_placement", targetResource: "TCS · SDE", details: { ctc: "8 LPA" } },
      { userId: coordinatorId, action: "create_notice", targetResource: "Mid-term exam schedule", details: { category: "exam" } },
      { userId: adminId, action: "login", targetResource: "Admin Portal", details: { method: "email" } },
    ];
    const now = Date.now();
    for (let i = 0; i < logSamples.length; i++) {
      await ActivityLog.create({
        ...logSamples[i],
        ipAddress: "127.0.0.1",
        createdAt: new Date(now - i * 3600 * 1000),
      });
    }
    console.log(`${logSamples.length} activity logs created`);
  } else {
    console.log("activity logs already exist, skipping");
  }

  await mongoose.disconnect();
  console.log("\nDone! Login with the test credentials above.\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
