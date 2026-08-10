import { Schema, model, models } from "mongoose";

const placementSchema = new Schema(
  {
    company: { type: String, required: true, trim: true },
    logo: { type: String },
    jobRole: { type: String, required: true },
    description: { type: String },
    eligibility: { type: String },
    ctc: { type: String },
    location: { type: String },
    deadline: { type: Date, required: true },
    link: { type: String },
    status: { type: String, enum: ["active", "closed", "draft"], default: "active" },
  },
  { timestamps: true }
);

export const Placement = models.Placement || model("Placement", placementSchema);
