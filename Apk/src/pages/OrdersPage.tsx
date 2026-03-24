import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders, type Order } from "@/api";
import { getProductBy_id } from "@/api/product.api";
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productNameMap, setProductNameMap] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getMyOrders();
        console.log("Fetched orders:", res.data);
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length === 0) return;

    const productIds = Array.from(
      new Set(
        orders.flatMap((order) =>
          order.items
            .filter((item) => !item.product_name)
            .map((item) => item.product_id),
        ),
      ),
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
  }, [orders, productNameMap]);

  const getStatusDetails = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return {
          icon: CheckCircle2,
          color: "text-green-600 bg-green-500/10",
          label: "Delivered",
        };
      case "cancelled":
        return {
          icon: XCircle,
          color: "text-rose-600 bg-rose-500/10",
          label: "Cancelled",
        };
      case "shipped":
        return {
          icon: Truck,
          color: "text-blue-600 bg-blue-500/10",
          label: "Shipped",
        };
      default:
        return {
          icon: Clock,
          color: "text-amber-600 bg-amber-500/10",
          label: status.charAt(0).toUpperCase() + status.slice(1),
        };
    }
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">
            Loading orders...
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden flex-col bg-background pb-32">
      <header className="sticky top-0 z-10 bg-background/80 px-5 pb-4 pt-12 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              to="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground active:scale-95 transition-transform"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black tracking-tight">My Orders</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Recent Transactions
              </p>
            </div>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package className="h-5 w-5" />
          </div>
        </div>
      </header>

      <main className="space-y-4 px-5 pt-6">
        {orders.length === 0 ? (
          <div className="mt-20 text-center flex flex-col items-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 scale-150 bg-primary/10 blur-3xl rounded-full" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-secondary text-primary">
                <ShoppingBag className="h-16 w-16" />
              </div>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              No orders yet
            </h2>
            <p className="mt-2 max-w-[240px] text-sm font-medium text-muted-foreground leading-relaxed">
              When you shop, your order history will appear here.
            </p>
            <Link to="/products" className="mt-8">
              <button className="h-14 rounded-2xl bg-foreground px-10 text-sm font-black text-background shadow-xl shadow-black/10 active:scale-95">
                Explore Products
              </button>
            </Link>
          </div>
        ) : (
          orders.map((order, idx) => {
            const status = getStatusDetails(order.status);
            const StatusIcon = status.icon;
            const firstItemId = order.items[0]?.product_id;
            const firstItemNameFromOrder = order.items[0]?.product_name;
            const firstItemName = firstItemId
              ? firstItemNameFromOrder || productNameMap[firstItemId]
              : undefined;
            const extraItems = Math.max(order.items.length - 1, 0);
            const orderTitle = firstItemName
              ? extraItems > 0
                ? `${firstItemName} +${extraItems} more`
                : firstItemName
              : `Order #${order._id.slice(-6).toUpperCase()}`;

            return (
              <Link
                to={`/orders/${order._id}`}
                key={order._id}
                state={{ order }}
                className="group relative block w-full overflow-hidden rounded-[2rem] border border-border bg-card p-5 transition-all hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary transition-transform group-hover:scale-110">
                      <Package className="h-7 w-7" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-black tracking-tight">
                        {orderTitle}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <StatusIcon
                          className={`h-3 w-3 ${status.color.split(" ")[0]}`}
                        />
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest ${status.color.split(" ")[0]}`}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-black text-primary">
                      ₹{order.final_amount}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {new Date(order.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-black text-primary">
                    View Details <ChevronRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Decorative element */}
                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/5 blur-2xl group-hover:scale-150 transition-transform" />
              </Link>
            );
          })
        )}
      </main>
    </div>
  );
}

export default OrdersPage;
