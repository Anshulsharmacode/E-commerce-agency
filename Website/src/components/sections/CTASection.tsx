import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-20 bg-[linear-gradient(180deg,#FFC570_0%,#EFD2B0_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(#1A3263_1px,transparent_1px)] [background-size:26px_26px]"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="bg-[#1A3263] rounded-3xl p-10 md:p-16 text-center text-[#EFD2B0] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(#EFD2B0_1px,transparent_1px)] [background-size:20px_20px]"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold font-display">
              Visit it. First trial is free.
            </h2>
            <p className="text-[#EFD2B0]/80 text-lg md:text-xl">
              Experience the full platform before you commit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#FFC570] text-[#1A3263] hover:bg-[#EFD2B0] font-bold h-12 px-8 rounded-full shadow-lg"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-[#EFD2B0]/50 text-[#EFD2B0] hover:bg-[#EFD2B0]/10 h-12 px-8 rounded-full"
                >
                  Visit It <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
