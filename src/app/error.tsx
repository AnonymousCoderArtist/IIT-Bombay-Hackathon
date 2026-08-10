"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <p className="text-6xl font-bold text-destructive">Oops</p>
      <h1 className="text-xl font-semibold">Kuch galat ho gaya</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Koi unexpected error aaya. Dobara try karo ya thodi der baad wapas aao.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}
