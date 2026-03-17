import FeatureSection from "./landing/FeatureSection";
import HeroSection from "./landing/HeroSection";
import LandingHeader from "./landing/LandingHeader";
import OffersSection from "./landing/OffersSection";
import { useOffers } from "../hooks/useOffers";

export default function LandingPage() {
  const { offers, isLoading, activeOfferCount } = useOffers();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-24 h-56 w-56 rounded-full bg-chart-1/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-chart-2/30 blur-3xl" />

      <LandingHeader />

      <main>
        <HeroSection
          offersCount={offers.length}
          activeOffersCount={activeOfferCount}
          isLoadingOffers={isLoading}
        />
        <FeatureSection />
        <OffersSection offers={offers} isLoading={isLoading} />
      </main>
    </div>
  );
}
