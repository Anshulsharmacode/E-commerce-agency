import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Grid, ShoppingCart, User, ClipboardList, Sparkles } from "lucide-react";
import { getProfile, type UserRole } from "@/api";

function BottomNav() {
  const location = useLocation();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setUserRole(res.data.role);
      } catch (err) {
        console.error(err);
      }
    };
    void fetchProfile();
  }, []);

  const navItems = useMemo(() => {
    if (userRole === "employee") {
      return [
        { icon: Home, label: "Home", path: "/" },
        { icon: ClipboardList, label: "Tasks", path: "/employee/orders" },
        { icon: User, label: "Profile", path: "/profile" },
      ];
    }

    if (userRole === "admin") {
      return [
        { icon: Home, label: "Home", path: "/" },
        { icon: ClipboardList, label: "Orders", path: "/orders" },
        { icon: User, label: "Profile", path: "/profile" },
      ];
    }

    return [
      { icon: Home, label: "Home", path: "/" },
      { icon: Grid, label: "Explore", path: "/categories" },
      { icon: ShoppingCart, label: "Cart", path: "/cart" },
      { icon: ClipboardList, label: "Orders", path: "/orders" },
      { icon: User, label: "Profile", path: "/profile" },
    ];
  }, [userRole]);

  return (
    <div className="fixed bottom-6 left-5 right-5 z-50">
      <nav className="relative flex h-20 items-center justify-around overflow-hidden rounded-[2.5rem] border border-white/20 bg-background/60 px-2 shadow-2xl backdrop-blur-2xl transition-all duration-500">
        {/* Animated Background Indicator */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary/5 to-transparent" />
        
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex h-full flex-1 flex-col items-center justify-center gap-1 transition-all duration-300 active:scale-75 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 h-1 w-8 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] animate-in slide-in-from-top-2" />
              )}
              
              <div className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 ${
                isActive ? "bg-primary/10" : "bg-transparent"
              }`}>
                <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? "scale-110 fill-primary/10" : ""}`} />
                {isActive && (
                   <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-primary animate-pulse" />
                )}
              </div>
              
              <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default BottomNav;
