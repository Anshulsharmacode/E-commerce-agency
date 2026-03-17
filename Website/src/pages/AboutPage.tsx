import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CTASection } from "@/components/sections/CTASection";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
              We're on a mission to <br />
              <span className="text-gradient">simplify commerce</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              AgencyAdmin was born from a simple idea: E-commerce shouldn't be complicated. 
              We're building the operating system for the next generation of brands.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div className="relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl transform rotate-3"></div>
               <img 
                 src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                 alt="Team working" 
                 className="relative rounded-2xl shadow-xl z-10"
               />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold font-display">Our Story</h2>
              <p className="text-muted-foreground text-lg">
                Founded in 2024, we realized that most e-commerce platforms were either too simple or too complex. 
                There was no middle ground for growing agencies that needed power without the bloat.
              </p>
              <p className="text-muted-foreground text-lg">
                Today, we support thousands of merchants across the globe, processing millions in GMV annually.
              </p>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-3xl font-bold font-display text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Customer First", desc: "We build for you, not for us." },
                { title: "Simplicity", desc: "Complexity is the enemy of execution." },
                { title: "Transparency", desc: "No hidden fees, no black boxes." }
              ].map((value, idx) => (
                <div key={idx} className="p-8 rounded-2xl bg-muted/30 border border-border text-center">
                  <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
