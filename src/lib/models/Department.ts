import { Schema, model, models } from "mongoose";

const departmentSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const Department = models.Department || model("Department", departmentSchema);
