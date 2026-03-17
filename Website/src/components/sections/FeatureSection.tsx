import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Zap, Shield, BarChart3, Globe, Layers, Users } from "lucide-react";

const features = [
  {
    icon: <BarChart3 className="w-6 h-6 text-indigo-500" />,
    title: "Advanced Analytics",
    description:
      "Get real-time insights into your sales performance with our comprehensive dashboard.",
  },
  {
    icon: <Zap className="w-6 h-6 text-indigo-500" />,
    title: "Lightning Fast",
    description:
      "Built on modern infrastructure to ensure your store loads instantly for every customer.",
  },
  {
    icon: <Shield className="w-6 h-6 text-indigo-500" />,
    title: "Enterprise Security",
    description:
      "Bank-grade security measures to keep your data and your customers' info safe.",
  },
  {
    icon: <Globe className="w-6 h-6 text-indigo-500" />,
    title: "Global Selling",
    description:
      "Multi-currency and multi-language support to help you scale internationally.",
  },
  {
    icon: <Layers className="w-6 h-6 text-indigo-500" />,
    title: "Inventory Management",
    description:
      "Track stock levels, set low stock alerts, and automate reordering seamlessly.",
  },
  {
    icon: <Users className="w-6 h-6 text-indigo-500" />,
    title: "Team Collaboration",
    description:
      "Granular permissions and roles to manage your team effectively.",
  },
];

export function FeatureSection() {
  return (
    <section className="relative overflow-hidden py-24 bg-slate-900">
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:26px_26px]" />

      {/* Glow */}
      <div className="absolute top-[-10%] left-[10%] w-[400px] h-[400px] bg-indigo-500/20 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-purple-500/10 blur-[160px] rounded-full" />

      <div className="container mx-auto px-6">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Everything you need to{" "}
            <span className="text-indigo-400">Scale</span>
          </h2>

          <p className="text-slate-400 text-lg">
            Powerful features designed to manage every aspect of your business.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border border-slate-800 bg-slate-800/60 backdrop-blur-xl hover:bg-slate-800 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>

                <CardTitle className="text-xl text-white">
                  {feature.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <CardDescription className="text-base text-slate-400">
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
