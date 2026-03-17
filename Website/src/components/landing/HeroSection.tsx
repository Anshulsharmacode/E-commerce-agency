import {
  BadgePercent,
  Download,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { buttonVariants } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

const heroImg = new URL("../../assets/hero.png", import.meta.url).href;

type HeroSectionProps = {
  offersCount: number;
  activeOffersCount: number;
  isLoadingOffers: boolean;
};

export default function HeroSection({
  offersCount,
  activeOffersCount,
  isLoadingOffers,
}: HeroSectionProps) {
  return (
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
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Open Admin Panel
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="surface-glass rounded-xl border border-border/70 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Offers In System</p>
              <p className="mt-1 text-2xl font-semibold">{offersCount}</p>
            </div>
            <div className="surface-glass rounded-xl border border-border/70 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Active Offers</p>
              <p className="mt-1 text-2xl font-semibold">{activeOffersCount}</p>
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
                  <p className="text-xl font-semibold">{isLoadingOffers ? "..." : offersCount}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-xl font-semibold">
                    {isLoadingOffers ? "..." : activeOffersCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
