import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <>
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden dark:hidden",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-only-dark.png"
          alt="Smart Campus"
          loading="eager"
          className="h-full w-full object-contain"
        />
      </span>
      <span
        className={cn(
          "hidden h-9 w-9 shrink-0 items-center justify-center overflow-hidden dark:flex",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-only-white.png"
          alt="Smart Campus"
          loading="eager"
          className="h-full w-full object-contain brightness-125 contrast-110"
        />
      </span>
    </>
  );
}