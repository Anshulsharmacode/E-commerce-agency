import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProfile, type User } from "@/api";
import { Button } from "@/components/ui/button";
import { 
  User as UserIcon, 
  Settings, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  ShoppingBag,
  Heart,
  Bell,
  Shield,
  HelpCircle,
  CreditCard
} from "lucide-react";

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    navigate("/login");
  };

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background pb-32">
      {/* ── Enhanced Header ── */}
      <header className="relative px-6 pt-16 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        
        <div className="relative flex flex-col items-center text-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative h-28 w-28 rounded-[2.5rem] bg-card border-4 border-background shadow-2xl flex items-center justify-center text-primary">
              {profile?.name ? (
                <span className="text-4xl font-black">{profile.name.charAt(0).toUpperCase()}</span>
              ) : (
                <UserIcon className="h-12 w-12" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 h-9 w-9 rounded-2xl bg-foreground text-background border-4 border-background flex items-center justify-center shadow-lg active:scale-90 transition-transform">
              <Settings className="h-4 w-4" />
            </button>
          </div>
          
          <h1 className="mt-6 text-2xl font-black tracking-tight text-foreground">
            {profile?.name || "Premium User"}
          </h1>
          <p className="mt-1 text-sm font-bold text-muted-foreground">
            {profile?.email || "user@shopease.com"}
          </p>
          
          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Verified Account</span>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-8">
        {/* Quick Stats/Links */}
        <div className="grid grid-cols-3 gap-3">
          <Link to="/orders" className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-4 active:scale-95 transition-transform">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-2">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground">Orders</span>
          </Link>
          <Link to="/wishlist" className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-4 active:scale-95 transition-transform">
            <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 mb-2">
              <Heart className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground">Wishlist</span>
          </Link>
          <button className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-4 active:scale-95 transition-transform">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb-2">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground">Wallet</span>
          </button>
        </div>

        {/* Settings Groups */}
        <section className="space-y-4">
          <h2 className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Account Settings</h2>
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
            {[
              { icon: MapPin, label: "Delivery Addresses", color: "text-primary" },
              { icon: Bell, label: "Notifications", color: "text-primary" },
              { icon: Shield, label: "Security & Privacy", color: "text-primary" },
            ].map((item, idx, arr) => (
              <div key={item.label}>
                <button className="flex w-full items-center justify-between p-5 hover:bg-secondary/50 active:bg-secondary transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </button>
                {idx < arr.length - 1 && <div className="mx-6 h-px bg-border/50" />}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Support & More</h2>
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
            {[
              { icon: HelpCircle, label: "Help Center", color: "text-muted-foreground" },
              { icon: Settings, label: "App Settings", color: "text-muted-foreground" },
            ].map((item, idx, arr) => (
              <div key={item.label}>
                <button className="flex w-full items-center justify-between p-5 hover:bg-secondary/50 active:bg-secondary transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </button>
                {idx < arr.length - 1 && <div className="mx-6 h-px bg-border/50" />}
              </div>
            ))}
          </div>
        </section>

        <Button 
          variant="destructive" 
          onClick={handleLogout}
          className="h-16 w-full rounded-[1.75rem] text-base font-black shadow-lg shadow-destructive/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <LogOut className="h-5 w-5" /> Sign Out
        </Button>
        
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 pb-8">
          ShopEase Mobile v2.4.0
        </p>
      </main>
    </div>
  );
}

export default ProfilePage;
