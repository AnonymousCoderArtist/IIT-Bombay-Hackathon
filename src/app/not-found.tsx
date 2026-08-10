import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Yeh page exist nahi karta ya move kar diya gaya hai. Home se wapas shuru karo.
      </p>
      <Button render={<Link href="/dashboard" />}>Go to dashboard</Button>
    </div>
  );
}
