import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  ChevronRight,
  Star,
  Truck,
  Tag,
  ArrowRight,
} from 'lucide-react';

function HomePage() {
  const categories = [
    { label: 'Electronics', emoji: '📱' },
    { label: 'Fashion', emoji: '👗' },
    { label: 'Home', emoji: '🏠' },
    { label: 'Beauty', emoji: '💄' },
  ];

  const features = [
    {
      icon: <Truck className="h-5 w-5" />,
      title: 'Fast Delivery',
      desc: 'Get orders at your door quickly',
    },
    {
      icon: <Tag className="h-5 w-5" />,
      title: 'Best Prices',
      desc: 'Competitive deals every day',
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: 'Top Quality',
      desc: 'Only verified products',
    },
  ];

  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-background">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 pb-4 pt-12">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground">
            <ShoppingBag className="h-5 w-5 text-background" />
          </div>
          <span className="text-lg font-bold text-foreground">ShopEase</span>
        </div>
        <Link to="/login">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-border px-4 text-sm font-medium text-foreground"
          >
            Sign In
          </Button>
        </Link>
      </header>

      {/* ── Hero Banner ── */}
      <section className="mx-5 mt-2 overflow-hidden rounded-3xl bg-foreground px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-background/60">
          New Arrivals
        </p>
        <h2 className="mt-2 text-2xl font-bold leading-tight text-background">
          Shop the Best{`\n`}Products Today
        </h2>
        <p className="mt-2 text-sm text-background/60">
          Discover amazing deals at great prices.
        </p>
        <Link to="/products">
          <Button
            size="sm"
            className="mt-5 h-10 rounded-xl bg-background px-5 text-sm font-semibold text-foreground active:scale-[0.97]"
          >
            Browse Products <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* ── Categories ── */}
      <section className="mt-7 px-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Categories</h3>
          <button className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
            See all <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.label}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card py-4 active:scale-95"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs font-medium text-foreground">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="mt-7 px-5">
        <h3 className="mb-3 text-base font-bold text-foreground">Why Shop With Us?</h3>
        <div className="flex flex-col gap-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card px-4 py-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-5 mb-10 mt-7 overflow-hidden rounded-3xl border border-border bg-card px-6 py-7">
        <h3 className="text-lg font-bold text-foreground">Ready to start?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a free account and unlock exclusive deals.
        </p>
        <Link to="/signup" className="mt-5 block">
          <Button className="h-12 w-full rounded-xl bg-foreground text-base font-semibold text-background active:scale-[0.98]">
            Create Free Account
          </Button>
        </Link>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-foreground underline-offset-2 hover:underline">
            Sign In
          </Link>
        </p>
      </section>
    </div>
  );
}

export default HomePage;
