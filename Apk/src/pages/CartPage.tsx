import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  createOrder,
  type Cart,
} from "@/api";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ChevronLeft,
  ShoppingBag,
  CreditCard,
  Ticket,
} from "lucide-react";
import { getProductBy_id } from "@/api/product.api";

function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState("");
  const [productNameMap, setProductNameMap] = useState<Record<string, string>>(
    {},
  );

  const loadCart = async () => {
    setIsLoading(true);
    try {
      const res = await getMyCart();
      // console.log("Cart data:", res.data);
      setCart(res.data);
    } catch (err: unknown) {
      setError("Failed to load cart. Please log in.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCart();
  }, []);

  useEffect(() => {
    if (!cart || cart.items.length === 0) return;

    const productIds = Array.from(
      new Set(cart.items.map((item) => item.product_id)),
    ).filter((id) => !productNameMap[id]);

    if (productIds.length === 0) return;

    let cancelled = false;

    const fetchNames = async () => {
      const results = await Promise.allSettled(
        productIds.map(async (id) => {
          const res = await getProductBy_id(id);
          return [id, res.data.name] as const;
        }),
      );

      if (cancelled) return;

      setProductNameMap((prev) => {
        const next = { ...prev };
        results.forEach((result) => {
          if (result.status === "fulfilled") {
            const [id, name] = result.value;
            next[id] = name;
          }
        });
        return next;
      });
    };

    void fetchNames();

    return () => {
      cancelled = true;
    };
  }, [cart, productNameMap]);

  const handleUpdateQuantity = async (
    productId: string,
    currentQty: number,
    delta: number,
  ) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      await updateCartItem(productId, { quantity_boxes: newQty });
      void loadCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeCartItem(productId);
      void loadCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    try {
      await createOrder({
        delivery_address: { type: "DEFAULT" },
        notes: "Ordered from Mobile App",
      });
      await clearCart();
      setCart(null);
      alert("Order placed successfully!");
    } catch (err) {
      alert("Failed to place order.");
    }
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">
            Loading your cart...
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col bg-background pb-32">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background/80 px-5 pb-4 pt-12 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground active:scale-95 transition-transform"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-black tracking-tight">Your Cart</h1>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShoppingBag className="h-5 w-5" />
        </div>
      </header>

      <main className="flex-1 px-5 pt-6">
        {!cart || cart.items.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 scale-150 bg-primary/10 blur-3xl rounded-full" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-secondary text-primary">
                <ShoppingCart className="h-16 w-16" />
              </div>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              Your cart is empty
            </h2>
            <p className="mt-2 max-w-[240px] text-sm font-medium text-muted-foreground leading-relaxed">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/categories" className="mt-8">
              <Button className="h-14 rounded-2xl bg-foreground px-10 text-sm font-black text-background shadow-xl shadow-black/10 active:scale-95">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-muted-foreground">
                {cart.items.length} {cart.items.length === 1 ? "Item" : "Items"}
              </span>
              <button
                onClick={async () => {
                  if (confirm("Clear your cart?")) {
                    await clearCart();
                    void loadCart();
                  }
                }}
                className="text-[10px] font-black uppercase tracking-widest text-destructive hover:opacity-80"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              {cart.items.map((item) => {
                const productName = productNameMap[item.product_id];
                const productInitial = (productName ?? item.product_id)
                  .charAt(0)
                  .toUpperCase();

                return (
                  <div
                    key={item.product_id}
                    className="group relative flex gap-4 rounded-[2rem] border border-border bg-card p-4 transition-all hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
                  >
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-secondary text-2xl font-black text-primary/20">
                      {productInitial}
                    </div>

                    <div className="flex flex-1 flex-col py-0.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="line-clamp-1 font-black text-foreground">
                            {productName ?? "Loading..."}
                          </h3>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Rs. {item.price_per_box} / box
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.product_id)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/10 text-destructive active:scale-90 transition-transform"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-xl bg-secondary p-1">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.product_id,
                                item.quantity_boxes,
                                -1,
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-foreground shadow-sm active:scale-90 transition-all"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-black">
                            {item.quantity_boxes}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.product_id,
                                item.quantity_boxes,
                                1,
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-foreground shadow-sm active:scale-90 transition-all"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-base font-black text-primary">
                          Rs. {item.total_price}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Promo Code */}
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
              <Ticket className="h-5 w-5 text-primary" />
              <input
                type="text"
                placeholder="Enter promo code"
                className="flex-1 bg-transparent text-sm font-bold placeholder:text-primary/40 focus:outline-none"
              />
              <button className="text-xs font-black uppercase tracking-widest text-primary">
                Apply
              </button>
            </div>

            <section className="relative mt-8 overflow-hidden rounded-[2.5rem] border border-border bg-card p-6 shadow-xl shadow-black/5">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />

              <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                <CreditCard className="h-4 w-4" /> Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold">Rs. {cart.total_amount}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-bold text-green-600">
                    - Rs. {cart.total_discount}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>

                <div className="my-2 h-px bg-border/50" />

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Total Amount
                    </span>
                    <p className="text-2xl font-black text-primary">
                      Rs. {cart.final_amount}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="mt-6 h-16 w-full rounded-2xl bg-foreground text-base font-black text-background shadow-2xl shadow-black/20 active:scale-[0.98] transition-all"
              >
                Place Order <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default CartPage;
