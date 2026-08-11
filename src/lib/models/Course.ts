import { Schema, model, models } from "mongoose";

const courseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    department: { type: String, trim: true },
    credits: { type: Number, default: 0 },
    description: { type: String },
  },
  { timestamps: true }
);

export const Course = models.Course || model("Course", courseSchema);
