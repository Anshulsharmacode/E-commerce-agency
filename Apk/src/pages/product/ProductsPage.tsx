import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import {
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
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>(
    {},
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

  const markImageError = (productId: string) => {
    setImageErrorMap((prev) => ({ ...prev, [productId]: true }));
  };

  const canShowImage = (product: Product) => {
    return Boolean(product.image_urls?.[0]) && !imageErrorMap[product._id];
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
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  state={{
                    product,
                    backTo: "/products",
                    backLabel: "Products",
                  }}
                  className="overflow-hidden rounded-[2.2rem] border border-border bg-card text-left"
                >
                  {canShowImage(product) ? (
                    <img
                      src={product.image_urls?.[0]}
                      alt={product.name}
                      onError={() => markImageError(product._id)}
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
                </Link>
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
    </div>
  );
}

export default ProductsPage;
