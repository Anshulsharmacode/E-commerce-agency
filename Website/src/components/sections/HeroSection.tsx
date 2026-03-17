import type { Offer } from "@/types/offer";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

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
  const totalDiscountValue = offers.reduce(
    (sum, o) => sum + (o.discount_value || 0),
    0,
  );

  const totalOffers = offers.length;

  return (
    <section className="relative pt-28 pb-24 md:pt-36 md:pb-28 overflow-hidden bg-slate-50">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:26px_26px]" />
      <div className="absolute top-[-10%] right-[-5%] w-[420px] h-[420px] bg-indigo-200/50 blur-[140px] rounded-full -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[420px] h-[420px] bg-slate-300/40 blur-[160px] rounded-full -z-10" />

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          {/* LEFT */}
          <div className="lg:w-1/2 text-center lg:text-left space-y-8">
            {/* Badge */}
            {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-medium shadow-sm text-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              AI-powered analytics
            </div> */}

            {/* Live
            <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-slate-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live data updating
            </div> */}

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
              <span className="block text-slate-900">Supercharge your</span>
              <span className="block text-indigo-500">
                {isLoadingOffers
                  ? "Loading..."
                  : `${activeOfferCount}+ Active Deals`}
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {isLoadingOffers
                ? "Fetching real-time insights..."
                : `Currently managing ${offers.length} offers with live analytics.`}
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="/app.apk" download>
                <Button className="group px-8 h-12 rounded-xl text-base bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg">
                  Download APK
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
            </div>

            {/* Trust */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-slate-600 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                14-day free trial
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:w-1/2 w-full relative">
            <div className="relative z-10 rounded-3xl p-6 bg-white border border-slate-200 shadow-[0_30px_80px_rgba(15,23,42,0.18)] transition-all duration-500 hover:scale-[1.03]">
              {/* Top */}
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="h-2 w-24 bg-slate-200 rounded-full"></div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Total Discount</p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {isLoadingOffers ? "..." : `₹${totalDiscountValue}`}
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Offers</p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {isLoadingOffers ? "..." : totalOffers}
                  </h3>
                </div>
              </div>

              {/* Activity */}
              <div className="space-y-3">
                {isLoadingOffers
                  ? [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-slate-100 rounded animate-pulse"
                      />
                    ))
                  : offers.slice(0, 3).map((offer) => (
                      <div
                        key={offer._id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 hover:shadow-sm transition"
                      >
                        <div className="w-9 h-9 rounded-full bg-indigo-100" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {offer.offer_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {offer.is_active ? "Active" : "Paused"}
                          </p>
                        </div>
                      </div>
                    ))}
              </div>
            </div>

            {/* Decorations */}
            <div className="absolute -top-12 -right-10 w-28 h-28 bg-indigo-200/60 rounded-2xl blur-2xl -z-10"></div>
            <div className="absolute -bottom-12 -left-10 w-36 h-36 bg-slate-300/40 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
