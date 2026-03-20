import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAssignedOrders, type Order } from "@/api";
import { 
  Package, 
  ChevronRight, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  ArrowLeft,
  LayoutGrid
} from "lucide-react";

function EmployeeOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getAssignedOrders();
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchOrders();
  }, []);

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

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading assigned orders...</p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col bg-background pb-32">
      <header className="sticky top-0 z-10 bg-background/80 px-5 pb-4 pt-12 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground active:scale-95 transition-transform">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tight">Assigned Orders</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Work Queue</p>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LayoutGrid className="h-5 w-5" />
          </div>
        </div>
      </header>

      <main className="px-5 pt-6 space-y-4">
        {orders.length === 0 ? (
          <div className="mt-20 text-center flex flex-col items-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 scale-150 bg-primary/10 blur-3xl rounded-full" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-secondary text-primary">
                <Package className="h-16 w-16" />
              </div>
            </div>
            <h2 className="text-2xl font-black tracking-tight">No tasks assigned</h2>
            <p className="mt-2 max-w-[240px] text-sm font-medium text-muted-foreground leading-relaxed">
              When the admin assigns you orders, they will appear here.
            </p>
          </div>
        ) : (
          orders.map((order, idx) => {
            const status = getStatusDetails(order.status);
            const StatusIcon = status.icon;
            
            return (
              <Link
                to={`/employee/orders/${order._id}`}
                key={order._id}
                className="group relative overflow-hidden rounded-[2rem] border border-border bg-card p-5 transition-all hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Package className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black tracking-tight">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <StatusIcon className={`h-3 w-3 ${status.color.split(' ')[0]}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${status.color.split(' ')[0]}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-primary">₹{order.final_amount}</p>
                    <p className="text-[10px] font-bold text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {order.assign_by && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <UserCheck className="h-3 w-3 text-primary" />
                    <span>Assigned by: {order.assign_by.slice(-6).toUpperCase()}</span>
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-black text-primary">
                    Manage Order <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </main>
    </div>
  );
}

export default EmployeeOrdersPage;
