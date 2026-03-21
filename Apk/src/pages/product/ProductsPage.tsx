import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  ArrowLeft,
  LayoutGrid,
  Filter
} from "lucide-react";
import {
  getAllCategories,
  getAllProducts,
  getMyWishlist,
  toggleLikeProduct,
  addCartItem,
  type Category,
  type Product,
} from "@/api";
import { ProductCard } from "@/components/ProductCard";

const PAGE_SIZE = 8;

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [likedProductIds, setLikedProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoggedIn] = useState(() => Boolean(localStorage.getItem("token")));

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [productRes, categoryRes] = await Promise.all([
        getAllProducts(1, 50),
        getAllCategories(1, 50),
      ]);
      setProducts(productRes.data.filter((product) => product.is_active));
      setCategories(
        categoryRes.data.filter((category) => category.is_active),
      );

      if (isLoggedIn) {
        const wishlistRes = await getMyWishlist();
        setLikedProductIds(wishlistRes.data || []);
      } else {
        setLikedProductIds([]);
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message ?? "Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [isLoggedIn]);

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

  const categoryNameMap = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, category) => {
      acc[category._id] = category.name;
      return acc;
    }, {});
  }, [categories]);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedProducts = products.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading gallery...</p>
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
              <h1 className="text-xl font-black tracking-tight">Gallery</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {products.length} Items Total
              </p>
            </div>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary active:scale-95 transition-transform">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="px-5 pt-6">
        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive">
            {error}
          </div>
        )}

        {paginatedProducts.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-border bg-card p-10 text-center">
            <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-sm font-bold text-muted-foreground">No products found.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, products.length)}
              </span>
              <div className="flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">Live Stock</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {paginatedProducts.map((product, idx) => (
                <div
                  key={product._id}
                  className="animate-in fade-in zoom-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <ProductCard
                    product={product}
                    categoryName={categoryNameMap[product.category_id]}
                    isLiked={likedProductIds.includes(product._id)}
                    onToggleLike={handleToggleLike}
                    onAddToCart={handleAddToCart}
                    backTo="/products"
                    backLabel="Products"
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-10 flex items-center justify-between gap-4 rounded-[2rem] border border-border bg-card p-2 shadow-lg shadow-black/5">
              <button
                onClick={() => {
                  setCurrentPage((prev) => Math.max(1, prev - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className="flex h-12 items-center gap-2 rounded-2xl border border-border px-4 text-xs font-black uppercase tracking-widest disabled:opacity-30 active:scale-95 transition-all"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Page</span>
                <span className="text-sm font-black text-primary">{currentPage} / {totalPages}</span>
              </div>

              <button
                onClick={() => {
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className="flex h-12 items-center gap-2 rounded-2xl bg-foreground px-4 text-xs font-black uppercase tracking-widest text-background disabled:opacity-30 active:scale-95 transition-all"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default ProductsPage;
