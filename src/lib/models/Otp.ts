import { Schema, model, models } from "mongoose";

const otpSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    code: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["verify_email", "reset_password"],
      required: true,
    },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

otpSchema.index({ email: 1, purpose: 1 });

export const Otp = models.Otp || model("Otp", otpSchema);
