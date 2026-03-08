import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  getAllCategories,
  getAllProducts,
  type Category,
  type Product,
} from "@/api";
import { ShoppingBag, ChevronRight, ArrowRight } from "lucide-react";

function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem("token")),
  );

  useEffect(() => {
    const loadHomeData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [categoryRes, productRes] = await Promise.all([
          getAllCategories(),
          getAllProducts(60),
        ]);
        setCategories(
          categoryRes.data.filter((category) => category.is_active),
        );
        setProducts(productRes.data.filter((product) => product.is_active));
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        setError(apiErr.response?.data?.message ?? "Failed to load products.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadHomeData();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(Boolean(token));
    setUserName(localStorage.getItem("user_name") ?? "");
  }, []);

  const categoryNameMap = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, category) => {
      acc[category.category_id] = category.name;
      return acc;
    }, {});
  }, [categories]);

  const topCategories = categories.slice(0, 4);
  const featuredProducts = products.slice(0, 6);

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
        {isLoggedIn ? (
          <div className="max-w-36 rounded-xl border border-border bg-card px-3 py-2 text-right">
            <p className="text-[10px] text-muted-foreground">Welcome</p>
            <p className="truncate text-sm font-semibold text-foreground">
              {userName || "User"}
            </p>
          </div>
        ) : (
          <Link to="/login">
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl border-border px-4 text-sm font-medium text-foreground"
            >
              Sign In
            </Button>
          </Link>
        )}
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
        <Link to="/categories">
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
          <Link
            to="/categories"
            className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground"
          >
            See all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-5 text-sm text-muted-foreground">
            Loading categories...
          </div>
        ) : topCategories.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-5 text-sm text-muted-foreground">
            No categories available.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {topCategories.map((category) => (
              <Link
                key={category.category_id}
                to={`/categories/${category.category_id}`}
                className="rounded-2xl border border-border bg-card px-4 py-4 active:scale-95"
              >
                <p className="line-clamp-1 text-sm font-semibold text-foreground">
                  {category.name}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {category.description || "Explore products in this category"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Products ── */}
      <section className="mt-7 px-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Products</h3>
          <Link
            to="/categories"
            className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground"
          >
            See all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {error && (
          <div className="mb-3 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-5 text-sm text-muted-foreground">
            Loading products...
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-5 text-sm text-muted-foreground">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {featuredProducts.map((product) => (
              <Link
                key={product.product_id}
                to={`/categories/${product.category_id}`}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                {product.image_urls?.[0] ? (
                  <img
                    src={product.image_urls[0]}
                    alt={product.name}
                    className="h-24 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-full items-center justify-center bg-muted text-lg font-semibold text-foreground/50">
                    {product.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="p-3">
                  <p className="line-clamp-1 text-sm font-semibold text-foreground">
                    {product.name}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {categoryNameMap[product.category_id] ?? "Category"}
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    Rs. {product.selling_price_box}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      {!isLoggedIn && (
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
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-foreground underline-offset-2 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}

export default HomePage;
