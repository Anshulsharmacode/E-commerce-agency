import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronLeft, Package, ShoppingBag, Heart, Share2, Star, ShieldCheck, Truck } from "lucide-react";
import {
  addCartItem,
  getAllCategories,
  getAllProducts,
  getMyWishlist,
  toggleLikeProduct,
  type Category,
  type Product,
} from "@/api";
import { Button } from "@/components/ui/button";

const inr = new Intl.NumberFormat("en-IN");

type ProductDetailsState = {
  product?: Product;
  backTo?: string;
  backLabel?: string;
};

type ProductDetailsViewProps = {
  product: Product;
  categoryName?: string;
  isLiked?: boolean;
  onToggleLike?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
};

export function ProductDetailsView({
  product,
  categoryName,
  isLiked = false,
  onToggleLike,
  onAddToCart,
}: ProductDetailsViewProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || `Check out ${product.name} on ShopEase!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing", error);
      }
    } else {
      void navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative">
        {product.image_urls?.[0] ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            className="h-80 w-full rounded-[2.5rem] object-cover shadow-2xl"
          />
        ) : (
          <div className="flex h-80 w-full items-center justify-center rounded-[2.5rem] bg-secondary text-6xl font-black text-primary/10 shadow-inner">
            {product.name.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="absolute right-4 top-4 flex flex-col gap-3">
          <button
            onClick={() => onToggleLike?.(product._id)}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl backdrop-blur-md transition-all active:scale-90 shadow-xl ${
              isLiked 
                ? "bg-primary text-primary-foreground" 
                : "bg-white/90 text-foreground"
            }`}
          >
            <Heart className={`h-6 w-6 ${isLiked ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={handleShare}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-foreground backdrop-blur-md shadow-xl transition-all active:scale-90"
          >
            <Share2 className="h-6 w-6" />
          </button>
        </div>

        <div className="absolute left-4 bottom-4 flex h-8 items-center gap-1.5 rounded-full bg-black/40 px-3 backdrop-blur-md border border-white/20">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-black text-white">4.8 (120 reviews)</span>
        </div>
      </div>

      <div className="mt-8 px-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              {categoryName ?? "Premium Collection"}
            </p>
            <h1 className="mt-1 text-3xl font-black leading-tight tracking-tight text-foreground">
              {product.name}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Price</p>
            <p className="text-2xl font-black text-primary">
              ₹{inr.format(product.selling_price_box)}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-4 overflow-x-auto no-scrollbar pb-2">
           <div className="flex flex-col items-center gap-2 min-w-[100px] rounded-2xl border border-border bg-card p-4">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Warranty</span>
              <span className="text-xs font-black">1 Year</span>
           </div>
           <div className="flex flex-col items-center gap-2 min-w-[100px] rounded-2xl border border-border bg-card p-4">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Delivery</span>
              <span className="text-xs font-black">Free</span>
           </div>
           <div className="flex flex-col items-center gap-2 min-w-[100px] rounded-2xl border border-border bg-card p-4">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-bold uppercase text-muted-foreground">In Stock</span>
              <span className="text-xs font-black">Available</span>
           </div>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Description</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-medium">
            {product.description || "Indulge in the perfect blend of quality and style with this premium product. Designed for those who appreciate the finer things in life, it offers exceptional performance and durability."}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="rounded-[1.5rem] border border-border bg-secondary/30 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Pieces / Box</p>
            <p className="mt-1 text-lg font-black text-foreground">{product.pieces_per_box}</p>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-secondary/30 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Unit Weight</p>
            <p className="mt-1 text-lg font-black text-foreground">{product.unit_weight} {product.unit}</p>
          </div>
        </div>

        {onAddToCart && (
          <button
            onClick={() => onAddToCart(product._id)}
            className="mt-10 w-full h-16 rounded-[2rem] bg-foreground text-background text-base font-black shadow-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
          >
            <ShoppingBag className="h-5 w-5" /> Add To Cart
          </button>
        )}
      </div>
    </div>
  );
}

function ProductDetialsPage() {
  const { productId = "" } = useParams();
  const location = useLocation();
  const state = (location.state as ProductDetailsState | null) ?? null;

  const [product, setProduct] = useState<Product | null>(
    state?.product ?? null,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [likedProductIds, setLikedProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(!state?.product);
  const [error, setError] = useState("");
  const [isLoggedIn] = useState(() => Boolean(localStorage.getItem("token")));

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError("Product id is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const [productResult, categoryResult] = await Promise.allSettled([
          getAllProducts(1, 50),
          getAllCategories(1, 50),
        ]);

        if (productResult.status === "fulfilled") {
          const activeProducts = productResult.value.data.filter(
            (item) => item.is_active,
          );
          const selected = activeProducts.find((item) => item._id === productId);

          if (!selected) {
            setError("Product not found.");
            setProduct(null);
          } else {
            setProduct(selected);
          }
        } else {
          const apiErr = productResult.reason as {
            response?: { data?: { message?: string } };
          };
          setError(
            apiErr.response?.data?.message ?? "Failed to load product details.",
          );
          setProduct(null);
        }

        if (categoryResult.status === "fulfilled") {
          setCategories(categoryResult.value.data);
        } else {
          setCategories([]);
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

    void loadProduct();
  }, [productId, isLoggedIn]);

  const categoryName = useMemo(() => {
    if (!product) return undefined;
    return categories.find((item) => item._id === product.category_id)?.name;
  }, [categories, product]);

  const handleAddToCart = async (selectedProductId: string) => {
    if (!isLoggedIn) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      await addCartItem({ product_id: selectedProductId, quantity_boxes: 1 });
      alert("Added to cart!");
    } catch {
      alert("Failed to add to cart");
    }
  };

  const handleToggleLike = async (id: string) => {
    if (!isLoggedIn) {
      alert("Please login to like products");
      return;
    }
    try {
      const res = await toggleLikeProduct(id);
      setLikedProductIds(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <div className="px-4 pt-6">
        <header className="mb-6 flex items-center justify-between rounded-[1.5rem] border border-border bg-card/50 px-3 py-2.5 backdrop-blur-md sticky top-6 z-20">
          <Link
            to={state?.backTo ?? "/products"}
            className="flex items-center gap-1 text-xs font-black text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />{" "}
            {state?.backLabel ?? "Back"}
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <span className="text-sm font-black tracking-tight uppercase">
              Details
            </span>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-[2.5rem] border border-border bg-card p-8 text-center animate-pulse">
             <div className="h-64 w-full bg-secondary rounded-[2rem] mb-6" />
             <div className="h-8 w-3/4 bg-secondary rounded-lg mb-4" />
             <div className="h-4 w-1/2 bg-secondary rounded-lg" />
          </div>
        ) : product ? (
          <ProductDetailsView
            product={product}
            categoryName={categoryName}
            isLiked={likedProductIds.includes(product._id)}
            onToggleLike={handleToggleLike}
            onAddToCart={handleAddToCart}
          />
        ) : (
          <div className="rounded-[2.5rem] border border-border bg-card px-4 py-10 text-center">
            <p className="text-sm font-bold text-muted-foreground">Product not found.</p>
            <Link to="/products" className="mt-4 inline-block">
               <Button variant="outline">Back to Products</Button>
            </Link>
          </div>
        )}

        {product && (
          <Link
            to={`/categories/${product.category_id}`}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-4 text-sm font-bold text-muted-foreground transition-all active:scale-[0.98]"
          >
            <Package className="h-4 w-4" /> Similar Products
          </Link>
        )}
      </div>
    </div>
  );
}

export default ProductDetialsPage;
