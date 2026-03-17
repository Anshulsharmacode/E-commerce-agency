import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        <section className="relative pt-32 pb-20 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="absolute top-[-10%] left-[-5%] w-[420px] h-[420px] bg-indigo-200/50 blur-[140px] rounded-full -z-10" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[420px] h-[420px] bg-purple-200/40 blur-[160px] rounded-full -z-10" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-medium text-indigo-700 mb-6">
                  Contact Us
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
                  Get in <span className="text-indigo-600">touch</span>
                </h1>
                <p className="text-xl text-slate-600">
                  We'd love to hear from you. Our team is always here to help.
                </p>
              </div>

              <div className="grid md:grid-cols-5 gap-12 items-start">
                {/* Contact Info */}
                <div className="md:col-span-2 space-y-6">
                  {[
                    {
                      icon: <Mail className="w-5 h-5 text-indigo-600" />,
                      title: "Chat to us",
                      desc: "Our friendly team is here to help.",
                      link: "hello@agencyadmin.com",
                      href: "mailto:hello@agencyadmin.com"
                    },
                    {
                      icon: <MapPin className="w-5 h-5 text-indigo-600" />,
                      title: "Visit us",
                      desc: "Come say hello at our office HQ.",
                      link: "100 Smith Street, Collingwood VIC 3066 AU",
                      href: "#"
                    },
                    {
                      icon: <Phone className="w-5 h-5 text-indigo-600" />,
                      title: "Call us",
                      desc: "Mon-Fri from 8am to 5pm.",
                      link: "+1 (555) 000-0000",
                      href: "tel:+15550000000"
                    }
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      className="p-6 rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                        {item.icon}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-slate-500 text-sm mb-3">{item.desc}</p>
                      <a href={item.href} className="text-indigo-600 font-medium hover:underline text-sm">
                        {item.link}
                      </a>
                    </div>
                  ))}
                </div>

                {/* Form */}
                <div className="md:col-span-3 bg-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:22px_22px]" />
                  
                  <form className="relative z-10 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="first-name" className="text-sm font-medium text-slate-300">First name</label>
                        <Input 
                          id="first-name" 
                          placeholder="John" 
                          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="last-name" className="text-sm font-medium text-slate-300">Last name</label>
                        <Input 
                          id="last-name" 
                          placeholder="Doe" 
                          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-slate-300">Email</label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="john@company.com" 
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-slate-300">Message</label>
                      <textarea 
                        id="message" 
                        rows={4}
                        className="flex w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white ring-offset-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                        placeholder="Tell us how we can help..."
                      ></textarea>
                    </div>

                    <Button className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-300 group">
                      Send Message
                      <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
