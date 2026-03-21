import type { ComponentType } from "react";
import { IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface Order {
  _id: string;
  user_id: string;
  status: string;
  final_amount: number;
  total_amount?: number;
  total_discount?: number;
  items?: Record<string, unknown>[];
  applied_offers?: Record<string, unknown>[];
  delivery_address?: Record<string, unknown>;
  notes?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  created_by?: string;
  assign_to?: string;
  assign_by?: string;
  created_at?: string;
  updated_at?: string;
}

interface Employee {
  _id: string;
  name: string;
  email: string;
}

type StatusConfig = {
  color: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

interface OrderDetailsModalProps {
  open: boolean;
  order: Order | null;
  employees: Employee[];
  onOpenChange: (open: boolean) => void;
  getStatusConfig: (status: string) => StatusConfig;
}

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (typeof value === "number") {
    return value.toLocaleString("en-IN");
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
};

export default function OrderDetailsModal({
  open,
  order,
  employees,
  onOpenChange,
  getStatusConfig,
}: OrderDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] rounded-3xl border-none shadow-2xl max-h-[85vh] overflow-hidden p-0">
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Order Details
          </DialogTitle>
          <DialogDescription className="font-medium">
            Review order information, assignment, and status.
          </DialogDescription>
        </DialogHeader>
        {order && (
          <div className="mt-4 grid gap-4">
            <div className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Order ID
              </p>
              <p className="text-sm font-bold text-slate-800 break-all">
                {order._id}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Amount
                </p>
                <p className="text-lg font-black text-indigo-600 flex items-center">
                  <IndianRupee className="w-4 h-4" />
                  {order.final_amount}
                </p>
                <div className="mt-2 space-y-1 text-xs text-slate-500 font-semibold">
                  <p>
                    Total:{" "}
                    <span className="text-slate-700">
                      <IndianRupee className="inline w-3 h-3" />
                      {formatValue(order.total_amount)}
                    </span>
                  </p>
                  <p>
                    Discount:{" "}
                    <span className="text-slate-700">
                      <IndianRupee className="inline w-3 h-3" />
                      {formatValue(order.total_discount)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Status
                </p>
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
                    getStatusConfig(order.status).color,
                  )}
                >
                  {(() => {
                    const Icon = getStatusConfig(order.status).icon;
                    return <Icon className="w-3 h-3" />;
                  })()}
                  {getStatusConfig(order.status).label}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Assigned To
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {employees.find((e) => e._id === order.assign_to)?.name ||
                    "Unassigned"}
                </p>
                <p className="text-xs text-slate-500">
                  {employees.find((e) => e._id === order.assign_to)?.email || ""}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Created At
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Unknown"}
                </p>
                <p className="mt-1 text-xs text-slate-500 font-semibold">
                  Updated:{" "}
                  {order.updated_at
                    ? new Date(order.updated_at).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Unknown"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Customer
                </p>
                <p className="text-sm font-bold text-slate-800 break-all">
                  {formatValue(order.user_id)}
                </p>
                <p className="mt-1 text-xs text-slate-500 font-semibold">
                  Created By: {formatValue(order.created_by)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Assignment Meta
                </p>
                <p className="text-sm font-bold text-slate-800 break-all">
                  Assigned By: {formatValue(order.assign_by)}
                </p>
                <p className="mt-1 text-xs text-slate-500 font-semibold">
                  Cancelled By: {formatValue(order.cancelled_by)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Delivery Address
              </p>
              {order.delivery_address &&
              Object.keys(order.delivery_address).length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  {Object.entries(order.delivery_address).map(([key, value]) => (
                    <div key={key} className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm font-semibold text-slate-700 break-words">
                        {formatValue(value)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 font-semibold">
                  No delivery address provided.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Notes
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  {formatValue(order.notes)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Cancellation
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  {formatValue(order.cancellation_reason)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Items
              </p>
              {order.items && order.items.length > 0 ? (
                <div className="grid gap-3">
                  {order.items.map((item, index) => {
                    const itemRecord = item ?? {};
                    const title =
                      (itemRecord.name as string) ||
                      (itemRecord.product_name as string) ||
                      (itemRecord.title as string) ||
                      (itemRecord.product_id
                        ? `Item ${String(itemRecord.product_id).slice(-6)}`
                        : `Item ${index + 1}`);

                    return (
                      <div
                        key={`${title}-${index}`}
                        className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                      >
                        <p className="text-sm font-bold text-slate-900">
                          {title}
                        </p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2 text-xs text-slate-600 font-semibold">
                          {Object.entries(itemRecord).map(([key, value]) => (
                            <div key={key} className="break-words">
                              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                {key.replace(/_/g, " ")}
                              </span>
                              <div className="text-slate-700">
                                {formatValue(value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 font-semibold">
                  No items found for this order.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Applied Offers
              </p>
              {order.applied_offers && order.applied_offers.length > 0 ? (
                <div className="grid gap-3">
                  {order.applied_offers.map((offer, index) => (
                    <div
                      key={`offer-${index}`}
                      className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                    >
                      <div className="grid gap-2 sm:grid-cols-2 text-xs text-slate-600 font-semibold">
                        {Object.entries(offer).map(([key, value]) => (
                          <div key={key} className="break-words">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                              {key.replace(/_/g, " ")}
                            </span>
                            <div className="text-slate-700">
                              {formatValue(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 font-semibold">
                  No offers applied.
                </p>
              )}
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
