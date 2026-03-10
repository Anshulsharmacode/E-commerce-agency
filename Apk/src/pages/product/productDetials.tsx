import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronLeft, Package, ShoppingBag } from "lucide-react";
import {
  addCartItem,
  getAllCategories,
  getAllProducts,
  type Category,
  type Product,
} from "@/api";

const inr = new Intl.NumberFormat("en-IN");

type ProductDetailsState = {
  product?: Product;
  backTo?: string;
  backLabel?: string;
};

type ProductDetailsViewProps = {
  product: Product;
  categoryName?: string;
  onAddToCart?: (productId: string) => void;
};

export function ProductDetailsView({
  product,
  categoryName,
  onAddToCart,
}: ProductDetailsViewProps) {
  return (
    <>
      {product.image_urls?.[0] ? (
        <img
          src={product.image_urls[0]}
          alt={product.name}
          className="h-56 w-full rounded-3xl object-cover"
        />
      ) : (
        <div className="flex h-56 w-full items-center justify-center rounded-3xl bg-slate-100 text-5xl font-semibold text-slate-500">
          {product.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="mt-4">
        <p className="text-[24px] font-semibold leading-tight tracking-tight text-slate-900">
          {product.name}
        </p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          {categoryName ?? "Category"}
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {product.description || "No description available for this product."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Price / Box
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              Rs. {inr.format(product.selling_price_box)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Pieces / Box
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {product.pieces_per_box}
            </p>
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Unit
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {product.unit}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Weight / Unit
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {product.unit_weight}
            </p>
          </div>
        </div>

        {onAddToCart && (
          <button
            onClick={() => onAddToCart(product._id)}
            className="mt-4 w-full rounded-2xl bg-[#0f172a] px-4 py-3 text-sm font-semibold text-white"
          >
            Add To Cart
          </button>
        )}
      </div>
    </>
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
  const [isLoading, setIsLoading] = useState(!state?.product);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError("Product id is missing.");
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const [productRes, categoryRes] = await Promise.all([
          getAllProducts(300),
          getAllCategories(),
        ]);
        const activeProducts = productRes.data.filter((item) => item.is_active);
        const selected = activeProducts.find((item) => item._id === productId);

        if (!selected) {
          setError("Product not found.");
          setProduct(null);
        } else {
          setProduct(selected);
        }

        setCategories(categoryRes.data);
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        setError(
          apiErr.response?.data?.message ?? "Failed to load product details.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadProduct();
  }, [productId]);

  const categoryName = useMemo(() => {
    if (!product) return undefined;
    return categories.find((item) => item._id === product.category_id)?.name;
  }, [categories, product]);

  const handleAddToCart = async (selectedProductId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f2f7ff] via-[#f7fafc] to-white text-foreground">
      <div className="px-4 pb-10 pt-6">
        <header className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2.5">
          <Link
            to={state?.backTo ?? "/products"}
            className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-3.5 w-3.5" />{" "}
            {state?.backLabel ?? "Products"}
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f172a]">
              <ShoppingBag className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">
              Product Details
            </span>
          </div>
        </header>

        {error && (
          <div className="mb-3 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
            Loading product...
          </div>
        ) : product ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <ProductDetailsView
              product={product}
              categoryName={categoryName}
              onAddToCart={handleAddToCart}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
            No product found.
          </div>
        )}

        {product && (
          <Link
            to={`/categories/${product.category_id}`}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
          >
            <Package className="h-4 w-4" /> View Category Products
          </Link>
        )}
      </div>
    </div>
  );
}

export default ProductDetialsPage;
