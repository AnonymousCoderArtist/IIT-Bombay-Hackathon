import { Schema, model, models } from "mongoose";

const settingsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    emailOptIn: { type: Boolean, default: true },
    language: { type: String, default: "en" },
    notificationPrefs: {
      assignment: { type: Boolean, default: true },
      attendance: { type: Boolean, default: true },
      event: { type: Boolean, default: true },
      placement: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const Settings = models.Settings || model("Settings", settingsSchema);
