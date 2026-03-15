import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OfferDetailsModal from "@/components/OfferDetailsModal";
import {
  getAllCategories,
  getAllProducts,
  getActiveOffers,
  addCartItem,
  getMyWishlist,
  toggleLikeProduct,
  type Category,
  type Product,
  type Offer,
} from "@/api";
import {
  ShoppingBag,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [likedProductIds, setLikedProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    Boolean(localStorage.getItem("token")),
  );
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const loadHomeData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [categoryResult, productResult, offerResult] = await Promise.allSettled([
        getAllCategories(),
        getAllProducts(60),
        getActiveOffers(),
      ]);

      if (categoryResult.status === "fulfilled") {
        setCategories(
          categoryResult.value.data.filter((category) => category.is_active),
        );
      } else {
        setCategories([]);
      }

      if (productResult.status === "fulfilled") {
        setProducts(
          productResult.value.data.filter((product) => product.is_active),
        );
      } else {
        const apiErr = productResult.reason as {
          response?: { data?: { message?: string } };
        };
        setProducts([]);
        setError(apiErr.response?.data?.message ?? "Failed to load products.");
      }

      if (offerResult.status === "fulfilled") {
        setOffers(offerResult.value.data);
      } else {
        setOffers([]);
      }

      if (isLoggedIn) {
        try {
          const wishlistRes = await getMyWishlist();
          setLikedProductIds(wishlistRes.data || []);
        } catch {
          setLikedProductIds([]);
        }
      } else {
        setLikedProductIds([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadHomeData();
  }, [isLoggedIn]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(Boolean(token));
    setUserName(localStorage.getItem("user_name") ?? "");
  }, []);

  const handleAddToCart = async (productId: string) => {
    if (!isLoggedIn) {
      alert("Please login to add items to cart");
      return;
    }
    try {
      await addCartItem({ product_id: productId, quantity_boxes: 1 });
      alert("Added to cart!");
    } catch (err: unknown) {
      alert("Failed to add to cart");
    }
  };

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

  const categoryNameMap = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, category) => {
      acc[category._id] = category.name;
      return acc;
    }, {});
  }, [categories]);

  const topCategories = categories.slice(0, 4);
  const featuredProducts = products.slice(0, 10);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 pb-4 pt-12 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <ShoppingBag className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-foreground block leading-none">
              ShopEase
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Premium Store
            </span>
          </div>
        </div>
        {isLoggedIn ? (
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-1.5 pr-4 shadow-sm active:scale-95 transition-transform"
          >
            <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold text-primary">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-0.5">
                Welcome
              </p>
              <p className="max-w-20 truncate text-xs font-bold text-foreground leading-none">
                {userName.split(" ")[0]}
              </p>
            </div>
          </Link>
        ) : (
          <Link to="/login">
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-2xl border-border px-5 text-sm font-bold text-foreground"
            >
              Sign In
            </Button>
          </Link>
        )}
      </header>

      {/* for banner  */}
      <section className="mx-5 mt-6 overflow-hidden rounded-[2.5rem] border-2 border-primary/10 bg-primary/5">
        <img
          src="/banner.jpg"
          alt="banner"
          className="w-full h-full object-cover"
        />
      </section>

      {/* ── Categories ── */}
      <section className="mt-8 px-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tight text-foreground">
            Top Categories
          </h3>
          <Link
            to="/categories"
            className="flex items-center gap-1 text-xs font-bold text-primary"
          >
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {isLoading
            ? [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-3xl bg-secondary animate-pulse"
                />
              ))
            : topCategories.map((category) => (
                <Link
                  key={category._id}
                  to={`/categories/${category._id}`}
                  className="group relative overflow-hidden rounded-[2rem] border border-border bg-card p-5 active:scale-95 transition-all hover:border-primary/30"
                >
                  <div className="relative z-10">
                    <p className="text-sm font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-muted-foreground leading-tight">
                      {category.description?.split(".")[0] ||
                        "Discover collections"}
                    </p>
                  </div>
                  <div className="absolute -bottom-4 -right-4 h-12 w-12 rounded-full bg-primary/5 group-hover:scale-[3] transition-transform duration-500" />
                </Link>
              ))}
        </div>
      </section>

      {/* ── Popular Products ── */}
      <section className="mt-10 px-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tight text-foreground">
            Popular Now
          </h3>
          <Link
            to="/products"
            className="text-xs font-bold text-muted-foreground"
          >
            See all
          </Link>
        </div>
        {error && featuredProducts.length === 0 && (
          <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {isLoading
            ? [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-48 rounded-3xl bg-secondary animate-pulse"
                />
              ))
            : featuredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  categoryName={categoryNameMap[product.category_id]}
                  isLiked={likedProductIds.includes(product._id)}
                  onToggleLike={handleToggleLike}
                  onAddToCart={handleAddToCart}
                  backTo="/"
                  backLabel="Home"
                />
              ))}
        </div>
      </section>

      {/* ── Offers / Hero ── */}
      <section className="px-5 mt-4">
        <h3 className="text-lg font-black tracking-tight text-foreground">
          Offers & Deals
        </h3>
        {offers.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 mt-4 no-scrollbar">
            {offers.map((offer) => (
              <div
                key={offer._id}
                className="min-w-[85%] relative overflow-hidden rounded-[2rem] bg-primary px-6 py-8 text-primary-foreground shadow-xl shadow-primary/20"
              >
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                    {offer.offer_type}
                  </span>
                  <h2 className="mt-1 text-2xl font-black leading-tight">
                    {offer.offer_name}
                  </h2>
                  <p className="mt-2 text-sm font-medium opacity-80">
                    Use code:{" "}
                    <span className="bg-primary-foreground text-primary px-2 py-0.5 rounded-lg font-black">
                      {offer.offer_code}
                    </span>
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setSelectedOffer(offer)}
                    className="mt-5 rounded-xl bg-primary-foreground text-primary font-bold shadow-lg shadow-black/5 active:scale-95"
                  >
                    View Details <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-black/5 blur-3xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-[2.5rem] bg-foreground px-8 py-10 shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-background/50">
              New Collection
            </p>
            <h2 className="mt-3 text-3xl font-black leading-[1.1] tracking-tight text-background">
              The Best Products
              <br />
              Only For You
            </h2>
            <Link to="/categories" className="inline-block mt-6">
              <Button
                size="lg"
                className="h-12 rounded-2xl bg-primary px-8 text-sm font-black text-primary-foreground shadow-xl shadow-primary/20 active:scale-95"
              >
                Start Exploring
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* ── Footer CTA ── */}
      {!isLoggedIn && (
        <section className="mx-5 mb-10 mt-10 overflow-hidden rounded-[2.5rem] border-2 border-primary/10 bg-primary/5 px-8 py-10 text-center">
          <h3 className="text-xl font-black tracking-tight text-foreground">
            Join the Community
          </h3>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Sign up now and get{" "}
            <span className="text-primary font-black">20% off</span> your first
            order.
          </p>
          <Link to="/signup" className="mt-8 block">
            <Button className="h-14 w-full rounded-2xl bg-foreground text-base font-black text-background shadow-2xl active:scale-[0.98]">
              Create Account
            </Button>
          </Link>
        </section>
      )}

      <OfferDetailsModal
        isOpen={Boolean(selectedOffer)}
        offer={selectedOffer}
        onClose={() => setSelectedOffer(null)}
      />
    </div>
  );
}

export default HomePage;
