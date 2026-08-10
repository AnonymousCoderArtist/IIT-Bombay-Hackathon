import { Schema, model, models } from "mongoose";

const submissionSchema = new Schema(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String },
    githubLink: { type: String },
    notes: { type: String },
    marks: { type: Number },
    feedback: { type: String },
    status: {
      type: String,
      enum: ["submitted", "late", "graded"],
      default: "submitted",
    },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date },
  },
  { timestamps: true }
);

submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const Submission = models.Submission || model("Submission", submissionSchema);
