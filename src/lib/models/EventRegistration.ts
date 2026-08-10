import { Schema, model, models } from "mongoose";

const eventRegistrationSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ticketId: { type: String, unique: true },
    status: {
      type: String,
      enum: ["registered", "cancelled", "attended"],
      default: "registered",
    },
    checkIn: { type: Boolean, default: false },
  },
  { timestamps: true }
);

eventRegistrationSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

export const EventRegistration =
  models.EventRegistration || model("EventRegistration", eventRegistrationSchema);
