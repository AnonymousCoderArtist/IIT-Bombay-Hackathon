import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function saveBase64Image(dataUrl: string, folder = "images"): Promise<string> {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
  if (!match) {
    throw new Error("Invalid image data");
  }

  const mime = match[1];
  const ext = mime.includes("png") ? ".png" : mime.includes("webp") ? ".webp" : mime.includes("gif") ? ".gif" : ".jpg";
  const safeName = `${crypto.randomBytes(12).toString("hex")}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeName), Buffer.from(match[2], "base64"));

  return `/uploads/${folder}/${safeName}`;
}
