import { Schema, model, models } from "mongoose";

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    banner: { type: String },
    venue: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    registrationDeadline: { type: Date, required: true },
    seats: { type: Number, default: 0 },
    registeredCount: { type: Number, default: 0 },
    speakers: { type: [String], default: [] },
    qrCode: { type: String },
    organizerId: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["upcoming", "ongoing", "completed", "cancelled"], default: "upcoming" },
  },
  { timestamps: true }
);

export const Event = models.Event || model("Event", eventSchema);
