import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PricingSection } from "@/components/sections/PricingSection";
import { CTASection } from "@/components/sections/CTASection";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow pt-32">
        <div className="container mx-auto px-6 text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
            Simple pricing for <br/>
            <span className="text-gradient">everyone</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start for free, upgrade as you grow. No credit card required for trial.
          </p>
        </div>

        <PricingSection />

        <div className="container mx-auto px-6 py-20 max-w-3xl">
          <h2 className="text-3xl font-bold font-display text-center mb-12">Frequently Asked Questions</h2>
          
          {/* Using a simple details/summary if accordion is not available, or standard shadcn accordion */}
          <div className="space-y-4">
             <div className="border border-border rounded-lg p-4">
               <h3 className="font-bold mb-2">Can I cancel anytime?</h3>
               <p className="text-muted-foreground">Yes, you can cancel your subscription at any time. We don't believe in locking you in.</p>
             </div>
             <div className="border border-border rounded-lg p-4">
               <h3 className="font-bold mb-2">Do you offer refunds?</h3>
               <p className="text-muted-foreground">We offer a 30-day money-back guarantee if you're not satisfied with our service.</p>
             </div>
             <div className="border border-border rounded-lg p-4">
               <h3 className="font-bold mb-2">What payment methods do you accept?</h3>
               <p className="text-muted-foreground">We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</p>
             </div>
          </div>
        </div>

        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
