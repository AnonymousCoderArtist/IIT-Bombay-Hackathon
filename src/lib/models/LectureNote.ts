import { Schema, model, models } from "mongoose";

const lectureNoteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
    transcript: { type: String },
    summary: { type: String },
    keyPoints: [String],
    actionItems: [String],
    durationSec: { type: Number },
    source: { type: String, enum: ["live-stt", "paste"], default: "live-stt" },
  },
  { timestamps: true }
);

lectureNoteSchema.index({ userId: 1, createdAt: -1 });

export const LectureNote = models.LectureNote || model("LectureNote", lectureNoteSchema);
