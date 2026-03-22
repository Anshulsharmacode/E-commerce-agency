import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Clock,
  Package,
  X,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowLeft,
  UserCheck,
  CreditCard,
  Edit3,
  ChevronRight,
} from "lucide-react";
import { getOrderById, updateOrderStatus, type Order } from "@/api";

function EmployeeOrderDetailsPage() {
  const { orderId = "" } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Order["status"] | "">(
    "",
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");

  const statusOptions = useMemo(
    () => [
      { value: "pending", label: "Pending" },
      { value: "confirmed", label: "Confirmed" },
      { value: "processing", label: "Processing" },
      { value: "shipped", label: "Shipped" },
      { value: "cancelled", label: "Cancelled" },
    ],
    [],
  );

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
        setSelectedStatus(res.data.status);
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">
            Loading task details...
          </p>
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
          <Link
            to="/employee/orders"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground active:scale-95 transition-transform"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight">
              Order Management
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              ID: {order?._id.slice(-12).toUpperCase()}
            </p>
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
            <p className="mt-4 text-sm font-bold text-muted-foreground">
              Order not found.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Section */}
            <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Current Status
                  </span>
                  <div className="mt-2 flex items-center gap-2">
                    {StatusIcon && (
                      <StatusIcon
                        className={`h-5 w-5 ${status?.color.split(" ")[0]}`}
                      />
                    )}
                    <h2
                      className={`text-xl font-black ${status?.color.split(" ")[0]}`}
                    >
                      {status?.label}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStatusError("");
                    setIsStatusModalOpen(true);
                  }}
                  className="flex h-12 items-center gap-2 rounded-2xl bg-primary px-4 text-xs font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                >
                  <Edit3 className="h-4 w-4" /> Update
                </button>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Created
                  </span>
                  <p className="mt-1 text-xs font-bold text-foreground">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                {order.assign_by && (
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Assigned By
                    </span>
                    <div className="mt-1 flex items-center gap-1 justify-end">
                      <UserCheck className="h-3 w-3 text-primary" />
                      <p className="text-xs font-bold text-foreground">
                        {order.assign_by.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Items Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Order Items
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  {order.items.length} Items
                </span>
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
                      <p className="text-sm font-black text-foreground">
                        Product {item.product_id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Rs. {item.price_per_box} x {item.quantity_boxes}{" "}
                        {item.quantity_boxes === 1 ? "box" : "boxes"}
                      </p>
                    </div>
                    <p className="text-sm font-black text-primary">
                      Rs. {item.total_price}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Financial Summary */}
            <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest">
                    Order Summary
                  </h3>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-bold">Rs. {order.total_amount}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-bold text-green-600">
                      - Rs. {order.total_discount}
                    </span>
                  </div>
                  <div className="my-2 h-px bg-border/50" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Final Amount
                    </span>
                    <p className="text-xl font-black text-primary">
                      Rs. {order.final_amount}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ── Enhanced Status Modal ── */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-[2.5rem] bg-card p-6 shadow-2xl border border-border animate-in slide-in-from-bottom-10 duration-500">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  Control Panel
                </p>
                <h3 className="mt-1 text-2xl font-black tracking-tight text-foreground">
                  Update Status
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsStatusModalOpen(false);
                  setStatusError("");
                }}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-muted-foreground active:scale-95 transition-transform"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                  Select New Status
                </label>
                <div className="relative">
                  <select
                    className="h-16 w-full appearance-none rounded-2xl border border-border bg-secondary/50 px-5 text-sm font-black text-foreground focus:border-primary focus:outline-none transition-all"
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as Order["status"])
                    }
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-muted-foreground" />
                </div>
              </div>

              {statusError && (
                <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive animate-in shake-in">
                  {statusError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setIsStatusModalOpen(false)}
                  className="h-14 flex-1 rounded-2xl border border-border bg-card text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button
                  disabled={isUpdating}
                  onClick={async () => {
                    if (!order) return;
                    if (!selectedStatus) {
                      setStatusError("Please select a status.");
                      return;
                    }
                    setIsUpdating(true);
                    setStatusError("");
                    try {
                      const res = await updateOrderStatus(order._id, {
                        status: selectedStatus,
                      });
                      setOrder(res.data);
                      setIsStatusModalOpen(false);
                    } catch (err) {
                      setStatusError(
                        "Failed to update status. Please try again.",
                      );
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                  className="h-14 flex-1 rounded-2xl bg-foreground text-xs font-black uppercase tracking-widest text-background shadow-xl shadow-black/10 disabled:opacity-50 active:scale-95 transition-transform"
                >
                  {isUpdating ? "Updating..." : "Save Status"}
                </button>
              </div>

              <p className="text-center text-[10px] font-medium text-muted-foreground italic">
                Note: "Delivered" status can only be set by administrators.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeOrderDetailsPage;
