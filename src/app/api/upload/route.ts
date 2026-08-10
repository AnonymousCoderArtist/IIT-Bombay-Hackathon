import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { auth } from "@/auth";
import { jsonError } from "@/lib/api-helpers";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_FILES = [
  ...ALLOWED_IMAGES,
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("No file provided", 400);
  }

  if (file.size > MAX_SIZE) {
    return jsonError("File exceeds the 10MB limit", 400);
  }

  const isImage = formData.get("kind") === "image";

  if (isImage && !ALLOWED_IMAGES.includes(file.type)) {
    return jsonError("Only JPEG, PNG, WebP and GIF images are allowed", 400);
  }

  if (!isImage && !ALLOWED_FILES.includes(file.type)) {
    return jsonError("File type not allowed", 400);
  }

  const ext = path.extname(file.name) || (isImage ? ".png" : ".bin");
  const safeName = `${crypto.randomBytes(12).toString("hex")}${ext}`;
  const folder = isImage ? "images" : "files";
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeName), buffer);

  const url = `/uploads/${folder}/${safeName}`;

  return NextResponse.json({ url });
}
