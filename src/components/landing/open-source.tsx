"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import GithubIcon from "@/components/ui/github-icon";
import { ScanFace, FileCode2, TerminalSquare } from "lucide-react";

const commands = [
  { label: "1. Repo clone karo", cmd: "git clone https://github.com/AnonymousCoderArtist/IIT-Bombay-Hackathon.git && cd IIT-Bombay-Hackathon" },
  { label: "2. Python AI service start karo (face + RAG backend)", cmd: "cd services/ai && uv sync && FACE_LIVENESS_DISABLED=1 uv run uvicorn app.main:app --port 8000" },
  { label: "3. Ek face enroll karo (student account pe)", cmd: "npx tsx --env-file-if-exists=.env scripts/face-setup.ts" },
  { label: "4. Student login → /attendance/scan → Face check-in", cmd: "token paste karo → photo upload ya camera capture" },
];

export function OpenSource() {
  return (
    <section id="open-source" className="relative overflow-hidden py-24 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <Image
          src="/black-background-and-golden-waves-and-bubbles-photo.jpg"
          alt=""
          width={625}
          height={350}
          className="h-full w-full object-cover object-center opacity-40 dark:opacity-45"
        />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <span className="text-[0.7rem] font-medium tracking-[0.28em] uppercase text-primary">
              Open Source
            </span>
            <h2 className="mt-4 font-serif text-5xl tracking-tight text-balance sm:text-6xl">
              AI Face Attendance, alag Python service se
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
              AI face attendance <span className="text-foreground">UniFace</span> (SCRFD detection +
              ArcFace embeddings) aur <span className="text-foreground">MiniFASNet liveness</span> se
              chalti hai — printed photo ya phone screen wali fake image reject hoti hai. Ye service
              locally chalti hai aur repo ke saath ship hoti hai.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                "Real-time face check-in, camera ya photo upload",
                "Anti-spoofing liveness check (PS requirement)",
                "Models repo me bundled — naye setup pe koi download/train nahi",
                "RAG chatbot + lecture summary + placement matching bhi isi service me",
                "FastAPI Swagger docs: /docs",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="https://github.com/AnonymousCoderArtist/IIT-Bombay-Hackathon"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-primary/40 bg-primary/8 px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/15"
            >
              <GithubIcon size={16} />
              GitHub pe source dekho
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-border bg-surface/50 p-6 sm:p-8"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/8 text-primary">
                <TerminalSquare size={18} />
              </span>
              <div>
                <h3 className="font-medium">Local test flow</h3>
                <p className="text-xs text-muted-foreground">Face attendance ko apni machine pe 2 minute me test karo</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {commands.map((step) => (
                <div key={step.label}>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <ScanFace className="size-4 text-primary" />
                    {step.label}
                  </p>
                  <pre className="mt-2 overflow-x-auto rounded-xl border border-border bg-background/60 p-3.5 text-xs leading-relaxed text-foreground/80">
                    <code>{step.cmd}</code>
                  </pre>
                </div>
              ))}
            </div>
            <p className="mt-6 flex items-start gap-2.5 rounded-xl border border-border bg-background/40 p-3.5 text-xs leading-relaxed text-muted-foreground">
              <FileCode2 className="mt-0.5 size-4 shrink-0 text-primary" />
              Poore instructions README me hain. Liveness normally ON hai; static photo se test ke liye
              <code className="mx-1 rounded bg-primary/10 px-1.5 py-0.5 text-primary">FACE_LIVENESS_DISABLED=1</code>
              use karo. Sample test image repo me hai.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}