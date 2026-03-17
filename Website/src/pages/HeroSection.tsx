import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Offer } from "@/types/offer";

type HeroProps = {
  offers: Offer[];
  activeOfferCount: number;
  isLoadingOffers: boolean;
};

export function HeroSection({
  offers,
  activeOfferCount,
  isLoadingOffers,
}: HeroProps) {
  // 🔢 Calculations
  const totalDiscountValue = offers.reduce(
    (sum, o) => sum + (o.discount_value || 0),
    0,
  );
  const totalOffers = offers.length;

  return (
    <section className="relative pt-32 pb-24 md:pt-48 md:pb-36 overflow-hidden bg-[#F8FAFC]">
      {/* ✅ CLEAN DOT GRID (LIKE PRICING) */}
      <div
        className="absolute inset-0 -z-10 
    bg-[radial-gradient(circle,#1E293B_1.2px,transparent_1.2px)]
    [background-size:26px_26px]"
      />

      {/* ✅ SOFT INDIGO GLOW (SUBTLE) */}
      <div className="absolute top-[-10%] right-[-5%] w-[420px] h-[420px] bg-indigo-500/10 blur-[140px] rounded-full -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[420px] h-[420px] bg-slate-900/5 blur-[160px] rounded-full -z-10" />
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          {/* LEFT CONTENT */}
          <div className="lg:w-1/2 text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-sm font-medium shadow-sm text-[#1E293B]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6366F1] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6366F1]"></span>
              </span>
              AI-powered analytics
            </div>

            {/* Live Indicator */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-[#64748B]">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live data updating
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
              <span className="block text-[#6366F1]">Supercharge your</span>
              <span className="block text-[#1E293B]">
                {isLoadingOffers
                  ? "Loading..."
                  : `${activeOfferCount}+ Active Deals`}
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-lg md:text-xl text-[#475569] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {isLoadingOffers
                ? "Fetching real-time insights..."
                : `Currently managing ${offers.length} offers with live analytics.`}
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/signup">
                <Button className="group px-8 h-12 rounded-full text-base bg-[#1E293B] text-white hover:bg-[#020617] shadow-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <Link to="/features">
                <Button
                  variant="outline"
                  className="px-8 h-12 rounded-full bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B]"
                >
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Trust */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-[#475569] pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6366F1]" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6366F1]" />
                14-day free trial
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:w-1/2 w-full relative">
            <div className="relative z-10 rounded-3xl p-6 bg-white border border-[#E2E8F0] shadow-[0_25px_70px_rgba(0,0,0,0.08)] transition-all duration-500 hover:scale-[1.03]">
              {/* Top Bar */}
              <div className="flex items-center justify-between mb-6 border-b border-[#E2E8F0] pb-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="h-2 w-24 bg-[#E2E8F0] rounded-full"></div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-[#F8FAFC] border">
                  <p className="text-xs text-[#64748B] mb-1">Total Discount</p>
                  <h3 className="text-lg font-semibold text-[#1E293B]">
                    {isLoadingOffers ? "..." : `₹${totalDiscountValue}`}
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFC] border">
                  <p className="text-xs text-[#64748B] mb-1">Offers</p>
                  <h3 className="text-lg font-semibold text-[#1E293B]">
                    {isLoadingOffers ? "..." : totalOffers}
                  </h3>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="space-y-3">
                {isLoadingOffers
                  ? [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-[#F1F5F9] rounded animate-pulse"
                      />
                    ))
                  : offers.slice(0, 3).map((offer) => (
                      <div
                        key={offer._id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-[#F8FAFC] border hover:bg-[#EEF2FF] transition"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#E2E8F0]" />

                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1E293B]">
                            {offer.offer_name}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            {offer.is_active ? "Active" : "Paused"}
                          </p>
                        </div>
                      </div>
                    ))}
              </div>
            </div>

            {/* Decorations */}
            <div className="absolute -top-12 -right-10 w-28 h-28 bg-[#6366F1]/20 rounded-2xl blur-2xl -z-10"></div>
            <div className="absolute -bottom-12 -left-10 w-36 h-36 bg-[#1E293B]/10 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
