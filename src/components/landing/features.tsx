"use client";

import { motion } from "framer-motion";
import {
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  Briefcase,
  Users,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Role-based dashboards",
    description:
      "Students, faculty, coordinators and admins each get a tailored dashboard with exactly what they need.",
  },
  {
    icon: CalendarCheck,
    title: "Attendance tracking",
    description:
      "Faculty can create sessions and mark attendance in seconds. Students get live subject-wise analytics.",
  },
  {
    icon: ClipboardList,
    title: "Assignments & grading",
    description:
      "Publish assignments with deadlines and rubrics, accept submissions and grade with feedback.",
  },
  {
    icon: Megaphone,
    title: "Events with QR passes",
    description:
      "Organize campus events, manage seat limits and hand out scannable QR entry passes to registered students.",
  },
  {
    icon: Briefcase,
    title: "Placement hub",
    description:
      "List openings with eligibility and CTC, let students apply with one click and track every application.",
  },
  {
    icon: Users,
    title: "Clubs & notifications",
    description:
      "Real-time notifications for deadlines, attendance, events and placements keep everyone in sync.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything your campus needs, in one place
          </h2>
          <p className="mt-4 text-muted-foreground">
            Stop juggling WhatsApp groups and spreadsheets. Smart Campus brings every workflow
            together on a single, secure platform.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
