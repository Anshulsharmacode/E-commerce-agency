import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShoppingBag, ArrowLeft, LayoutGrid, Package } from "lucide-react";
import {
  getAllProducts,
  getCategoryById,
  getMyWishlist,
  toggleLikeProduct,
  addCartItem,
  type Category,
  type Product,
} from "@/api";
import { ProductCard } from "@/components/ProductCard";

function CategoryProductsPage() {
  const { categoryId = "" } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [likedProductIds, setLikedProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn] = useState(() => Boolean(localStorage.getItem("token")));

  const loadData = async () => {
    if (!categoryId) {
      setError("Category id is missing.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const [categoryRes, productRes] = await Promise.all([
        getCategoryById(categoryId),
        getAllProducts(1, 50),
      ]);
      setCategory(categoryRes.data);
      setProducts(productRes.data.filter((product) => product.is_active));

      if (isLoggedIn) {
        const wishlistRes = await getMyWishlist();
        setLikedProductIds(wishlistRes.data || []);
      } else {
        setLikedProductIds([]);
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(
        apiErr.response?.data?.message ?? "Failed to load category products.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [categoryId, isLoggedIn]);

  const handleToggleLike = async (productId: string) => {
    if (!isLoggedIn) {
      alert("Please login to like products");
      return;
    }
    try {
      const res = await toggleLikeProduct(productId);
      setLikedProductIds(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!isLoggedIn) {
      alert("Please login to add items to cart");
      return;
    }
    try {
      await addCartItem({ product_id: productId, quantity_boxes: 1 });
      alert("Added to cart!");
    } catch (err) {
      alert("Failed to add to cart");
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => product.category_id === categoryId);
  }, [products, categoryId]);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">
            Loading products...
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col bg-background pb-32">
      <header className="sticky top-0 z-10 bg-background/80 px-5 pb-4 pt-12 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/categories"
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground active:scale-95 transition-transform"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="max-w-[180px] truncate text-xl font-black tracking-tight">
                {category?.name ?? "Collection"}
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {filteredProducts.length} Items Available
              </p>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
      </header>

      <main className="px-5 pt-6">
        <section className="mb-8 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] px-7 py-10 text-white shadow-2xl shadow-black/20">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black leading-tight">
              {category?.name ?? "Products"}
            </h2>
            {category?.description && (
              <p className="mt-3 line-clamp-2 text-sm font-medium text-slate-300 leading-relaxed">
                {category.description}
              </p>
            )}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest">
              <Package className="h-3.5 w-3.5" />
              Premium Quality Guaranteed
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive">
            {error}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-border bg-card p-10 text-center">
            <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-sm font-bold text-muted-foreground">
              No products found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product, idx) => (
              <div
                key={product._id}
                className="animate-in fade-in zoom-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <ProductCard
                  product={product}
                  categoryName={category?.name}
                  isLiked={likedProductIds.includes(product._id)}
                  onToggleLike={handleToggleLike}
                  onAddToCart={handleAddToCart}
                  backTo={`/categories/${categoryId}`}
                  backLabel="Category"
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default CategoryProductsPage;
