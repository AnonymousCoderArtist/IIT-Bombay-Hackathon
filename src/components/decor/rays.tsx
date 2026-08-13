"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function Rays({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute -right-10 -top-12 h-[62%] w-[55%] opacity-35 dark:opacity-60">
        <Image
          src="/rays-purple.svg"
          alt=""
          fill
          className="object-contain mix-blend-plus-lighter [filter:hue-rotate(115deg)_saturate(1.3)]"
        />
      </div>
      <div className="absolute right-[6%] top-[-5%] hidden w-[20%] -rotate-[11deg] md:block">
        <Image
          src="/vector-2869.svg"
          alt=""
          width={214}
          height={296}
          className="h-auto w-full mix-blend-plus-lighter [filter:hue-rotate(115deg)_saturate(1.3)]"
        />
      </div>
      <div className="absolute right-[1%] top-[-13%] hidden md:block">
        <Image
          src="/rays-ellipse.svg"
          alt=""
          width={200}
          height={300}
          className="h-[19rem] w-[13rem] rotate-[40deg] object-contain mix-blend-plus-lighter [filter:hue-rotate(115deg)_saturate(1.3)]"
        />
      </div>
      <Image
        src="/glow-circle-purple.png"
        alt=""
        width={1280}
        height={720}
        className="absolute -right-1/4 -top-1/3 h-[130%] w-auto object-cover opacity-20 blur-2xl dark:opacity-30 [filter:hue-rotate(115deg)_saturate(1.3)]"
      />
    </div>
  );
}
