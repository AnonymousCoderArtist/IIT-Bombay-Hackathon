import { GlowBackdrop } from "@/components/decor/glow-backdrop";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Stats } from "@/components/landing/stats";
import { Testimonials } from "@/components/landing/testimonials";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      <GlowBackdrop className="fixed inset-0" />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Stats />
        <Testimonials />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
