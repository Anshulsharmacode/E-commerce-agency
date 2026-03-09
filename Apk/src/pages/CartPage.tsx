import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  getMyCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart, 
  createOrder,
  type Cart 
} from "@/api";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ChevronLeft } from "lucide-react";

function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = async () => {
    setIsLoading(true);
    try {
      const res = await getMyCart();
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

  const handleUpdateQuantity = async (productId: string, currentQty: number, delta: number) => {
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
      // For simplicity, we assume the user has a default address or we prompt for one
      // Here we just use a placeholder address as per API type Record<string, unknown>
      await createOrder({ 
        delivery_address: { type: "DEFAULT" },
        notes: "Ordered from Mobile App" 
      });
      await clearCart();
      setCart(null);
      alert("Order placed successfully!");
    } catch (err) {
      alert("Failed to place order.");
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading cart...</div>;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-32">
      <header className="flex items-center gap-4 border-b bg-card px-5 py-6">
        <Link to="/" className="rounded-full bg-secondary p-2">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Your Cart</h1>
      </header>

      <main className="flex-1 px-5 pt-6">
        {!cart || cart.items.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-secondary p-8 text-primary">
              <ShoppingCart className="h-12 w-12" />
            </div>
            <h2 className="text-lg font-semibold">Your cart is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Looks like you haven't added anything yet.
            </p>
            <Link to="/categories" className="mt-6">
              <Button className="rounded-xl px-8">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.product_id} className="flex gap-4 rounded-2xl border bg-card p-4">
                <div className="flex-1">
                  <h3 className="font-semibold">Product {item.product_id.slice(-4)}</h3>
                  <p className="text-sm text-muted-foreground">Rs. {item.price_per_box} / box</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 rounded-lg bg-secondary px-2 py-1">
                      <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity_boxes, -1)} className="p-1">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-6 text-center font-bold">{item.quantity_boxes}</span>
                      <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity_boxes, 1)} className="p-1">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button onClick={() => handleRemove(item.product_id)} className="text-destructive">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">Rs. {item.total_price}</p>
                </div>
              </div>
            ))}

            <section className="mt-8 rounded-2xl bg-secondary p-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>Rs. {cart.total_amount}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-green-600">- Rs. {cart.total_discount}</span>
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4 font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">Rs. {cart.final_amount}</span>
              </div>
            </section>

            <Button onClick={handleCheckout} className="mt-6 h-14 w-full rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
              Checkout <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default CartPage;
