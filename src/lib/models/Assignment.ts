import { Schema, model, models } from "mongoose";

const assignmentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    subject: { type: String, trim: true },
    course: { type: String },
    facultyId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: String },
    semester: { type: Number },
    deadline: { type: Date, required: true },
    attachments: { type: [String], default: [] },
    rubric: { type: String },
  },
  { timestamps: true }
);

export const Assignment = models.Assignment || model("Assignment", assignmentSchema);
