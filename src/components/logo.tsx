import Image from "next/image";
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
        <Image
          src="/logo-only-dark.png"
          alt="Smart Campus"
          width={422}
          height={422}
          priority
          className="h-full w-full object-contain"
        />
      </span>
      <span
        className={cn(
          "hidden h-9 w-9 shrink-0 items-center justify-center overflow-hidden dark:flex",
          className
        )}
      >
        <Image
          src="/logo-only-white.png"
          alt="Smart Campus"
          width={402}
          height={402}
          priority
          className="h-full w-full object-contain"
        />
      </span>
    </>
  );
}