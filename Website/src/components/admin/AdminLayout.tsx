import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Boxes,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ClipboardList,
  ShoppingBag,
  Tag,
  Users,
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
  { icon: ClipboardList, label: "Orders", href: "/admin/orders" },
  { icon: Users, label: "Employees", href: "/admin/employees" },
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
    <div className="flex h-full flex-col bg-white border-r border-slate-200">
      <div className="px-6 py-8">
        <Link className="flex items-center gap-3 group" to="/admin">
          <div className="bg-indigo-600 p-2 rounded-xl group-hover:scale-105 transition-transform shadow-lg shadow-indigo-200">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight tracking-tight text-slate-900">
              Agency<span className="text-indigo-600">Admin</span>
            </p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Console</p>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1.5 py-4">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-start gap-3 rounded-xl px-4 py-6 transition-all duration-200 group",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-sm shadow-indigo-100" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors", 
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                <span className="font-semibold text-sm">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 rounded-xl px-4 py-6 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-500" />
          <span className="font-semibold text-sm">Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen bg-slate-50/50">
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/30 blur-[120px] rounded-full -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200/20 blur-[120px] rounded-full -ml-64 -mb-64" />
      </div>

      <aside className="fixed hidden h-full w-72 md:flex z-40">
        <SidebarContent />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:ml-72 relative z-10">
        <header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl md:px-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-4 md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-none">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-400">Admin</span>
              <ChevronRight className="h-4 w-4 text-slate-300" />
              <span className="font-bold capitalize text-slate-900 tracking-tight">
                {currentPage}
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-[10px] font-bold text-green-700 uppercase tracking-wider">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               System Live
             </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 md:px-10 md:py-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
