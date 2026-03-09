import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/api";
import { Eye, EyeOff, Mail, Lock, ShoppingBag } from "lucide-react";

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
    <div className="flex h-screen flex-col bg-background">
      {/* Top branding area */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-4">
        {/* Logo / Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-foreground shadow-lg">
          <ShoppingBag className="h-10 w-10 text-background" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome Back
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to continue shopping
        </p>
      </div>

      {/* Form area */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-t-3xl border-t border-border bg-card px-6 pb-10 pt-8 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      >
        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span className="text-base">⚠️</span>
            {error}
          </div>
        )}

        {/* Email field */}
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl border-border bg-background pl-10 text-base"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-xl border-border bg-background pl-10 pr-12 text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="mt-2 h-12 w-full rounded-xl bg-foreground text-base font-semibold text-background active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
