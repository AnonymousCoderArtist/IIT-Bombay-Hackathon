import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <>
      <Image
        src="/logo-only-dark.png"
        alt="Smart Campus"
        width={422}
        height={422}
        priority
        className={cn("dark:hidden", className)}
      />
      <Image
        src="/logo-only-white.png"
        alt="Smart Campus"
        width={402}
        height={402}
        priority
        className={cn("hidden dark:block", className)}
      />
    </>
  );
}