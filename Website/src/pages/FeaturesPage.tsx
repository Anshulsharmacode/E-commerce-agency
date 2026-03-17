import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FeatureSection } from "@/components/sections/FeatureSection";
import { CTASection } from "@/components/sections/CTASection";
import { Shield, Zap, BarChart3, Globe } from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        {/* Page Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="absolute top-[-10%] right-[-5%] w-[420px] h-[420px] bg-indigo-200/50 blur-[140px] rounded-full -z-10" />
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-medium text-indigo-700 mb-6">
                Features
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
                Powerful tools for <br/>
                <span className="text-indigo-600">modern commerce</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Explore the comprehensive suite of tools designed to help you launch, scale, and manage your business with ease.
              </p>
            </div>
          </div>
        </section>
        
        <FeatureSection />

        {/* Deep Dive Section */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                  Everything you need to <br/>
                  <span className="text-indigo-600">Scale Globally</span>
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      icon: <Shield className="w-6 h-6 text-indigo-600" />,
                      title: "Secure Infrastructure",
                      desc: "Bank-grade security and data encryption to keep your business safe."
                    },
                    {
                      icon: <Zap className="w-6 h-6 text-indigo-600" />,
                      title: "Real-time Sync",
                      desc: "Inventory and orders synced across all your sales channels instantly."
                    },
                    {
                      icon: <BarChart3 className="w-6 h-6 text-indigo-600" />,
                      title: "Advanced Analytics",
                      desc: "Deep insights into customer behavior and sales trends."
                    },
                    {
                      icon: <Globe className="w-6 h-6 text-indigo-600" />,
                      title: "Global Reach",
                      desc: "Support for multiple currencies and international shipping."
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
                        <p className="text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl rounded-full"></div>
                <div className="relative rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl">
                  <div className="rounded-2xl overflow-hidden">
                     <img 
                       src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" 
                       alt="Dashboard Preview" 
                       className="w-full h-auto"
                     />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
