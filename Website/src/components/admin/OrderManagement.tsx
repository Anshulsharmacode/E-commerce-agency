import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  PackageCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  IndianRupee,
  RefreshCw,
} from "lucide-react";
import api from "../../lib/api";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import OrderDetailsModal from "./OrderDetailsModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface Order {
  _id: string;
  user_id: string;
  status: string;
  final_amount: number;
  assign_to?: string;
  assign_by?: string;
  created_at?: string;
  total_amount?: number;
  total_discount?: number;
  items?: Record<string, unknown>[];
  applied_offers?: Record<string, unknown>[];
  delivery_address?: Record<string, unknown>;
  notes?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  created_by?: string;
  updated_at?: string;
}

interface Employee {
  _id: string;
  name: string;
  email: string;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<Record<string, boolean>>({});
  const [selectedAssignee, setSelectedAssignee] = useState<
    Record<string, string>
  >({});
  const [selectedStatus, setSelectedStatus] = useState<Record<string, string>>(
    {},
  );
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>(
    {},
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrdersAndEmployees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersRes, employeesRes] = await Promise.all([
        api.get("/order/all"),
        api.get("/user/employees"),
      ]);

      const ordersData = Array.isArray(ordersRes.data?.data)
        ? ordersRes.data.data
        : [];
      const employeesData = Array.isArray(employeesRes.data?.data)
        ? employeesRes.data.data
        : [];

      setOrders(ordersData);
      setEmployees(employeesData);

      const initialAssignees: Record<string, string> = {};
      ordersData.forEach((order: Order) => {
        if (order.assign_to) {
          initialAssignees[order._id] = order.assign_to;
        }
      });
      setSelectedAssignee(initialAssignees);

      const initialStatuses: Record<string, string> = {};
      ordersData.forEach((order: Order) => {
        if (order.status) {
          initialStatuses[order._id] = order.status;
        }
      });
      setSelectedStatus(initialStatuses);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Could not load orders or employees. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndEmployees();
  }, []);

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee._id,
        label: `${employee.name} (${employee.email})`,
      })),
    [employees],
  );

  const handleAssign = async (orderId: string) => {
    const assigneeId = selectedAssignee[orderId];
    if (!assigneeId) {
      setError("Please select an employee to assign.");
      return;
    }

    setAssigning((prev) => ({ ...prev, [orderId]: true }));
    setError(null);

    try {
      const res = await api.patch(`/order/${orderId}/assign`, {
        assign_to: assigneeId,
      });
      const updated = res.data?.data as Order | undefined;
      if (updated) {
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? updated : order)),
        );
      }
    } catch (assignError) {
      console.error(assignError);
      setError("Failed to assign order. Please try again.");
    } finally {
      setAssigning((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleStatusUpdate = async (orderId: string) => {
    const nextStatus = selectedStatus[orderId];
    if (!nextStatus) {
      setError("Please select a status.");
      return;
    }

    setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }));
    setError(null);

    try {
      const res = await api.patch(`/order/${orderId}/status`, {
        status: nextStatus,
      });
      const updated = res.data?.data as Order | undefined;
      if (updated) {
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? updated : order)),
        );
      }
    } catch (statusError) {
      console.error(statusError);
      setError("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "delivered":
        return {
          icon: CheckCircle2,
          color: "text-emerald-600 bg-emerald-50 border-emerald-100",
          label: "Delivered",
        };
      case "cancelled":
        return {
          icon: XCircle,
          color: "text-rose-600 bg-rose-50 border-rose-100",
          label: "Cancelled",
        };
      case "shipped":
        return {
          icon: Truck,
          color: "text-blue-600 bg-blue-50 border-blue-100",
          label: "Shipped",
        };
      case "processing":
        return {
          icon: RefreshCw,
          color: "text-indigo-600 bg-indigo-50 border-indigo-100",
          label: "Processing",
        };
      default:
        return {
          icon: Clock,
          color: "text-amber-600 bg-amber-50 border-amber-100",
          label: status.charAt(0).toUpperCase() + status.slice(1),
        };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <PackageCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Order Management
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Assign and track all customer orders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchOrdersAndEmployees}
            disabled={isLoading}
            className="rounded-xl border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-all"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <OrderDetailsModal
        open={detailsOpen}
        order={selectedOrder}
        employees={employees}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) {
            setSelectedOrder(null);
          }
        }}
        getStatusConfig={getStatusConfig}
      />

      <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-80 items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                      Order
                    </TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                      Date
                    </TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                      Amount
                    </TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                      Status
                    </TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                      Assigned To
                    </TableHead>
                    <TableHead className="py-5 text-right font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center h-48 text-slate-400 font-medium"
                      >
                        No orders found in the system.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => {
                      const statusConfig = getStatusConfig(order.status);
                      const StatusIcon = statusConfig.icon;
                      const assignee = employees.find(
                        (employee) => employee._id === order.assign_to,
                      );

                      return (
                        <TableRow
                          key={order._id}
                          className="hover:bg-slate-50/60 border-slate-50 transition-colors"
                        >
                          <TableCell className="font-bold text-slate-900">
                            <div className="flex flex-col">
                              <span className="text-sm">
                                #{order._id.slice(-6).toUpperCase()}
                              </span>
                              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                {order._id}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-500 font-semibold text-xs">
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString(
                                  "en-IN",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-black text-indigo-600 flex items-center gap-1">
                              <IndianRupee className="w-4 h-4" />
                              {order.final_amount}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
                                statusConfig.color,
                              )}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-bold text-slate-900">
                                {assignee?.name || "Unassigned"}
                              </span>
                              <span className="text-xs text-slate-500">
                                {assignee?.email || "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col gap-2 items-end min-w-[340px]">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setDetailsOpen(true);
                                }}
                              >
                                View Details
                              </Button>
                              <div className="flex gap-2 w-full justify-end">
                                <select
                                  className={cn(
                                    "h-9 min-w-[160px] rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm",
                                    "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all",
                                  )}
                                  value={selectedStatus[order._id] ?? ""}
                                  onChange={(event) =>
                                    setSelectedStatus((prev) => ({
                                      ...prev,
                                      [order._id]: event.target.value,
                                    }))
                                  }
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                <Button
                                  variant="secondary"
                                  className="h-9 px-3 text-[10px] font-black uppercase tracking-widest shadow-sm"
                                  onClick={() => handleStatusUpdate(order._id)}
                                  disabled={updatingStatus[order._id]}
                                >
                                  {updatingStatus[order._id] ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    "Update"
                                  )}
                                </Button>
                              </div>
                              <div className="flex gap-2 w-full justify-end">
                                <select
                                  className={cn(
                                    "h-9 min-w-[160px] rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm",
                                    "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all",
                                  )}
                                  value={selectedAssignee[order._id] ?? ""}
                                  onChange={(event) =>
                                    setSelectedAssignee((prev) => ({
                                      ...prev,
                                      [order._id]: event.target.value,
                                    }))
                                  }
                                >
                                  <option value="">Unassigned</option>
                                  {employeeOptions.map((employee) => (
                                    <option
                                      key={employee.value}
                                      value={employee.value}
                                    >
                                      {employee.label}
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  className="h-9 px-3 text-[10px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                                  onClick={() => handleAssign(order._id)}
                                  disabled={assigning[order._id]}
                                >
                                  {assigning[order._id] ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    "Assign"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
