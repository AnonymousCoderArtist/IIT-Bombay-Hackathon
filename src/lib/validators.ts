import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  role: z.enum(["student", "faculty", "coordinator"]).default("student"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  password: z.string().min(8).max(72),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().max(20).optional().or(z.literal("")),
  rollNumber: z.string().max(20).optional().or(z.literal("")),
  department: z.string().max(80).optional().or(z.literal("")),
  semester: z.coerce.number().min(1).max(12).optional(),
  skills: z.array(z.string().max(40)).optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  resumeUrl: z.string().optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
});

export const assignmentSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  subject: z.string().max(80).optional().or(z.literal("")),
  course: z.string().max(80).optional().or(z.literal("")),
  department: z.string().max(80).optional().or(z.literal("")),
  semester: z.coerce.number().min(1).max(12).optional(),
  deadline: z.coerce.date(),
  attachments: z.array(z.string()).optional(),
  rubric: z.string().max(2000).optional().or(z.literal("")),
});

export const courseSchema = z.object({
  name: z.string().min(2).max(120),
  code: z.string().min(1).max(20),
  department: z.string().max(80).optional().or(z.literal("")),
  credits: z.coerce.number().min(0).max(20).default(0),
  description: z.string().max(500).optional().or(z.literal("")),
});

export const studyMaterialSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  subject: z.string().max(80).optional().or(z.literal("")),
  course: z.string().max(80).optional().or(z.literal("")),
  fileUrl: z.string().url(),
  fileType: z.string().max(80).optional().or(z.literal("")),
  department: z.string().max(80).optional().or(z.literal("")),
  semester: z.coerce.number().min(1).max(12).optional(),
});

export const qrCheckInSchema = z.object({
  token: z.string().min(10).max(500),
  faceImage: z.string().min(16).max(10_000_000).optional(),
});

export const chatSchema = z.object({
  question: z.string().min(2).max(2000),
});

export const faceEnrollSchema = z.object({
  image: z.string().min(16).max(10_000_000),
});

export const faceRecognizeSchema = z.object({
  image: z.string().min(16).max(10_000_000),
});

export const whatsappGroupLinkSchema = z.object({
  whatsappGroupLink: z.string().url().max(500).or(z.literal("")),
});

export const lectureNoteSchema = z.object({
  title: z.string().min(1).max(120),
  subject: z.string().max(80).optional().or(z.literal("")),
  transcript: z.string().max(50000),
  durationSec: z.coerce.number().min(0).max(86400).optional(),
  source: z.enum(["live-stt", "paste"]).optional(),
});

export const eventSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  venue: z.string().max(200).optional().or(z.literal("")),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  registrationDeadline: z.coerce.date(),
  seats: z.coerce.number().min(0).default(0),
  speakers: z.array(z.string().max(80)).optional(),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]).optional(),
});

export const placementSchema = z.object({
  company: z.string().min(2).max(120),
  jobRole: z.string().min(2).max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  eligibility: z.string().max(500).optional().or(z.literal("")),
  ctc: z.string().max(80).optional().or(z.literal("")),
  location: z.string().max(120).optional().or(z.literal("")),
  deadline: z.coerce.date(),
  link: z.string().url().optional().or(z.literal("")),
  skills: z.array(z.string().max(60)).optional(),
  status: z.enum(["active", "closed", "draft"]).optional(),
});

export const attendanceSessionSchema = z.object({
  subject: z.string().min(2).max(120),
  date: z.coerce.date(),
  department: z.string().max(80).optional().or(z.literal("")),
  semester: z.coerce.number().min(1).max(12).optional(),
  sessionType: z.enum(["theory", "lab", "tutorial"]).default("theory"),
});

export const submissionSchema = z.object({
  fileUrl: z.string().optional().or(z.literal("")),
  githubLink: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const gradeSchema = z.object({
  marks: z.coerce.number().min(0).max(100),
  feedback: z.string().max(1000).optional().or(z.literal("")),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

export const adminUserUpdateSchema = z.object({
  role: z.enum(["student", "faculty", "coordinator", "admin"]).optional(),
  status: z.enum(["active", "pending", "blocked"]).optional(),
});
