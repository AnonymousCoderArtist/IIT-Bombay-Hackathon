import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegister } from "@/components/sw-register";
import "./globals.css";

const helveticaMd = localFont({
  src: "../../public/HelveticaNowDisplay-Md.woff2",
  weight: "500",
  variable: "--font-sans",
  display: "swap",
});

const helveticaXbd = localFont({
  src: "../../public/HelveticaNowDisplay-XBd.woff2",
  weight: "800",
  variable: "--font-heading",
  display: "swap",
});

const saolRegular = localFont({
  src: "../../public/SaolDisplay-Regular.woff2",
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

const saolItalic = localFont({
  src: "../../public/SaolDisplay-LightItalic.woff2",
  weight: "300",
  style: "italic",
  variable: "--font-serif-italic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Smart Campus | Campus life, one platform",
    template: "%s | Smart Campus",
  },
  description:
    "A modern platform for students, faculty and admins to manage attendance, assignments, events, placements and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${helveticaMd.variable} ${helveticaXbd.variable} ${saolRegular.variable} ${saolItalic.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="description" content="Smart Campus | Campus life, one platform" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
        <ServiceWorkerRegister />
        <Toaster position="bottom-right" richColors duration={2500} />
      </body>
    </html>
  );
}
