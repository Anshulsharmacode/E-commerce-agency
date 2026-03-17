export function StatsSection() {
  const stats = [
    { value: "99.9%", label: "Uptime SLA" },
    { value: "2.5M+", label: "Active Users" },
    { value: "$500M+", label: "Processed Annually" },
    { value: "24/7", label: "Customer Support" },
  ];

  return (
    <section className="relative overflow-hidden py-16 bg-[linear-gradient(180deg,#EFD2B0_0%,#FFC570_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(#1A3263_1px,transparent_1px)] [background-size:22px_22px]"></div>
      <div className="container relative mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#1A3263]/10 bg-white/60 px-4 py-6 shadow-[0_12px_30px_rgba(26,50,99,0.15)] backdrop-blur"
            >
              <div className="text-3xl md:text-5xl font-bold text-[#1A3263] font-display tracking-tight">
                {stat.value}
              </div>
              <div className="mt-2 text-xs md:text-sm font-semibold uppercase tracking-wider text-[#547792]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
