import { Schema, model, models } from "mongoose";

const attendanceRecordSchema = new Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "AttendanceSession", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      default: "present",
    },
    markedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

attendanceRecordSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

export const AttendanceRecord =
  models.AttendanceRecord || model("AttendanceRecord", attendanceRecordSchema);
