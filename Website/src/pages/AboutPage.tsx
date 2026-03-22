import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CTASection } from "@/components/sections/CTASection";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="absolute top-[-10%] right-[-5%] w-[420px] h-[420px] bg-indigo-200/50 blur-[140px] rounded-full -z-10" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-20">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 tracking-tight">
                We're on a mission to <br />
                <span className="text-indigo-600">simplify commerce</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                AgencyAdmin was born from a simple idea: E-commerce shouldn't be
                complicated. We're building the operating system for the next
                generation of brands.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                    alt="Team working"
                    className="w-full h-full object-cover transform transition duration-700 group-hover:scale-105"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-medium text-indigo-700">
                  Our Story
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                  Empowering agencies since 2024
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Founded in 2024, we realized that most e-commerce platforms
                  were either too simple or too complex. There was no middle
                  ground for growing agencies that needed power without the
                  bloat.
                </p>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Today, we support thousands of merchants across the globe,
                  processing millions in GMV annually through our streamlined
                  interface.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* <StatsSection /> */}

        {/* Values Section */}
        <section className="relative py-24 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-indigo-500/20 blur-[140px] rounded-full" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Our Core <span className="text-indigo-400">Values</span>
              </h2>
              <p className="text-slate-400 text-lg">
                The principles that guide everything we build at AgencyAdmin.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Customer First",
                  desc: "We build for you, not for us. Your success is our primary metric.",
                },
                {
                  title: "Simplicity",
                  desc: "Complexity is the enemy of execution. We make the complex feel simple.",
                },
                {
                  title: "Transparency",
                  desc: "No hidden fees, no black boxes. We believe in clear communication.",
                },
              ].map((value, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-3xl bg-slate-800/60 backdrop-blur-xl border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">
                    {value.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">{value.desc}</p>
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
