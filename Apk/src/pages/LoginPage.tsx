import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/api";
import { Eye, EyeOff, Mail, Lock, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError("");
    setIsLoading(true);
    try {
      const response = await login({ email, password });
      const authToken = response.token ?? response.access_token;
      if (!authToken) {
        throw new Error("Token missing in login response.");
      }
      const resolvedUserName =
        response.user?.name ?? response.email?.split("@")[0] ?? "User";

      localStorage.setItem("token", authToken);
      localStorage.setItem("user_name", resolvedUserName);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(
        apiErr.response?.data?.message ??
          "Invalid email or password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Top Branding Area ── */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 pt-12 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        
        <div className="relative group">
          <div className="absolute inset-0 scale-150 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-foreground shadow-2xl transition-transform group-hover:scale-110 duration-500">
            <ShoppingBag className="h-12 w-12 text-background" />
          </div>
        </div>
        
        <div className="relative text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Premium Access</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground leading-relaxed">
            Your premium shopping experience <br /> starts here.
          </p>
        </div>
      </div>

      {/* ── Form Area ── */}
      <div className="relative">
        <div className="absolute inset-0 bg-foreground/5 blur-3xl rounded-t-[3rem] -z-10" />
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 rounded-t-[3rem] border-t border-border bg-card px-8 pb-12 pt-10 shadow-[0_-8px_40px_rgba(0,0,0,0.08)]"
        >
          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-destructive/10 px-4 py-4 text-sm font-bold text-destructive animate-in shake-in">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
              >
                Email Address
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-16 rounded-2xl border-border bg-secondary/30 pl-12 text-base font-bold focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label
                  htmlFor="password"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                >
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-16 rounded-2xl border-border bg-secondary/30 pl-12 pr-14 text-base font-bold focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-4 h-16 w-full rounded-2xl bg-foreground text-base font-black text-background shadow-2xl shadow-black/20 active:scale-[0.98] transition-all hover:shadow-black/30"
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign In <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>

          <div className="relative my-4 flex items-center gap-4">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Here?</span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <Link
            to="/signup"
            className="group flex h-16 w-full items-center justify-center rounded-2xl border-2 border-border bg-transparent text-base font-black transition-all hover:bg-secondary/50 active:scale-[0.98]"
          >
            Create Account
          </Link>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
