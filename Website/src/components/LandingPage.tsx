import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgePercent,
  Download,
  LayoutDashboard,
  MessageSquareMore,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
} from "lucide-react";
import { cn } from "../lib/utils";
import { buttonVariants } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import api from "../lib/api";

const heroImg = new URL("../assets/hero.png", import.meta.url).href;

interface Offer {
  _id: string;
  offer_name: string;
  offer_code: string;
  offer_type: string;
  discount_type: string;
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const featureCards = [
  {
    icon: LayoutDashboard,
    title: "Fast Admin Dashboard",
    description: "Track products, categories, offers, and order performance from one place.",
  },
  {
    icon: Tag,
    title: "Smart Offer Engine",
    description: "Create order, product, category, and BXGY offers with full control.",
  },
  {
    icon: MessageSquareMore,
    title: "Customer-First Workflow",
    description: "Manage operations cleanly and focus on response speed and fulfillment quality.",
  },
];

const formatDiscount = (offer: Offer) => {
  if (offer.discount_type === "percentage") return `${offer.discount_value}% OFF`;
  if (offer.discount_type === "flat") return `₹${offer.discount_value} OFF`;
  return "Free Product";
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function LandingPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoadingOffers(true);
      try {
        const res = await api.get("/offer/all");
        setOffers(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (error) {
        console.error("Failed to fetch offers", error);
        setOffers([]);
      } finally {
        setIsLoadingOffers(false);
      }
    };

    fetchOffers();
  }, []);

  const activeOfferCount = useMemo(
    () => offers.filter((offer) => offer.is_active).length,
    [offers],
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-24 h-56 w-56 rounded-full bg-chart-1/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-chart-2/30 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Link className="flex items-center gap-2 font-semibold" to="/">
            <span className="brand-gradient inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <span>E-Agency Commerce</span>
          </Link>
          <div className="flex items-center gap-2">
            <a
              className={cn(buttonVariants({ variant: "outline" }), "hidden sm:inline-flex")}
              href="/app-release.apk"
              download
            >
              <Download className="mr-2 h-4 w-4" /> APK
            </a>
            <Link className={buttonVariants()} to="/login">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 pb-14 pt-12 md:px-6 md:pt-18">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/65 px-3 py-1 text-xs font-semibold text-secondary-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Built for serious catalog and offer management
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold leading-tight text-balance sm:text-5xl lg:text-6xl">
                  Run your e-commerce operations with a cleaner, faster control panel.
                </h1>
                <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
                  Manage products, categories, and discounts from one modern interface. Every offer you
                  publish is visible instantly and backed by your real backend data.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  className={cn(buttonVariants({ size: "lg" }), "shadow-sm")}
                  href="/app-release.apk"
                  download
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download APK
                </a>
                <Link className={buttonVariants({ size: "lg", variant: "outline" })} to="/login">
                  Open Admin Panel
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="surface-glass rounded-xl border border-border/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Offers In System</p>
                  <p className="mt-1 text-2xl font-semibold">{offers.length}</p>
                </div>
                <div className="surface-glass rounded-xl border border-border/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Active Offers</p>
                  <p className="mt-1 text-2xl font-semibold">{activeOfferCount}</p>
                </div>
                <div className="surface-glass rounded-xl border border-border/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Security</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-lg font-semibold">
                    <ShieldCheck className="h-5 w-5 text-chart-1" />
                    Admin Auth
                  </p>
                </div>
              </div>
            </div>

            <div className="animate-fade-up-delay">
              <Card className="overflow-hidden border-border/70 bg-card/95 shadow-lg">
                <CardHeader className="border-b border-border/70 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <BadgePercent className="h-5 w-5 text-primary" />
                    Offer Performance Preview
                  </CardTitle>
                  <CardDescription>Live data connected with your backend APIs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                  <img
                    alt="E-commerce admin preview"
                    className="h-52 w-full rounded-xl object-cover"
                    src={heroImg}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border/70 bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Live Offers</p>
                      <p className="text-xl font-semibold">{isLoadingOffers ? "..." : offers.length}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Active</p>
                      <p className="text-xl font-semibold">{isLoadingOffers ? "..." : activeOfferCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="px-4 py-14 md:px-6">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-3xl font-semibold">What You Can Manage</h2>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                End-to-end control
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {featureCards.map((feature) => (
                <Card key={feature.title} className="border-border/70 bg-card/90">
                  <CardHeader className="space-y-2">
                    <span className="brand-gradient-soft inline-flex h-11 w-11 items-center justify-center rounded-xl">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </span>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 md:px-6">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-3xl font-semibold">Current Offers</h2>
              <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium">
                Pulled from `/offer/all`
              </span>
            </div>

            {isLoadingOffers ? (
              <div className="rounded-xl border border-border/70 bg-card/90 p-8 text-center text-muted-foreground">
                Loading offers...
              </div>
            ) : offers.length === 0 ? (
              <div className="rounded-xl border border-border/70 bg-card/90 p-8 text-center text-muted-foreground">
                No offers available yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {offers.map((offer) => (
                  <Card key={offer._id} className="border-border/70 bg-card/95">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg">{offer.offer_name}</CardTitle>
                          <CardDescription className="mt-1 font-mono text-xs">
                            {offer.offer_code}
                          </CardDescription>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            offer.is_active
                              ? "bg-chart-5/30 text-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {offer.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="font-semibold text-primary">{formatDiscount(offer)}</p>
                      <p className="text-muted-foreground">Type: {offer.offer_type}</p>
                      <p className="text-muted-foreground">
                        Valid: {formatDate(offer.start_date)} to {formatDate(offer.end_date)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
