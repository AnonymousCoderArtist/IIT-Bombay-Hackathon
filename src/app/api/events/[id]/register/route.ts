import { NextResponse } from "next/server";
import crypto from "crypto";
import QRCode from "qrcode";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Event, EventRegistration, User } from "@/lib/models";
import { jsonError } from "@/lib/api-helpers";
import { sendMail } from "@/lib/mailer";

async function getEventWithRegistration(eventId: string, userId: string) {
  await dbConnect();

  const event = await Event.findById(eventId).populate("organizerId", "name").lean();

  if (!event) {
    return { error: jsonError("Event not found", 404) };
  }

  const registration = await EventRegistration.findOne({
    eventId,
    studentId: userId,
    status: "registered",
  }).lean();

  return { event, registration };
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  const { id } = await params;

  const result = await getEventWithRegistration(id, session.user.id);

  if ("error" in result) {
    return result.error;
  }

  return NextResponse.json(result);
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  if (session.user.role !== "student") {
    return jsonError("Only students can register for events", 403);
  }

  const { id } = await params;

  const result = await getEventWithRegistration(id, session.user.id);

  if ("error" in result) {
    return result.error;
  }

  const { event, registration } = result as {
    event: { _id: string; seats: number; registeredCount: number; registrationDeadline: Date; title: string };
    registration: { _id: string } | null;
  };

  if (registration) {
    return jsonError("You are already registered for this event", 400);
  }

  if (new Date() > new Date(event.registrationDeadline)) {
    return jsonError("Registration for this event has closed", 400);
  }

  if (event.seats > 0 && event.registeredCount >= event.seats) {
    return jsonError("Event is full", 400);
  }

  const user = await User.findById(session.user.id).select("name email");

  const ticketId = `TKT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const qrPayload = JSON.stringify({
    ticket: ticketId,
    eventId: id,
    attendee: user?.email,
  });

  const qrDataUrl = await QRCode.toDataURL(qrPayload);

  const created = await EventRegistration.create({
    eventId: id,
    studentId: session.user.id,
    ticketId,
    status: "registered",
  });

  await Event.updateOne({ _id: id }, { $inc: { registeredCount: 1 } });

  const eventTitle = (event as { title?: string }).title ?? "event";
  if (user?.email) {
    await sendMail({
      to: user.email,
      subject: `Registered: ${eventTitle}`,
      text: `Hi ${user.name ?? "Student"},\n\nAap ${eventTitle} ke liye register ho gaye ho.\n\nTicket ID: ${ticketId}\n\nQR pass apne dashboard me dekho.\n\n- Smart Campus`,
      html: `<p>Hi ${user.name ?? "Student"},</p><p>Aap <strong>${eventTitle}</strong> ke liye register ho gaye ho.</p><p><strong>Ticket ID:</strong> ${ticketId}</p><p>QR pass apne dashboard me dekho.</p><p>- Smart Campus</p>`,
    });
  }

  return NextResponse.json(
    {
      registration: {
        _id: created._id,
        ticketId,
        eventId: id,
        status: "registered",
      },
      qrDataUrl,
    },
    { status: 201 }
  );
}
