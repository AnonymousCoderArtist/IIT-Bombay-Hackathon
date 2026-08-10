"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "B.Tech, Computer Science",
    quote:
      "Attendance aur assignment sab ek jagah. Ab mujhe kisi bhi deadline ka miss hone ka dar nahi.",
  },
  {
    name: "Rahul Verma",
    role: "Faculty, Mathematics",
    quote:
      "Session banake attendance mark karna ab 30 seconds ka kaam hai. Submissions review karna bhi aasaan.",
  },
  {
    name: "Ananya Iyer",
    role: "Placement Coordinator",
    quote:
      "Placement notices aur applications ka poora flow transparent hai. Students ko CTC aur eligibility sab clear dikhta hai.",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="border-t py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved across campus
          </h2>
          <p className="mt-4 text-muted-foreground">
            Students, faculty and coordinators rely on Smart Campus every day.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.figure
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col justify-between rounded-xl border bg-card p-6"
            >
              <div>
                <Quote className="size-6 text-primary" />
                <blockquote className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </div>
              <figcaption className="mt-6">
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
