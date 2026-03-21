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
  Search,
  TrendingUp,
  Award,
  Zap,
  Flame,
  Star,
  Truck,
  ShieldCheck,
  Clock,
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
  const [searchQuery, setSearchQuery] = useState("");

  const loadHomeData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [categoryResult, productResult, offerResult] =
        await Promise.allSettled([
          getAllCategories(1, 50),
          getAllProducts(1, 50),
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
    } catch {
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

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return featuredProducts;
    return featuredProducts.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [featuredProducts, searchQuery]);

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

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-secondary/20 pb-24">
      {/* ── Enhanced Header with Search ── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-5 pt-12 pb-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/30">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-foreground block">
                  ShopEase
                </span>
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                  Premium Shopping
                </span>
              </div>
            </div>
            {isLoggedIn ? (
              <Link
                to="/profile"
                className="flex items-center gap-2.5 rounded-2xl border border-border bg-card p-1.5 pr-4 shadow-md active:scale-95 transition-all hover:shadow-lg hover:border-primary/30"
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">
                    Welcome
                  </p>
                  <p className="max-w-24 truncate text-xs font-black text-foreground leading-none">
                    {userName.split(" ")[0]}
                  </p>
                </div>
              </Link>
            ) : (
              <Link to="/login">
                <Button
                  variant="default"
                  size="sm"
                  className="h-11 rounded-2xl bg-gradient-to-r from-primary to-purple-600 px-6 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl border border-border bg-secondary/50 focus:bg-card focus:border-primary/50 outline-none transition-all text-sm font-medium placeholder:text-muted-foreground/70"
            />
          </div>
        </div>
      </header>

      {/* ── Enhanced Banner with CTA ── */}
      <section className="mx-5 mt-6 overflow-hidden rounded-[2.5rem] relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 z-10 pointer-events-none" />
        <img
          src="/banner.jpg"
          alt="banner"
          className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-5 w-5 text-white" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Free Shipping</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">On Orders Over ₹999</h2>
          <Link to="/products">
            <Button
              size="sm"
              className="h-11 rounded-2xl bg-white text-primary font-bold shadow-xl active:scale-95"
            >
              Shop Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Enhanced Categories Section ── */}
      <section className="mt-10 px-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight text-foreground">
              Top Categories
            </h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Explore our collections</p>
          </div>
          <Link
            to="/categories"
            className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary active:scale-95 transition-all hover:bg-primary/10"
          >
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {isLoading
            ? [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-[2rem] bg-secondary animate-pulse"
                />
              ))
            : topCategories.map((category, idx) => (
                <Link
                  key={category._id}
                  to={`/categories/${category._id}`}
                  className="group relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-card to-secondary/30 p-5 active:scale-95 transition-all hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  {/* Icon */}
                  <div className="relative z-10 mb-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                      {getCategoryIcon(category.name)}
                    </div>
                  </div>
                  
                  {/* Text */}
                  <div className="relative z-10">
                    <p className="text-sm font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-muted-foreground leading-tight line-clamp-2">
                      {category.description?.split(".")[0] || "Discover collections"}
                    </p>
                  </div>
                  
                  {/* Decorative Circle */}
                  <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20 blur-2xl group-hover:scale-150 transition-transform duration-500" />
                </Link>
              ))}
        </div>
      </section>

      {/* ── Popular Products Section ── */}
      <section className="mt-12 px-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight text-foreground">
              {searchQuery ? `Results for "${searchQuery}"` : "Popular Now"}
            </h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {searchQuery ? `${filteredProducts.length} products found` : "Trending products this week"}
            </p>
          </div>
          {!searchQuery && (
            <Link
              to="/products"
              className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary active:scale-95 transition-all hover:bg-primary/10"
            >
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        {error && featuredProducts.length === 0 && (
          <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive">
            {error}
          </div>
        )}
        {searchQuery && filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-bold text-foreground">No products found</p>
            <p className="text-xs text-muted-foreground mt-1">Try searching with different keywords</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {isLoading
            ? [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-[2rem] bg-secondary animate-pulse"
                />
              ))
            : filteredProducts.map((product, idx) => (
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
                    backTo="/"
                    backLabel="Home"
                  />
                </div>
              ))}
        </div>
      </section>

      {/* ── Enhanced Offers Section ── */}
      <section className="px-5 mt-10">
        <div className="mb-5">
          <h3 className="text-xl font-black tracking-tight text-foreground">
            Hot Deals & Offers
          </h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Save big on your favorite products</p>
        </div>
        {offers.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-6 mt-2 no-scrollbar snap-x snap-mandatory">
            {offers.map((offer, idx) => (
              <div
                key={offer._id}
                className="min-w-[90%] snap-start relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-purple-600 to-indigo-600 px-7 py-10 text-primary-foreground shadow-2xl shadow-primary/40 active:scale-[0.98] transition-transform"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Animated Background Elements */}
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl animate-pulse" />
                <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-black/10 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-white/5 to-purple-600/10 blur-2xl" />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    {offer.offer_type.toLowerCase().includes('discount') && (
                      <div className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1">
                        <Award className="h-4 w-4 text-white" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">
                          {offer.offer_type}
                        </span>
                      </div>
                    )}
                    {offer.offer_type.toLowerCase().includes('sale') && (
                      <div className="flex items-center gap-1.5 rounded-full bg-yellow-400/30 backdrop-blur-sm px-3 py-1">
                        <Flame className="h-4 w-4 text-yellow-300" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-200">
                          Hot Sale
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-3xl font-black leading-tight mb-3">
                    {offer.offer_name}
                  </h2>
                  <p className="text-sm font-medium text-white/90 mb-5">
                    Use code:{" "}
                    <span className="bg-white text-primary px-3 py-1.5 rounded-xl font-black text-sm shadow-lg">
                      {offer.offer_code}
                    </span>
                  </p>
                  <Button
                    size="lg"
                    onClick={() => setSelectedOffer(offer)}
                    className="h-12 rounded-2xl bg-white text-primary font-bold shadow-xl shadow-black/20 active:scale-95 hover:shadow-2xl"
                  >
                    View Details <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-foreground via-gray-900 to-black px-8 py-12 shadow-2xl relative">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-6 w-6 text-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                  New Collection
                </p>
              </div>
              <h2 className="mt-3 text-4xl font-black leading-[1.1] tracking-tight text-background">
                The Best Products
                <br />
                Only For You
              </h2>
              <div className="flex items-center gap-4 mt-6 mb-8">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold text-white/80">Quality Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold text-white/80">Fast Delivery</span>
                </div>
              </div>
              <Link to="/categories" className="inline-block">
                <Button
                  size="lg"
                  className="h-14 rounded-2xl bg-gradient-to-r from-primary to-purple-600 px-10 text-sm font-black text-white shadow-xl shadow-primary/30 active:scale-95 hover:shadow-2xl hover:shadow-primary/40"
                >
                  Start Exploring <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ── Enhanced Footer CTA ── */}
      {!isLoggedIn && (
        <section className="mx-5 mb-10 mt-12 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-purple-600 to-indigo-600 px-8 py-12 text-center relative shadow-2xl shadow-primary/30">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 h-20 w-20 rounded-full bg-white blur-xl" />
            <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-white blur-2xl" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white">
              Join the Community
            </h3>
            <p className="mt-3 text-sm font-medium text-white/90 max-w-xs mx-auto">
              Sign up now and get{" "}
              <span className="text-white font-black bg-white/20 px-3 py-1 rounded-full">
                20% OFF
              </span>{" "}
              your first order
            </p>
            <div className="flex items-center justify-center gap-4 mt-6 mb-8">
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-white" />
                <span className="text-[10px] font-bold text-white/80 uppercase">Free Shipping</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-white" />
                <span className="text-[10px] font-bold text-white/80 uppercase">Secure Payment</span>
              </div>
            </div>
            <Link to="/signup" className="block">
              <Button className="h-14 w-full rounded-2xl bg-white text-primary font-black text-base shadow-2xl active:scale-[0.98] hover:shadow-3xl">
                Create Account <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
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
