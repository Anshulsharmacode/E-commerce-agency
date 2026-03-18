import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, PackageCheck, UserPlus } from "lucide-react";
import api from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

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
  const [selectedAssignee, setSelectedAssignee] = useState<Record<string, string>>({});
  const [selectedStatus, setSelectedStatus] = useState<Record<string, string>>({});
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Order Assignment
        </h1>
        <p className="text-sm text-slate-500">
          View all orders and assign them to employees.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <Card className="border-none shadow-xl shadow-slate-200/60 bg-white/90 backdrop-blur-xl rounded-3xl">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl font-bold text-slate-900">
            All Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              No orders found.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <PackageCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-500">
                        Customer: {order.user_id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-500">
                        Total: ₹{order.final_amount}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-end">
                    <div className="flex flex-1 items-center gap-2">
                      <select
                        className={cn(
                          "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm",
                          "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200",
                        )}
                        value={selectedStatus[order._id] ?? ""}
                        onChange={(event) =>
                          setSelectedStatus((prev) => ({
                            ...prev,
                            [order._id]: event.target.value,
                          }))
                        }
                      >
                        <option value="">Select status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <Button
                      variant="secondary"
                      className="h-10 rounded-xl px-5 text-sm font-semibold"
                      onClick={() => handleStatusUpdate(order._id)}
                      disabled={updatingStatus[order._id]}
                    >
                      {updatingStatus[order._id] ? "Updating..." : "Update"}
                    </Button>
                    <div className="flex flex-1 items-center gap-2">
                      <UserPlus className="h-4 w-4 text-slate-400" />
                      <select
                        className={cn(
                          "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm",
                          "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200",
                        )}
                        value={selectedAssignee[order._id] ?? ""}
                        onChange={(event) =>
                          setSelectedAssignee((prev) => ({
                            ...prev,
                            [order._id]: event.target.value,
                          }))
                        }
                      >
                        <option value="">Select employee</option>
                        {employeeOptions.map((employee) => (
                          <option key={employee.value} value={employee.value}>
                            {employee.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      className="h-10 rounded-xl px-5 text-sm font-semibold"
                      onClick={() => handleAssign(order._id)}
                      disabled={assigning[order._id]}
                    >
                      {assigning[order._id] ? "Assigning..." : "Assign"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
