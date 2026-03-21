import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Boxes, 
  ArrowLeft,
  LayoutGrid,
  TrendingUp,
  Zap,
  Award,
  Flame,
  Star
} from "lucide-react";
import {
  getAllCategories,
  getAllProducts,
  type Category,
  type Product,
} from "@/api";

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [categoryRes, productRes] = await Promise.all([
          getAllCategories(1, 50),
          getAllProducts(1, 50),
        ]);
        setCategories(
          categoryRes.data.filter((category) => category.is_active),
        );
        setProducts(productRes.data.filter((product) => product.is_active));
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        setError(
          apiErr.response?.data?.message ?? "Failed to load categories.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  const productCountByCategory = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, product) => {
      acc[product.category_id] = (acc[product.category_id] ?? 0) + 1;
      return acc;
    }, {});
  }, [products]);

  const getCategoryIcon = (categoryName: string) => {
    const icons: Record<string, React.ReactNode> = {
      fashion: <TrendingUp className="h-6 w-6" />,
      electronics: <Zap className="h-6 w-6" />,
      home: <Award className="h-6 w-6" />,
      beauty: <Flame className="h-6 w-6" />,
    };
    const key = categoryName.toLowerCase();
    return icons[key] || <Star className="h-6 w-6" />;
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading categories...</p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col bg-background pb-32">
      <header className="sticky top-0 z-10 bg-background/80 px-5 pb-4 pt-12 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground active:scale-95 transition-transform">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tight">Explore</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">All Categories</p>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LayoutGrid className="h-5 w-5" />
          </div>
        </div>
      </header>

      <main className="px-5 pt-6">
        <section className="mb-8 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-purple-600 to-indigo-600 px-7 py-10 text-white shadow-2xl shadow-primary/20">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black leading-tight">Find exactly what you need</h2>
            <p className="mt-3 text-sm font-medium text-white/80 leading-relaxed">
              Browse through our curated collections of premium products.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest">
              <Boxes className="h-3.5 w-3.5" />
              {categories.length} Categories Available
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {categories.map((category, idx) => (
            <Link
              key={category._id}
              to={`/categories/${category._id}`}
              className="group relative flex items-center gap-5 rounded-[2rem] border border-border bg-card p-4 transition-all hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                {getCategoryIcon(category.name)}
              </div>
              
              <div className="flex-1">
                <h3 className="text-base font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-xs font-medium text-muted-foreground">
                  {category.description || "Explore this collection"}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                    {productCountByCategory[category._id] ?? 0} Products
                  </span>
                </div>
              </div>
              
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors">
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </div>
              
              {/* Decorative element */}
              <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-primary/5 blur-xl group-hover:scale-150 transition-transform" />
            </Link>
          ))}
        </div>

        {categories.length === 0 && !isLoading && (
          <div className="mt-10 rounded-[2rem] border border-border bg-card p-10 text-center">
            <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-sm font-bold text-muted-foreground">No categories available at the moment.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default CategoriesPage;
