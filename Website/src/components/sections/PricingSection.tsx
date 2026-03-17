import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for new businesses just getting started.",
    features: ["Up to 100 Products", "Basic Analytics", "Standard Support", "1 Admin User"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    price: "$79",
    description: "For growing brands scaling their operations.",
    features: ["Unlimited Products", "Advanced Analytics", "Priority Support", "5 Admin Users", "Marketing Tools"],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Custom solutions for large-scale organizations.",
    features: ["Unlimited Everything", "Custom Integration", "Dedicated Account Manager", "SSO & Advanced Security"],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section className="relative overflow-hidden py-24 bg-[linear-gradient(180deg,#EFD2B0_0%,#FFC570_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(#1A3263_1px,transparent_1px)] [background-size:28px_28px]"></div>
      <div className="container mx-auto px-6 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-[#1A3263]">
            Simple, Transparent <span className="text-[#547792]">Pricing</span>
          </h2>
          <p className="text-[#547792] text-lg">
            Choose the plan that best fits your business needs. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 border ${
                plan.popular
                  ? "border-[#1A3263] shadow-2xl bg-white/90 z-10 scale-105 ring-1 ring-[#1A3263]/20"
                  : "border-[#1A3263]/10 bg-white/70 shadow-sm hover:shadow-lg"
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1A3263] text-[#EFD2B0] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2 text-[#1A3263]">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold font-display text-[#1A3263]">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-[#547792]">/month</span>}
                </div>
                <p className="text-[#547792] text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-[#1A3263]">
                    <div className="w-5 h-5 rounded-full bg-[#1A3263]/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-[#1A3263]" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full h-12 rounded-xl ${
                  plan.popular ? "bg-[#1A3263] text-[#EFD2B0] shadow-lg shadow-[#1A3263]/20" : "text-[#1A3263]"
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
