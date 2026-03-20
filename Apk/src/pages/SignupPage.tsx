import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resendOtp, signup, verifyOtp } from '@/api';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  ChevronLeft,
  CheckCircle2,
  Building2,
  Globe,
  Hash,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────
interface PersonalForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface AddressForm {
  line1: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

// ── Step indicator ─────────────────────────────────────────────────────
function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-2 transition-all duration-500 rounded-full ${
            s === current
              ? 'w-10 bg-primary'
              : s < current
              ? 'w-4 bg-primary/40'
              : 'w-4 bg-border'
          }`}
        />
      ))}
    </div>
  );
}

// ── Field wrapper ──────────────────────────────────────────────────────
function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Personal, 2 = Address, 3 = OTP
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [personal, setPersonal] = useState<PersonalForm>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [address, setAddress] = useState<AddressForm>({
    line1: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
  });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handlePersonalNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (personal.password !== personal.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (personal.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!/^\d{10}$/.test(personal.phone)) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }
    setStep(2);
  };

  const handleAddressNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signup({
        name: personal.name,
        email: personal.email,
        phone: personal.phone,
        password: personal.password,
        address: {
          line1: address.line1,
          city: address.city,
          state: address.state,
          country: address.country,
          pincode: address.pincode,
        },
      });
      setStep(3);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Signup failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await verifyOtp({ emailOrPhone: personal.email, otp: code });
      const authToken = response.token ?? response.access_token;
      if (!authToken) {
        throw new Error('Token missing in verify response.');
      }
      const resolvedUserName = response.user?.name ?? personal.name ?? 'User';
      localStorage.setItem('token', authToken);
      localStorage.setItem('user_name', resolvedUserName);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Invalid OTP. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);
    try {
      await resendOtp({ emailOrPhone: personal.email });
      setOtp(['', '', '', '', '', '']);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Failed to resend OTP. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Shared components ─────────────────────────────────────────────────
  const Header = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="relative flex flex-1 flex-col items-center justify-center px-6 pt-12 pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl animate-pulse" />
      
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-foreground shadow-2xl transition-transform hover:scale-110 duration-500">
        <ShoppingBag className="h-10 w-10 text-background" />
      </div>
      
      <StepDots current={step} />
      
      <div className="relative text-center mt-6">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm font-medium text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );

  const ErrorBanner = () =>
    error ? (
      <div className="flex items-start gap-3 rounded-2xl bg-destructive/10 px-4 py-4 text-sm font-bold text-destructive animate-in shake-in">
        <span className="mt-0.5">⚠️</span>
        <span>{error}</span>
      </div>
    ) : null;

  const BackBtn = ({ to }: { to: number }) => (
    <button
      type="button"
      onClick={() => { setError(''); setStep(to); }}
      className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
    >
      <ChevronLeft className="h-4 w-4" /> Go Back
    </button>
  );

  const SubmitBtn = ({ label }: { label: string }) => (
    <Button
      type="submit"
      disabled={isLoading}
      className="mt-4 h-16 w-full rounded-2xl bg-foreground text-base font-black text-background shadow-2xl shadow-black/20 active:scale-[0.98] transition-all hover:shadow-black/30"
    >
      {isLoading ? (
        <span className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
          Processing...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {label} <ArrowRight className="h-5 w-5" />
        </span>
      )}
    </Button>
  );

  // ── Render Steps ──────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header title="Create Account" subtitle="Step 1 of 3 — Personal details" />

        <div className="relative">
          <div className="absolute inset-0 bg-foreground/5 blur-3xl rounded-t-[3rem] -z-10" />
          <form
            onSubmit={handlePersonalNext}
            className="flex flex-col gap-5 rounded-t-[3rem] border-t border-border bg-card px-8 pb-12 pt-10 shadow-[0_-8px_40px_rgba(0,0,0,0.08)]"
          >
            <ErrorBanner />

            <Field label="Full Name" icon={<User className="h-5 w-5" />}>
              <Input
                type="text"
                placeholder="John Doe"
                value={personal.name}
                onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                required
                className="h-16 rounded-2xl border-border bg-secondary/30 pl-12 text-base font-bold focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
              />
            </Field>

            <Field label="Email Address" icon={<Mail className="h-5 w-5" />}>
              <Input
                type="email"
                placeholder="you@example.com"
                value={personal.email}
                onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                required
                className="h-16 rounded-2xl border-border bg-secondary/30 pl-12 text-base font-bold focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
              />
            </Field>

            <Field label="Phone Number" icon={<Phone className="h-5 w-5" />}>
              <Input
                type="tel"
                placeholder="10-digit mobile number"
                value={personal.phone}
                onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                required
                className="h-16 rounded-2xl border-border bg-secondary/30 pl-12 text-base font-bold focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
              />
            </Field>

            <div className="grid grid-cols-1 gap-5">
              <Field label="Password" icon={<Lock className="h-5 w-5" />}>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={personal.password}
                  onChange={(e) => setPersonal({ ...personal, password: e.target.value })}
                  required
                  className="h-16 rounded-2xl border-border bg-secondary/30 pl-12 pr-14 text-base font-bold focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </Field>

              <Field label="Confirm Password" icon={<Lock className="h-5 w-5" />}>
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={personal.confirmPassword}
                  onChange={(e) => setPersonal({ ...personal, confirmPassword: e.target.value })}
                  required
                  className="h-16 rounded-2xl border-border bg-secondary/30 pl-12 pr-14 text-base font-bold focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </Field>
            </div>

            <SubmitBtn label="Continue" />

            <p className="text-center text-sm font-medium text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-black text-foreground underline-offset-8 hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header title="Your Address" subtitle="Step 2 of 3 — Delivery address" />

        <div className="relative">
          <div className="absolute inset-0 bg-foreground/5 blur-3xl rounded-t-[3rem] -z-10" />
          <form
            onSubmit={handleAddressNext}
            className="flex flex-col gap-5 rounded-t-[3rem] border-t border-border bg-card px-8 pb-12 pt-10 shadow-[0_-8px_40px_rgba(0,0,0,0.08)]"
          >
            <BackBtn to={1} />
            <ErrorBanner />

            <Field label="Street / Flat / Area" icon={<MapPin className="h-5 w-5" />}>
              <Input
                type="text"
                placeholder="221B Baker Street"
                value={address.line1}
                onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                required
                className="h-16 rounded-2xl border-border bg-secondary/30 pl-12 text-base font-bold focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="City" icon={<Building2 className="h-5 w-5" />}>
                <Input
                  type="text"
                  placeholder="Mumbai"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  required
                  className="h-16 rounded-2xl border-border bg-secondary/30 pl-12 text-base font-bold focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
                />
              </Field>

              <Field label="State" icon={<Globe className="h-5 w-5" />}>
                <Input
                  type="text"
                  placeholder="Maharashtra"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  required
                  className="h-16 rounded-2xl border-border bg-secondary/30 pl-12 text-base font-bold focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Country" icon={<Globe className="h-5 w-5" />}>
                <Input
                  type="text"
                  placeholder="India"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  required
                  className="h-16 rounded-2xl border-border bg-secondary/30 pl-12 text-base font-bold focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
                />
              </Field>

              <Field label="Pincode" icon={<Hash className="h-5 w-5" />}>
                <Input
                  type="text"
                  placeholder="400001"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  required
                  className="h-16 rounded-2xl border-border bg-secondary/30 pl-12 text-base font-bold focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
                />
              </Field>
            </div>

            <SubmitBtn label="Create Account" />
          </form>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // STEP 3 — OTP Verification
  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 pt-12 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-foreground shadow-2xl transition-transform hover:scale-110 duration-500">
          <CheckCircle2 className="h-10 w-10 text-background" />
        </div>
        
        <StepDots current={3} />
        
        <div className="relative text-center mt-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Final Step</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Verify Email
          </h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground leading-relaxed">
            We sent a 6-digit code to <br />
            <span className="font-black text-foreground">{personal.email}</span>
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-foreground/5 blur-3xl rounded-t-[3rem] -z-10" />
        <form
          onSubmit={handleVerifyOtp}
          className="flex flex-col gap-6 rounded-t-[3rem] border-t border-border bg-card px-8 pb-12 pt-10 shadow-[0_-8px_40px_rgba(0,0,0,0.08)]"
        >
          <ErrorBanner />

          {/* 6-box OTP input */}
          <div className="flex justify-between gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className={`h-16 w-12 rounded-2xl border text-center text-2xl font-black outline-none transition-all
                  ${digit
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-secondary/30 text-foreground'
                  }
                  focus:border-primary focus:ring-4 focus:ring-primary/10`}
              />
            ))}
          </div>

          <SubmitBtn label="Verify & Finish" />

          <p className="text-center text-sm font-medium text-muted-foreground">
            Didn't receive the code?{' '}
            <button
              type="button"
              className="font-black text-foreground underline-offset-8 hover:underline"
              onClick={() => {
                void handleResendOtp();
              }}
            >
              Resend OTP
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
