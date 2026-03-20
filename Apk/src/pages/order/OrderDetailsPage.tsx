import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { 
  ChevronLeft, 
  Clock, 
  Package, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Truck,
  ArrowLeft
} from "lucide-react";
import { getMyOrderById, type Order } from "@/api";

function OrderDetailsPage() {
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
        const res = await getMyOrderById(orderId);
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

  const getStatusDetails = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return { 
          icon: CheckCircle2, 
          color: "text-green-600 bg-green-500/10", 
          label: "Delivered" 
        };
      case "cancelled":
        return { 
          icon: XCircle, 
          color: "text-rose-600 bg-rose-500/10", 
          label: "Cancelled" 
        };
      case "shipped":
        return { 
          icon: Truck, 
          color: "text-blue-600 bg-blue-500/10", 
          label: "Shipped" 
        };
      default:
        return { 
          icon: Clock, 
          color: "text-amber-600 bg-amber-500/10", 
          label: status.charAt(0).toUpperCase() + status.slice(1) 
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading order details...</p>
        </div>
      </div>
    );
  }

  const status = order ? getStatusDetails(order.status) : null;
  const StatusIcon = status?.icon;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-32">
      <header className="sticky top-0 z-10 bg-background/80 px-5 pb-4 pt-12 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-4">
          <Link to="/orders" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground active:scale-95 transition-transform">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight">Order Details</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ID: {order?._id.slice(-12).toUpperCase()}</p>
          </div>
        </div>
      </header>

      <main className="px-5 pt-6">
        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive">
            {error}
          </div>
        ) : !order ? (
          <div className="rounded-[2rem] border border-border bg-card p-10 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-sm font-bold text-muted-foreground">Order not found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Section */}
            <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Status</span>
                  <div className="mt-2 flex items-center gap-2">
                    {StatusIcon && <StatusIcon className={`h-5 w-5 ${status?.color.split(' ')[0]}`} />}
                    <h2 className={`text-xl font-black ${status?.color.split(' ')[0]}`}>{status?.label}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Placed On</span>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {new Date(order.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-3xl" />
            </section>

            {/* Items Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Order Items</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{order.items.length} Items</span>
              </div>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center gap-4 rounded-[1.75rem] border border-border bg-card p-3 shadow-sm"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-secondary text-lg font-black text-primary/20">
                      {item.product_id.slice(-1).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-foreground">Product {item.product_id.slice(-6).toUpperCase()}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Rs. {item.price_per_box} x {item.quantity_boxes} {item.quantity_boxes === 1 ? 'box' : 'boxes'}
                      </p>
                    </div>
                    <p className="text-sm font-black text-primary">Rs. {item.total_price}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Payment & Delivery Summary */}
            <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm overflow-hidden relative">
              <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest">Payment Summary</h3>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-bold">Rs. {order.total_amount}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-bold text-green-600">- Rs. {order.total_discount}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-bold text-green-600">FREE</span>
                  </div>
                  <div className="my-2 h-px bg-border/50" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Paid</span>
                    <p className="text-xl font-black text-primary">Rs. {order.final_amount}</p>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest">Shipping Address</h3>
                </div>
                <div className="rounded-xl bg-secondary/50 p-4">
                   <p className="text-xs font-bold text-foreground">Default Shipping Address</p>
                   <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Delivery instructions: {order.notes || "None provided"}
                   </p>
                </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default OrderDetailsPage;
