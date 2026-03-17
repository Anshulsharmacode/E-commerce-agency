import { LayoutDashboard, MessageSquareMore, Tag } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

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

export default function FeatureSection() {
  return (
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
  );
}
