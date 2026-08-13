"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Lokesh Lal",
    role: "B.Tech, Computer Science",
    initials: "LL",
    quote:
      "Attendance aur assignment sab ek jagah. Ab mujhe kisi bhi deadline ka miss hone ka dar nahi.",
  },
  {
    name: "Rahul Verma",
    role: "Faculty, Mathematics",
    initials: "RV",
    quote:
      "Session banake attendance mark karna ab 30 seconds ka kaam hai. Submissions review karna bhi aasaan.",
  },
  {
    name: "Ananya Iyer",
    role: "Placement Coordinator",
    initials: "AI",
    quote:
      "Placement notices aur applications ka poora flow transparent hai. Students ko CTC aur eligibility sab clear dikhta hai.",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="border-y py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary">
            Voices
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Loved across campus
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Students, faculty and coordinators rely on Smart Campus every day.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.figure
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col justify-between bg-surface p-7"
            >
              <div>
                <span className="flex size-9 items-center justify-center border border-primary/40 text-primary">
                  <Quote className="size-4" />
                </span>
                <blockquote className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </div>
              <figcaption className="mt-7 flex items-center gap-3 border-t border-border pt-5">
                <span className="flex size-9 items-center justify-center bg-primary text-xs font-semibold text-primary-foreground">
                  {testimonial.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
