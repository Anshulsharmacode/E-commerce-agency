import { Download, LayoutDashboard, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { buttonVariants } from "../ui/button";

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link className="flex items-center gap-2 font-semibold" to="/">
          <span className="brand-gradient inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <span>E-Agency Commerce</span>
        </Link>
        <div className="flex items-center gap-2">
          <a
            className={cn(buttonVariants({ variant: "outline" }), "hidden sm:inline-flex")}
            href="/app-release.apk"
            download
          >
            <Download className="mr-2 h-4 w-4" /> APK
          </a>
          <Link className={buttonVariants()} to="/login">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Admin Login
          </Link>
        </div>
      </div>
    </header>
  );
}
