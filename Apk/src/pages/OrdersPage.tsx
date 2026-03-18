import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders, type Order } from "@/api";
import { Package, ChevronRight, Clock } from "lucide-react";

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getMyOrders();
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchOrders();
  }, []);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading orders...
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col bg-background pb-32">
      <header className="px-5 py-8">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-sm text-muted-foreground">Track your deliveries</p>
      </header>

      <main className="px-5 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders yet.</p>
          </div>
        ) : (
          orders.map((order) => (
            <Link
              to={`/orders/${order._id}`}
              key={order._id}
              className="rounded-2xl border bg-card p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">Rs. {order.final_amount}</p>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground mt-1" />
              </div>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}

export default OrdersPage;
