import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Heart } from "lucide-react";
import {
  getAllProducts,
  getMyWishlist,
  toggleLikeProduct,
  addCartItem,
  type Product,
} from "@/api";
import { ProductCard } from "@/components/ProductCard";

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
      // Refresh data
      void loadData();
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
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-card/70 px-5 pb-4 pt-12 backdrop-blur-sm">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Profile
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Heart className="h-5 w-5 text-primary-foreground fill-current" />
          </div>
          <span className="text-lg font-black tracking-tight">My Wishlist</span>
        </div>
      </header>

      <main className="px-5 pt-4">
        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Heart className="h-12 w-12" />
            </div>
            <h2 className="text-xl font-bold">Your wishlist is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tap the heart icon on any product to save it here.
            </p>
            <Link to="/products" className="mt-8">
              <button className="h-12 rounded-2xl bg-foreground px-8 text-sm font-bold text-background shadow-lg">
                Explore Products
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isLiked={true}
                onToggleLike={handleToggleLike}
                onAddToCart={handleAddToCart}
                backTo="/wishlist"
                backLabel="Wishlist"
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default WishlistPage;
