import { Schema, model, models } from "mongoose";

const attendanceSessionSchema = new Schema(
  {
    subject: { type: String, required: true, trim: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: String },
    semester: { type: Number },
    date: { type: Date, required: true },
    sessionType: { type: String, enum: ["theory", "lab", "tutorial"], default: "theory" },
    status: { type: String, enum: ["active", "closed"], default: "active" },
  },
  { timestamps: true }
);

export const AttendanceSession =
  models.AttendanceSession || model("AttendanceSession", attendanceSessionSchema);
