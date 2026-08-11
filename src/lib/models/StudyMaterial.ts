import { Schema, model, models } from "mongoose";

const studyMaterialSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    subject: { type: String, trim: true },
    course: { type: String },
    fileUrl: { type: String, required: true },
    fileType: { type: String },
    facultyId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: String },
    semester: { type: Number },
  },
  { timestamps: true }
);

export const StudyMaterial = models.StudyMaterial || model("StudyMaterial", studyMaterialSchema);
