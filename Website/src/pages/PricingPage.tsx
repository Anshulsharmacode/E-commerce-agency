import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PricingSection } from "@/components/sections/PricingSection";
import { CTASection } from "@/components/sections/CTASection";
import { Plus } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        <section className="relative pt-32 pb-10 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="container mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-medium text-indigo-700 mb-6">
              Pricing Plans
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Simple pricing for <br/>
              <span className="text-indigo-600">everyone</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Start for free, upgrade as you grow. No credit card required for trial.
            </p>
          </div>
        </section>

        <PricingSection />

        {/* FAQ Section */}
        <section className="relative py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-6 max-w-4xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-slate-600">Everything you need to know about our plans and pricing.</p>
            </div>
            
            <div className="grid gap-6">
               {[
                 {
                   q: "Can I cancel anytime?",
                   a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period."
                 },
                 {
                   q: "Do you offer refunds?",
                   a: "We offer a 14-day money-back guarantee if you're not satisfied with our service. No questions asked."
                 },
                 {
                   q: "What payment methods do you accept?",
                   a: "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers for enterprise plans."
                 },
                 {
                   q: "Can I switch plans later?",
                   a: "Absolutely! You can upgrade or downgrade your plan at any time from your account settings."
                 }
               ].map((faq, idx) => (
                 <div 
                   key={idx} 
                   className="group p-8 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                 >
                   <div className="flex items-start justify-between gap-4">
                     <div>
                       <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                         {faq.q}
                       </h3>
                       <p className="text-slate-600 leading-relaxed">
                         {faq.a}
                       </p>
                     </div>
                     <div className="shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-all duration-300">
                       <Plus className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
