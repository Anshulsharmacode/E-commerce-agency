import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import {
  getAllProducts,
  getMyWishlist,
  toggleLikeProduct,
  addCartItem,
  type Product,
} from "@/api";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productRes, userRes] = await Promise.all([
        getAllProducts(300),
        getMyWishlist(),
      ]);
      const likedIds = userRes.data || [];
      setProducts(productRes.data.filter((p) => likedIds.includes(p._id)));
    } catch (err) {
      setError("Failed to load wishlist. Please login.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleToggleLike = async (productId: string) => {
    try {
      await toggleLikeProduct(productId);
      // Refresh data locally for better UX
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      alert("Failed to update wishlist");
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addCartItem({ product_id: productId, quantity_boxes: 1 });
      alert("Added to cart!");
    } catch (err) {
      alert("Failed to add to cart");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-32">
      <header className="sticky top-0 z-10 bg-background/80 px-5 pb-4 pt-12 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground active:scale-95 transition-transform">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tight">Wishlist</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{products.length} Saved Items</p>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <Heart className="h-5 w-5 fill-current" />
          </div>
        </div>
      </header>

      <main className="px-5 pt-6">
        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 scale-150 bg-rose-500/10 blur-3xl rounded-full" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-secondary text-rose-500">
                <Heart className="h-16 w-16" />
              </div>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Your wishlist is empty</h2>
            <p className="mt-2 max-w-[240px] text-sm font-medium text-muted-foreground leading-relaxed">
              Tap the heart icon on any product to save it here for later.
            </p>
            <Link to="/products" className="mt-8">
              <Button className="h-14 rounded-2xl bg-foreground px-10 text-sm font-black text-background shadow-xl shadow-black/10 active:scale-95">
                Explore Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product, idx) => (
              <div
                key={product._id}
                className="animate-in fade-in zoom-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <ProductCard
                  product={product}
                  isLiked={true}
                  onToggleLike={handleToggleLike}
                  onAddToCart={handleAddToCart}
                  backTo="/wishlist"
                  backLabel="Wishlist"
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default WishlistPage;
