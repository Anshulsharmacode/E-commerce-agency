import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingBag, Boxes } from "lucide-react";
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
          getAllCategories(),
          getAllProducts(200),
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f2f7ff] via-[#f7fafc] to-white text-foreground">
      <div className="px-4 pb-10 pt-6">
        <header className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2.5">
          <Link
            to="/"
            className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Home
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f172a]">
              <ShoppingBag className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight">
                Categories
              </p>
              <p className="text-[11px] text-slate-500">Pick a section</p>
            </div>
          </div>
        </header>

        <section className="mb-4 rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] px-4 py-5 text-white">
          <h1 className="text-[24px] font-semibold leading-[1.15] tracking-tight">
            Find products by category
          </h1>
          <p className="mt-2 text-[13px] leading-5 text-slate-200">
            Browse all sections and open the one you need.
          </p>
          <p className="mt-3 inline-flex rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium">
            {categories.length} categories available
          </p>
        </section>

        {error && (
          <div className="mb-3 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
            No categories available.
          </div>
        ) : (
          <div className="space-y-2.5">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/categories/${category._id}`}
                className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3"
              >
                <div className="mt-0.5 rounded-lg bg-[#eef2ff] p-1.5 text-[#3730a3]">
                  <Boxes className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[14px] font-semibold tracking-tight">
                    {category.name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">
                    {category.description || "Explore this category"}
                  </p>
                  <p className="mt-2 text-[11px] font-medium text-[#334155]">
                    {productCountByCategory[category._id] ?? 0} products
                  </p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoriesPage;
