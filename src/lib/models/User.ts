import { Schema, model, models, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ["student", "faculty", "coordinator", "admin"],
      default: "student",
    },
    image: { type: String },
    phone: { type: String },
    rollNumber: { type: String },
    department: { type: String },
    semester: { type: Number },
    skills: { type: [String], default: [] },
    linkedin: { type: String },
    github: { type: String },
    resumeUrl: { type: String },
    bio: { type: String },
    emailVerified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "pending", "blocked"], default: "active" },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export type UserType = InferSchemaType<typeof userSchema> & { _id: string };

export const User = models.User || model("User", userSchema);
