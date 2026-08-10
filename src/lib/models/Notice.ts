import { Schema, model, models } from "mongoose";

const noticeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    category: { type: String, trim: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

noticeSchema.index({ createdAt: -1 });

export const Notice = models.Notice || model("Notice", noticeSchema);
