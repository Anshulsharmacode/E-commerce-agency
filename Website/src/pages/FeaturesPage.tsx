import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FeatureSection } from "@/components/sections/FeatureSection";
import { CTASection } from "@/components/sections/CTASection";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow pt-32">
        <div className="container mx-auto px-6 mb-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
              Powerful tools for <br/>
              <span className="text-gradient">modern commerce</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Explore the comprehensive suite of tools designed to help you launch, scale, and manage your business.
            </p>
          </div>
        </div>
        
        <FeatureSection />
        
        {/* Additional Feature Details could go here */}
        
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
