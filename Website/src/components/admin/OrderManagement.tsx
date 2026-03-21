import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  PackageCheck,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  Calendar,
  IndianRupee,
  RefreshCw,
} from "lucide-react";
import api from "../../lib/api";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";

interface Order {
  _id: string;
  user_id: string;
  status: string;
  final_amount: number;
  assign_to?: string;
  assign_by?: string;
  created_at?: string;
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

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/70 backdrop-blur-xl rounded-3xl py-20 text-center">
          <p className="text-slate-400 font-medium">
            No orders found in the system.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Card
                key={order._id}
                className="border-none shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row lg:items-stretch">
                    {/* Order Primary Info */}
                    <div className="p-6 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-100">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 tracking-tight">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Calendar className="w-3 h-3" />
                            {new Date(
                              order.created_at || "",
                            ).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase">
                            Amount
                          </span>
                          <span className="text-lg font-black text-indigo-600 flex items-center">
                            <IndianRupee className="w-4 h-4" />
                            {order.final_amount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase">
                            Status
                          </span>
                          <div
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
                              statusConfig.color,
                            )}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Management Controls */}
                    <div className="p-6 flex-1 bg-slate-50/30">
                      <div className="grid sm:grid-cols-2 gap-6">
                        {/* Status Update */}
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Change Status
                          </Label>
                          <div className="flex gap-2">
                            <select
                              className={cn(
                                "flex-1 h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm",
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
                              className="h-11 rounded-xl px-4 font-bold text-xs shadow-sm active:scale-95 transition-transform"
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
                        </div>

                        {/* Assignment */}
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <UserPlus className="w-3 h-3" /> Assign Employee
                          </Label>
                          <div className="flex gap-2">
                            <select
                              className={cn(
                                "flex-1 h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm",
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
                              className="h-11 rounded-xl px-4 font-bold text-xs bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 transition-transform"
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
                      </div>

                      {order.assign_to && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">
                            {employees.find((e) => e._id === order.assign_to)
                              ?.name[0] || "?"}
                          </div>
                          <p className="text-[10px] font-bold text-slate-500">
                            Currently assigned to:{" "}
                            <span className="text-indigo-600">
                              {employees.find((e) => e._id === order.assign_to)
                                ?.name || "Unknown"}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
