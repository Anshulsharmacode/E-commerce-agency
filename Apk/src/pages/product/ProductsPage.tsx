import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  ShoppingBag,
  X,
} from "lucide-react";
import {
  addCartItem,
  getAllCategories,
  getAllProducts,
  type Category,
  type Product,
} from "@/api";

const PAGE_SIZE = 8;

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>(
    {},
  );
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    Boolean(localStorage.getItem("token")),
  );

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [productRes, categoryRes] = await Promise.all([
          getAllProducts(300),
          getAllCategories(),
        ]);
        setProducts(productRes.data.filter((product) => product.is_active));
        setCategories(
          categoryRes.data.filter((category) => category.is_active),
        );
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        setError(apiErr.response?.data?.message ?? "Failed to load products.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("token")));
  }, []);

  const categoryNameMap = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, category) => {
      acc[category.category_id] = category.name;
      return acc;
    }, {});
  }, [categories]);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedProducts = products.slice(startIndex, startIndex + PAGE_SIZE);

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];

    const ordered = [
      ...products.filter(
        (product) =>
          product.product_id !== selectedProduct.product_id &&
          product.category_id === selectedProduct.category_id,
      ),
      ...products.filter(
        (product) => product.product_id !== selectedProduct.product_id,
      ),
    ];

    const seen = new Set<string>();
    return ordered
      .filter((product) => {
        if (seen.has(product.product_id)) return false;
        seen.add(product.product_id);
        return true;
      })
      .slice(0, 6);
  }, [products, selectedProduct]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const markImageError = (productId: string) => {
    setImageErrorMap((prev) => ({ ...prev, [productId]: true }));
  };

  const canShowImage = (product: Product) => {
    return (
      Boolean(product.image_urls?.[0]) && !imageErrorMap[product.product_id]
    );
  };

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

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-card/70 px-5 pb-4 pt-12 backdrop-blur-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Home
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground">
            <ShoppingBag className="h-5 w-5 text-background" />
          </div>
          <span className="text-lg font-black tracking-tight">
            All Products
          </span>
        </div>
      </header>

      <section className="px-5">
        {error && (
          <div className="mb-3 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-48 rounded-3xl bg-secondary animate-pulse"
              />
            ))}
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-5 text-sm text-muted-foreground">
            No products found.
          </div>
        ) : (
          <>
            <div className="mb-3 text-xs font-bold text-muted-foreground">
              Showing {startIndex + 1} -{" "}
              {Math.min(startIndex + PAGE_SIZE, products.length)} of{" "}
              {products.length} products
            </div>
            <div className="grid grid-cols-2 gap-4">
              {paginatedProducts.map((product) => (
                <div
                  key={product.product_id}
                  onClick={() => setSelectedProduct(product)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" || e.key === " "
                      ? setSelectedProduct(product)
                      : null
                  }
                  className="overflow-hidden rounded-[2.2rem] border border-border bg-card text-left"
                >
                  {canShowImage(product) ? (
                    <img
                      src={product.image_urls?.[0]}
                      alt={product.name}
                      onError={() => markImageError(product.product_id)}
                      className="h-32 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center bg-secondary text-2xl font-black text-primary/30">
                      {product.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="p-3">
                    <p className="line-clamp-1 text-sm font-black tracking-tight text-foreground">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {categoryNameMap[product.category_id] ?? "Category"}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm font-black text-primary">
                        ₹{product.selling_price_box}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-2 rounded-2xl border border-border bg-card px-3 py-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold disabled:opacity-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <p className="text-xs font-black text-foreground">
                Page {currentPage} / {totalPages}
              </p>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold disabled:opacity-50"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}
      </section>

      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/45"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[88dvh] overflow-y-auto rounded-t-[2rem] bg-background px-4 pb-6 pt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black">Product Details</p>
              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded-lg border border-border p-1.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {canShowImage(selectedProduct) ? (
              <img
                src={selectedProduct.image_urls?.[0]}
                alt={selectedProduct.name}
                onError={() => markImageError(selectedProduct.product_id)}
                className="h-44 w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-44 w-full items-center justify-center rounded-2xl bg-secondary text-3xl font-black text-primary/30">
                {selectedProduct.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="mt-4">
              <p className="text-lg font-black tracking-tight">
                {selectedProduct.name}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {categoryNameMap[selectedProduct.category_id] ?? "Category"}
              </p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
                {selectedProduct.description || "No description available."}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-border bg-card px-3 py-2">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Price / Box
                </p>
                <p className="mt-1 text-base font-black text-primary">
                  ₹{selectedProduct.selling_price_box}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card px-3 py-2">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Pieces / Box
                </p>
                <p className="mt-1 text-base font-black text-foreground">
                  {selectedProduct.pieces_per_box}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleAddToCart(selectedProduct.product_id)}
                className="flex-1 rounded-xl bg-foreground px-3 py-2.5 text-xs font-black text-background"
              >
                Add To Cart
              </button>
              <Link
                to={`/categories/${selectedProduct.category_id}`}
                onClick={() => setSelectedProduct(null)}
                className="flex-1 rounded-xl border border-border px-3 py-2.5 text-center text-xs font-black text-foreground"
              >
                View Category
              </Link>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-sm font-black">More Products</p>
              {relatedProducts.length === 0 ? (
                <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                  No more products available.
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {relatedProducts.map((product) => (
                    <button
                      key={product.product_id}
                      onClick={() => setSelectedProduct(product)}
                      className="min-w-[132px] rounded-xl border border-border bg-card p-2 text-left"
                    >
                      <div className="mb-2 flex h-16 w-full items-center justify-center overflow-hidden rounded-lg bg-secondary">
                        {canShowImage(product) ? (
                          <img
                            src={product.image_urls?.[0]}
                            alt={product.name}
                            onError={() => markImageError(product.product_id)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <p className="line-clamp-1 text-[11px] font-black">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-[10px] font-bold text-primary">
                        ₹{product.selling_price_box}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
