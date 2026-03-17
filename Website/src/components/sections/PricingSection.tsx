import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for new businesses just getting started.",
    features: [
      "Up to 100 Products",
      "Basic Analytics",
      "Standard Support",
      "1 Admin User",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    price: "$79",
    description: "For growing brands scaling their operations.",
    features: [
      "Unlimited Products",
      "Advanced Analytics",
      "Priority Support",
      "5 Admin Users",
      "Marketing Tools",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Custom solutions for large-scale organizations.",
    features: [
      "Unlimited Everything",
      "Custom Integration",
      "Dedicated Manager",
      "SSO & Advanced Security",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section className="relative py-28 bg-slate-50 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:26px_26px]" />

      <div className="container mx-auto px-6">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent <span className="text-indigo-500">Pricing</span>
          </h2>

          <p className="text-slate-600 text-lg">
            Choose the plan that fits your business. No hidden fees.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "bg-slate-900 text-white shadow-2xl scale-105"
                  : "bg-white border border-slate-200 hover:shadow-xl"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              {/* Plan header */}
              <div className="mb-8 text-center">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>

                <div className="flex justify-center items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && (
                    <span
                      className={
                        plan.popular ? "text-slate-300" : "text-slate-500"
                      }
                    >
                      /month
                    </span>
                  )}
                </div>

                <p
                  className={`text-sm ${
                    plan.popular ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className={`flex items-center gap-3 text-sm ${
                      plan.popular ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        plan.popular ? "bg-indigo-500/20" : "bg-indigo-100"
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          plan.popular ? "text-indigo-400" : "text-indigo-600"
                        }`}
                      />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`w-full h-12 rounded-xl text-base ${
                  plan.popular
                    ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                    : "border border-slate-300 text-slate-900 hover:bg-slate-100"
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
