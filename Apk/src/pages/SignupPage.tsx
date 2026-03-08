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
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-2 transition-all duration-300 rounded-full ${
            s === current
              ? 'w-6 bg-foreground'
              : s < current
              ? 'w-2 bg-foreground/40'
              : 'w-2 bg-border'
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
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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

  // Handle each OTP box — auto-move focus to next box
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only numbers allowed
    const next = [...otp];
    next[index] = value.slice(-1); // Only 1 digit per box
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
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user_name', response.user.name);
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

  // ── Shared top header ──────────────────────────────────────────────────
  const Header = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-4">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground shadow-lg">
        <ShoppingBag className="h-8 w-8 text-background" />
      </div>
      <StepDots current={step} />
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );

  // ── Error banner ───────────────────────────────────────────────────────
  const ErrorBanner = () =>
    error ? (
      <div className="flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <span className="mt-0.5">⚠️</span>
        <span>{error}</span>
      </div>
    ) : null;

  // ── Back button ────────────────────────────────────────────────────────
  const BackBtn = ({ to }: { to: number }) => (
    <button
      type="button"
      onClick={() => { setError(''); setStep(to); }}
      className="mb-1 flex items-center gap-1 text-sm text-muted-foreground"
    >
      <ChevronLeft className="h-4 w-4" /> Back
    </button>
  );

  // ── Submit button ──────────────────────────────────────────────────────
  const SubmitBtn = ({ label }: { label: string }) => (
    <Button
      type="submit"
      disabled={isLoading}
      className="mt-2 h-12 w-full rounded-xl bg-foreground text-base font-semibold text-background active:scale-[0.98]"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
          Please wait...
        </span>
      ) : (
        label
      )}
    </Button>
  );

  // ────────────────────────────────────────────────────────────────────────
  // STEP 1 — Personal Info
  // ────────────────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <Header title="Create Account" subtitle="Step 1 of 3 — Personal details" />

        <div className="flex flex-col gap-4 rounded-t-3xl border-t border-border bg-card px-6 pb-10 pt-7 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <form onSubmit={handlePersonalNext} className="flex flex-col gap-4">
            <ErrorBanner />

            <Field label="Full Name" icon={<User className="h-4 w-4" />}>
              <Input
                type="text"
                placeholder="John Doe"
                value={personal.name}
                onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                required
                className="h-12 rounded-xl border-border bg-background pl-10 text-base"
              />
            </Field>

            <Field label="Email Address" icon={<Mail className="h-4 w-4" />}>
              <Input
                type="email"
                placeholder="you@example.com"
                value={personal.email}
                onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                required
                className="h-12 rounded-xl border-border bg-background pl-10 text-base"
              />
            </Field>

            <Field label="Phone Number" icon={<Phone className="h-4 w-4" />}>
              <Input
                type="tel"
                placeholder="10-digit mobile number"
                value={personal.phone}
                onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                required
                className="h-12 rounded-xl border-border bg-background pl-10 text-base"
              />
            </Field>

            <Field label="Password" icon={<Lock className="h-4 w-4" />}>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={personal.password}
                onChange={(e) => setPersonal({ ...personal, password: e.target.value })}
                required
                className="h-12 rounded-xl border-border bg-background pl-10 pr-12 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </Field>

            <Field label="Confirm Password" icon={<Lock className="h-4 w-4" />}>
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={personal.confirmPassword}
                onChange={(e) => setPersonal({ ...personal, confirmPassword: e.target.value })}
                required
                className="h-12 rounded-xl border-border bg-background pl-10 pr-12 text-base"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </Field>

            <SubmitBtn label="Continue →" />

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // STEP 2 — Address
  // ────────────────────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <Header title="Your Address" subtitle="Step 2 of 3 — Delivery address" />

        <div className="flex flex-col gap-4 rounded-t-3xl border-t border-border bg-card px-6 pb-10 pt-7 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <form onSubmit={handleAddressNext} className="flex flex-col gap-4">
            <BackBtn to={1} />
            <ErrorBanner />

            <Field label="Street / Flat / Area" icon={<MapPin className="h-4 w-4" />}>
              <Input
                type="text"
                placeholder="221B Baker Street"
                value={address.line1}
                onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                required
                className="h-12 rounded-xl border-border bg-background pl-10 text-base"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="City" icon={<Building2 className="h-4 w-4" />}>
                <Input
                  type="text"
                  placeholder="Mumbai"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  required
                  className="h-12 rounded-xl border-border bg-background pl-10 text-base"
                />
              </Field>

              <Field label="State" icon={<Globe className="h-4 w-4" />}>
                <Input
                  type="text"
                  placeholder="Maharashtra"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  required
                  className="h-12 rounded-xl border-border bg-background pl-10 text-base"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Country" icon={<Globe className="h-4 w-4" />}>
                <Input
                  type="text"
                  placeholder="India"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  required
                  className="h-12 rounded-xl border-border bg-background pl-10 text-base"
                />
              </Field>

              <Field label="Pincode" icon={<Hash className="h-4 w-4" />}>
                <Input
                  type="text"
                  placeholder="400001"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  required
                  className="h-12 rounded-xl border-border bg-background pl-10 text-base"
                />
              </Field>
            </div>

            <SubmitBtn label="Create Account →" />
          </form>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // STEP 3 — OTP Verification
  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top area */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-4">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground shadow-lg">
          <CheckCircle2 className="h-8 w-8 text-background" />
        </div>
        <StepDots current={3} />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
          Verify Email
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          We sent a 6-digit code to{' '}
          <span className="font-semibold text-foreground">{personal.email}</span>
        </p>
      </div>

      <div className="flex flex-col gap-5 rounded-t-3xl border-t border-border bg-card px-6 pb-10 pt-7 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
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
                className={`h-13 w-12 rounded-xl border text-center text-xl font-bold outline-none transition-all
                  ${digit
                    ? 'border-foreground bg-foreground/5 text-foreground'
                    : 'border-border bg-background text-foreground'
                  }
                  focus:border-foreground focus:ring-2 focus:ring-foreground/20`}
              />
            ))}
          </div>

          <SubmitBtn label="Verify & Continue" />

          <p className="text-center text-sm text-muted-foreground">
            Didn't receive the code?{' '}
            <button
              type="button"
              className="font-semibold text-foreground underline-offset-4 hover:underline"
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
