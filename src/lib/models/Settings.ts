import { Schema, model, models } from "mongoose";

const settingsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    emailOptIn: { type: Boolean, default: true },
    language: { type: String, default: "en" },
    publicProfile: { type: Boolean, default: true },
    ai: {
      type: new Schema(
        {
          provider: { type: String, enum: ["openai", "gemini"], default: "openai" },
          baseUrl: { type: String, trim: true, default: "" },
          apiKey: { type: String, default: "" },
          model: { type: String, trim: true, default: "" },
        },
        { _id: false }
      ),
      default: null,
    },
    notificationPrefs: {
      assignment: { type: Boolean, default: true },
      attendance: { type: Boolean, default: true },
      event: { type: Boolean, default: true },
      placement: { type: Boolean, default: true },
    },
    pushSubscription: {
      type: new Schema(
        {
          endpoint: { type: String, required: true },
          keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true },
          },
        },
        { _id: false }
      ),
      default: null,
    },
  },
  { timestamps: true }
);

export const Settings = models.Settings || model("Settings", settingsSchema);
