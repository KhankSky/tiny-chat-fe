import { SiteHeader } from "@/components/layout/site-header";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingHero } from "@/components/landing/landing-hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#09090b_45%,_#030712_100%)] text-white">
      <SiteHeader />
      <main>
        <LandingHero />
        <LandingFeatures />
      </main>
    </div>
  );
}
