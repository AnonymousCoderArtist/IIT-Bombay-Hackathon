import { Schema, model, models } from "mongoose";

const clubSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: String, trim: true },
    coordinatorId: { type: Schema.Types.ObjectId, ref: "User" },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

clubSchema.index({ name: 1 }, { unique: true });

export const Club = models.Club || model("Club", clubSchema);
