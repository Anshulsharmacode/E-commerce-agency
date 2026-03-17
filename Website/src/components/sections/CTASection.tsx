import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-24 bg-slate-900">
      {/* Dot Pattern */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,#ffffff_1px,transparent_1px)] [background-size:26px_26px]" />

      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-indigo-500/20 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-purple-500/10 blur-[160px] rounded-full" />

      <div className="container mx-auto px-6 relative z-10">
        {/* CTA Card */}
        <div
          className="relative rounded-3xl p-10 md:p-16 text-center overflow-hidden 
          bg-slate-800/60 backdrop-blur-xl border border-slate-700 shadow-2xl"
        >
          {/* Inner subtle pattern */}
          <div
            className="absolute inset-0 opacity-10 
            bg-[radial-gradient(circle,#6366F1_1px,transparent_1px)] 
            [background-size:22px_22px]"
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            {/* Heading */}
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Ready to grow your business?
            </h2>

            {/* Subtext */}
            <p className="text-slate-400 text-lg md:text-xl">
              Join thousands of merchants managing their stores with
              AgencyAdmin.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button className="group w-full sm:w-auto h-12 px-8 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg">
                  Get Started for Free
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <Link to="/contact">
                <Button
                  // variant="secondary"
                  className="w-full sm:w-auto h-12 px-8 rounded-full border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
