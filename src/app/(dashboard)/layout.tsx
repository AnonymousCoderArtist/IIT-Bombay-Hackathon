"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { DashboardProviders } from "@/components/dashboard/session-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <DashboardProviders>
      <div className="relative flex h-dvh overflow-hidden">
        <Image
          src="/black-background-and-golden-waves-and-bubbles-photo.jpg"
          alt=""
          fill
          priority
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover opacity-25"
        />
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent)]" />
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-60 shadow-elevated">
              <Sidebar mobile />
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-md bg-card text-muted-foreground ring-1 ring-border"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}

        <div className="relative z-10 flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-7xl flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </DashboardProviders>
  );
}
