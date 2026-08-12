"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";

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
    <section id="faq" className="border-t bg-muted/30 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("faq.title")}</h2>
          <p className="mt-4 text-muted-foreground">{t("faq.subtitle")}</p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="overflow-hidden rounded-xl border bg-card"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium"
                  aria-expanded={isOpen}
                >
                  {faq.question}
                  <ChevronDown
                    className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <p className="border-t px-5 py-4 text-sm text-muted-foreground">
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
