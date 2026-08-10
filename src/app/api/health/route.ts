import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";

export async function GET() {
  let dbStatus = "not_connected";

  try {
    await dbConnect();
    dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  } catch {
    dbStatus = "error";
  }

  return NextResponse.json({
    status: dbStatus === "connected" ? "ok" : "degraded",
    uptime: process.uptime(),
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
}
