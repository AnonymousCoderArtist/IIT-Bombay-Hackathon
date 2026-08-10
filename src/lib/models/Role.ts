import { Schema, model, models } from "mongoose";

const roleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Role = models.Role || model("Role", roleSchema);
