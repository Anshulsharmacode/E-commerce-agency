import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ShoppingBag } from "lucide-react";
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
        getAllProducts(300),
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f2f7ff] via-[#f7fafc] to-white text-foreground">
      <div className="px-4 pb-10 pt-6">
        <header className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2.5">
          <Link
            to="/categories"
            className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Categories
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f172a]">
              <ShoppingBag className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="max-w-28 truncate text-[15px] font-semibold tracking-tight">
              {category?.name ?? "Products"}
            </span>
          </div>
        </header>

        <section className="mb-4 rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] px-4 py-5 text-white">
          <h1 className="line-clamp-2 text-[24px] font-semibold leading-[1.15] tracking-tight">
            {category?.name ?? "Category Products"}
          </h1>
          {!error && category?.description && (
            <p className="mt-2 line-clamp-3 text-[13px] leading-5 text-slate-200">
              {category.description}
            </p>
          )}
          <p className="mt-3 inline-flex rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium">
            {filteredProducts.length} active products
          </p>
        </section>

        {error && (
          <div className="mb-3 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
            No products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                categoryName={category?.name}
                isLiked={likedProductIds.includes(product._id)}
                onToggleLike={handleToggleLike}
                onAddToCart={handleAddToCart}
                backTo={`/categories/${categoryId}`}
                backLabel="Category"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryProductsPage;
