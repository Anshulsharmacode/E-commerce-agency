import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Grid, ShoppingCart, User, ClipboardList } from "lucide-react";
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
        { icon: ClipboardList, label: "Orders", path: "/employee/orders" },
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
    <nav className="glass-effect fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around px-2 pb-safe-bottom bg-background/80 backdrop-blur-md border-t border-border">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? "fill-primary/10" : ""}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default BottomNav;
