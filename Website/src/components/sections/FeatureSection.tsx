import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Zap, Shield, BarChart3, Globe, Layers, Users } from "lucide-react";

const features = [
  {
    icon: <BarChart3 className="w-6 h-6 text-[#1A3263]" />,
    title: "Advanced Analytics",
    description: "Get real-time insights into your sales performance with our comprehensive dashboard.",
  },
  {
    icon: <Zap className="w-6 h-6 text-[#1A3263]" />,
    title: "Lightning Fast",
    description: "Built on modern infrastructure to ensure your store loads instantly for every customer.",
  },
  {
    icon: <Shield className="w-6 h-6 text-[#1A3263]" />,
    title: "Enterprise Security",
    description: "Bank-grade security measures to keep your data and your customers' info safe.",
  },
  {
    icon: <Globe className="w-6 h-6 text-[#1A3263]" />,
    title: "Global Selling",
    description: "Multi-currency and multi-language support to help you scale internationally.",
  },
  {
    icon: <Layers className="w-6 h-6 text-[#1A3263]" />,
    title: "Inventory Management",
    description: "Track stock levels, set low stock alerts, and automate reordering seamlessly.",
  },
  {
    icon: <Users className="w-6 h-6 text-[#1A3263]" />,
    title: "Team Collaboration",
    description: "Granular permissions and roles to manage your team effectively.",
  },
];

export function FeatureSection() {
  return (
    <section className="relative overflow-hidden py-24 bg-[linear-gradient(180deg,#FFC570_0%,#EFD2B0_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(#1A3263_1px,transparent_1px)] [background-size:26px_26px]"></div>
      <div className="container mx-auto px-6 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-[#1A3263]">
            Everything you need to <span className="text-[#547792]">Scale</span>
          </h2>
          <p className="text-[#547792] text-lg">
            Powerful features designed to help you manage every aspect of your e-commerce business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border border-[#1A3263]/10 shadow-sm hover:shadow-xl transition-shadow duration-300 bg-white/75 backdrop-blur-sm"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-[#1A3263]/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl text-[#1A3263]">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-[#547792]">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
