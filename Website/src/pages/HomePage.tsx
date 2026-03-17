import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeatureSection } from "@/components/sections/FeatureSection";
// import { StatsSection } from "@/components/sections/StatsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { CTASection } from "@/components/sections/CTASection";
import { useOffers } from "@/hooks/useOffers";

export default function HomePage() {
  const { offers, isLoading, activeOfferCount } = useOffers();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <HeroSection
          offers={offers}
          activeOfferCount={activeOfferCount}
          isLoadingOffers={isLoading}
        />
        {/* <StatsSection /> */}
        <FeatureSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
