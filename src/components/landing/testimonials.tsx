"use client";

import Image from "next/image";

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
    <section id="testimonials" className="relative overflow-hidden py-24 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-end justify-end"
      >
        <Image
          src="/black-background-and-golden-waves-and-bubbles-photo.jpg"
          alt=""
          width={625}
          height={350}
          className="h-full w-full object-cover object-right opacity-20 dark:opacity-25"
        />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary">
              Voices
            </span>
            <h2 className="mt-4 text-4xl tracking-tight text-balance sm:text-5xl">
              Loved across campus
            </h2>
          </div>
          <p className="max-w-sm text-muted-foreground md:text-right">
            Students, faculty and coordinators rely on Smart Campus every day.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.name} className="flex flex-col justify-between bg-card p-8">
              <div>
                <span className="font-serif text-4xl font-light italic text-primary">&ldquo;</span>
                <blockquote className="mt-3 text-[0.95rem] leading-relaxed text-foreground/85">
                  {testimonial.quote}
                </blockquote>
              </div>
              <figcaption className="mt-8 flex items-center gap-3 border-t border-border pt-5">
                <span className="flex size-10 items-center justify-center rounded-full border border-primary/30 bg-primary/8 font-heading text-xs font-extrabold text-primary">
                  {testimonial.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
