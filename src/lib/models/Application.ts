import { Schema, model, models } from "mongoose";

const applicationSchema = new Schema(
  {
    placementId: { type: Schema.Types.ObjectId, ref: "Placement", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resumeUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "shortlisted", "rejected", "selected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

applicationSchema.index({ placementId: 1, studentId: 1 }, { unique: true });

export const Application = models.Application || model("Application", applicationSchema);
