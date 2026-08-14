"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import DownChevronIcon from "@/components/ui/down-chevron";

const faqs = [
  {
    question: "Kaun-kaun use kar sakta hai?",
    answer:
      "Students, faculty, coordinators aur admins. Har role ka apna dashboard aur permissions hain.",
  },
  {
    question: "Kya attendance mark karna aasaan hai?",
    answer:
      "Haan. Faculty ek session bana ke students ko present/absent mark karta hai. Students apna percentage subject-wise dekh sakte hain.",
  },
  {
    question: "Placement applications kaise submit hote hain?",
    answer:
      "Company listings mein eligibility aur CTC clearly likhi hoti hai. Students ek click mein apply karte hain aur application status track kar sakte hain.",
  },
  {
    question: "Kya events ke liye ticket milta hai?",
    answer:
      "Haan, registration ke baad ek QR pass generate hota hai jise entry par scan kiya ja sakta hai.",
  },
  {
    question: "Kya ye secure hai?",
    answer:
      "Passwords bcrypt se hashed hote hain, Google OAuth supported hai, saare routes role-based access control se protected hain.",
  },
];

export function Faq() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative overflow-hidden py-24 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <Image
          src="/golden-background.jpeg"
          alt=""
          width={640}
          height={359}
          className="h-full w-full object-cover opacity-25 dark:opacity-30"
        />
      </div>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-[0.7rem] font-medium tracking-[0.28em] uppercase text-primary">
            FAQ
          </span>
          <h2 className="mt-4 font-serif text-5xl tracking-tight sm:text-6xl">
            {t("faq.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("faq.subtitle")}</p>
        </div>

        <div className="mt-12 border-t border-border/60">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-border/60"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left font-medium"
                  aria-expanded={isOpen}
                >
                  <span className={isOpen ? "text-primary" : ""}>{faq.question}</span>
                  <DownChevronIcon
                    size={16}
                    className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <p className="pb-6 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
