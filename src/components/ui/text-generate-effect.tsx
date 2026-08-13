"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  textClassName,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  textClassName?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();
  const reduceMotion = useReducedMotion();
  const wordsArray = words.split(" ");

  useEffect(() => {
    if (reduceMotion) return;
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration ? duration : 1,
        delay: stagger(0.2),
      },
    );
  }, [animate, duration, filter, scope, reduceMotion]);

  return (
    <div className={cn("font-bold", className)}>
      <div className="mt-4">
        <div
          className={cn(
            "text-2xl leading-snug tracking-wide text-black dark:text-white",
            textClassName,
          )}
        >
          {wordsArray.map((word, idx) => (
            <motion.span
              key={word + idx}
              className={reduceMotion ? "" : "opacity-0"}
              style={{
                filter: filter ? "blur(10px)" : "none",
              }}
            >
              {word}{" "}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
};
