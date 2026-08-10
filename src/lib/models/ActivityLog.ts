import { Schema, model, models } from "mongoose";

const activityLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    targetResource: { type: String },
    ipAddress: { type: String },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });

export const ActivityLog = models.ActivityLog || model("ActivityLog", activityLogSchema);
