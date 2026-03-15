import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Boxes,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: Boxes, label: "Categories", href: "/admin/categories" },
  { icon: Tag, label: "Offers", href: "/admin/offers" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentPage = location.pathname.split("/").pop() || "dashboard";

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar/95">
      <div className="px-4 py-5">
        <Link className="flex items-center gap-2" to="/admin">
          <span className="brand-gradient inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground">
            <ShoppingBag className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">E-Agency</p>
            <p className="text-xs text-muted-foreground">Admin Console</p>
          </div>
        </Link>
      </div>
      <Separator />

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1.5">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                  "w-full justify-start gap-3 rounded-lg px-3",
                  isActive &&
                    "bg-secondary/80 text-secondary-foreground shadow-sm",
                )}
              >
                <item.icon
                  className={cn("h-4 w-4", isActive && "text-primary")}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen bg-background">
      <div className="pointer-events-none fixed -left-16 top-12 h-48 w-48 rounded-full bg-chart-1/20 blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-0 h-64 w-64 rounded-full bg-chart-2/20 blur-3xl" />

      <aside className="fixed hidden h-full w-[17rem] border-r border-sidebar-border md:flex">
        <SidebarContent />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:ml-[17rem]">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border/70 bg-background/90 px-4 backdrop-blur md:px-6">
          <Sheet>
            <SheetTrigger>
              <Button variant="ghost" size="icon" className="mr-2 md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[17rem] p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Admin</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium capitalize text-foreground">
              {currentPage}
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
