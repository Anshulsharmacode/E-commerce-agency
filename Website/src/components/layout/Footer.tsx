import { Link } from "react-router-dom";
import { ShoppingBag, Twitter, Linkedin, Github, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-slate-50 border-t border-slate-200 pt-16 pb-8 overflow-hidden">
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:26px_26px]" />
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
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
            <ul className="space-y-2 text-sm text-slate-600">
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

          <div>
            <h4 className="font-semibold mb-4 text-slate-900">Company</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link
                  to="/about"
                  className="hover:text-indigo-600 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-slate-900">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Security
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
              className="text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
