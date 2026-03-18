import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Clock, Package } from "lucide-react";
import { getOrderById, type Order } from "@/api";

function EmployeeOrderDetailsPage() {
  const { orderId = "" } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("Order id is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const res = await getOrderById(orderId);
        setOrder(res.data);
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        setError(
          apiErr.response?.data?.message ?? "Failed to load order details.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading order details...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      <header className="flex items-center gap-3 border-b bg-card px-5 py-5">
        <Link to="/employee/orders" className="rounded-full bg-secondary p-2">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold">Assigned Order</h1>
          {order && (
            <p className="text-xs text-muted-foreground">{order._id}</p>
          )}
        </div>
      </header>

      <main className="px-5 pt-5">
        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive">
            {error}
          </div>
        ) : !order ? (
          <div className="rounded-2xl border bg-card px-4 py-5 text-sm text-muted-foreground">
            Order not found.
          </div>
        ) : (
          <div className="space-y-4">
            <section className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  Order #{order._id.slice(-6).toUpperCase()}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    order.status === "DELIVERED"
                      ? "bg-green-100 text-green-700"
                      : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {new Date(order.created_at).toLocaleString()}
              </div>
              {order.assign_by ? (
                <div className="mt-3 rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-muted-foreground">
                  Assigned by: {order.assign_by}
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border bg-card p-4">
              <h2 className="text-sm font-bold">Items</h2>
              <div className="mt-3 space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center justify-between rounded-xl bg-secondary/50 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold">
                          Product {item.product_id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Rs. {item.price_per_box} x {item.quantity_boxes} box
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold">Rs. {item.total_price}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>Rs. {order.total_amount}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-green-600">
                  - Rs. {order.total_discount}
                </span>
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-bold">
                <span>Total</span>
                <span className="text-primary">Rs. {order.final_amount}</span>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default EmployeeOrderDetailsPage;
