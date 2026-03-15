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
  Heart
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

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading profile...</div>;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-32">
      <header className="px-5 py-10 flex flex-col items-center justify-center text-center">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 border-4 border-background shadow-xl">
          <UserIcon className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-bold">{profile?.name || "User Name"}</h1>
        <p className="text-sm text-muted-foreground">{profile?.email || "email@example.com"}</p>
        <p className="text-sm text-muted-foreground mt-1">{profile?.phone}</p>
      </header>

      <main className="px-5 space-y-6">
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2">My Account</h2>
          <div className="rounded-2xl border bg-card overflow-hidden">
            <Link to="/orders" className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <span className="font-medium">My Orders</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <div className="h-px bg-border mx-4" />
            <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">Delivery Addresses</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="h-px bg-border mx-4" />
            <Link to="/wishlist" className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-primary" />
                <span className="font-medium">Wishlist</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2">App Settings</h2>
          <div className="rounded-2xl border bg-card overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Settings</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </section>

        <Button 
          variant="destructive" 
          onClick={handleLogout}
          className="w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2"
        >
          <LogOut className="h-5 w-5" /> Logout
        </Button>
      </main>
    </div>
  );
}

export default ProfilePage;
