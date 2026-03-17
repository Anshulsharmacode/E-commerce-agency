import { Link } from "react-router-dom";
import { ShoppingBag, Twitter, Linkedin, Github, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-slate-50 border-t border-slate-200 pt-16 pb-10 overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-24 right-0 w-72 h-72 bg-indigo-200/40 blur-3xl rounded-full -z-10" />
      <div className="absolute -bottom-24 left-0 w-72 h-72 bg-slate-300/40 blur-3xl rounded-full -z-10" />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-10 mb-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-100 p-2 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-xl font-bold font-display text-slate-900">
                Agency<span className="text-indigo-500">Admin</span>
              </span>
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed">
              The modern operating system for e-commerce agencies. Manage
              products, orders, and customers in one place.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-slate-900">Product</h4>
            <ul className="grid grid-cols-1 gap-y-2 text-sm text-slate-600">
              <li>
                <Link
                  to="/features"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/changelog"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Changelog
                </Link>
              </li>
              <li>
                <Link
                  to="/docs"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} AgencyAdmin. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="size-9 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all flex items-center justify-center"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="size-9 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all flex items-center justify-center"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="size-9 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all flex items-center justify-center"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="size-9 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all flex items-center justify-center"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
