import { Link } from "react-router-dom";
import { Heart, Share2, Plus, Star } from "lucide-react";
import type { Product } from "@/api";

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  isLiked?: boolean;
  onToggleLike?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  backTo?: string;
  backLabel?: string;
}

export function ProductCard({
  product,
  categoryName,
  isLiked = false,
  onToggleLike,
  onAddToCart,
  backTo,
  backLabel,
}: ProductCardProps) {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || `Check out ${product.name} on ShopEase!`,
          url: `${window.location.origin}/products/${product._id}`,
        });
      } catch (error) {
        console.log("Error sharing", error);
      }
    } else {
      // Fallback: Copy to clipboard
      void navigator.clipboard.writeText(`${window.location.origin}/products/${product._id}`);
      alert("Link copied to clipboard!");
    }
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleLike?.(product._id);
  };

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product._id);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-border bg-card transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
      <Link
        to={`/products/${product._id}`}
        state={{ product, backTo, backLabel }}
        className="relative h-44 w-full overflow-hidden"
      >
        {product.image_urls?.[0] ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary/50 text-2xl font-black text-primary/20">
            {product.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Badges & Actions */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          <div className="flex h-7 items-center gap-1 rounded-full bg-white/90 px-2.5 backdrop-blur-md shadow-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-black text-foreground">4.8</span>
          </div>
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            onClick={toggleLike}
            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all active:scale-90 ${
              isLiked 
                ? "bg-primary text-primary-foreground" 
                : "bg-white/90 text-foreground hover:bg-primary/10"
            } shadow-sm`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={handleShare}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground backdrop-blur-md shadow-sm transition-all hover:bg-primary/10 active:scale-90"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </Link>

      <div className="p-4 pt-3 flex-1 flex flex-col">
        <p className="line-clamp-1 text-sm font-black tracking-tight text-foreground">
          {product.name}
        </p>
        <p className="mt-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {categoryName || "Premium Collection"}
        </p>
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Price</p>
            <p className="text-base font-black text-primary leading-none">
              ₹{product.selling_price_box}
            </p>
          </div>
          <button
            onClick={addToCart}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg shadow-black/10 active:scale-90 transition-transform"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
