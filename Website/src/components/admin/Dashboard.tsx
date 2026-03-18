import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  FolderTree,
  Loader2,
  Package,
  ReceiptIndianRupee,
  ShoppingCart,
  Tag,
  TrendingUp,
  Clock,
} from "lucide-react";
import api from "../../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";

interface Product {
  _id: string;
  is_active: boolean;
  selling_price_box: number;
}

interface Category {
  _id: string;
  is_active: boolean;
}

interface Offer {
  _id: string;
  offer_name: string;
  offer_code: string;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  end_date: string;
  created_at?: string;
}

interface Order {
  _id: string;
  status: string;
  final_amount: number;
  created_at?: string;
}

const formatOfferDiscount = (offer: Offer) => {
  if (offer.discount_type === "percentage") return `${offer.discount_value}% OFF`;
  if (offer.discount_type === "flat") return `₹${offer.discount_value} OFF`;
  return "Free Product";
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [productsRes, categoriesRes, offersRes, ordersRes] = await Promise.all([
          api.get("/product/all"),
          api.get("/category/all"),
          api.get("/offer/all"),
          api.get("/order/all"),
        ]);

        setProducts(Array.isArray(productsRes.data?.data) ? productsRes.data.data : []);
        setCategories(Array.isArray(categoriesRes.data?.data) ? categoriesRes.data.data : []);
        setOffers(Array.isArray(offersRes.data?.data) ? offersRes.data.data : []);
        setOrders(Array.isArray(ordersRes.data?.data) ? ordersRes.data.data : []);
      } catch (fetchError) {
        console.error("Failed to fetch dashboard data", fetchError);
        setError("Could not load dashboard data. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activeOffers = useMemo(
    () => offers.filter((offer) => offer.is_active).length,
    [offers],
  );

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + (order.final_amount || 0), 0),
    [orders],
  );

  const recentOffers = useMemo(
    () =>
      [...offers]
        .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
        .slice(0, 5),
    [offers],
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
        .slice(0, 5),
    [orders],
  );

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      subValue: `Active: ${products.filter((item) => item.is_active).length}`,
      icon: <Package className="h-5 w-5 text-indigo-600" />,
      color: "bg-indigo-500",
    },
    {
      label: "Total Categories",
      value: categories.length,
      subValue: `Active: ${categories.filter((item) => item.is_active).length}`,
      icon: <FolderTree className="h-5 w-5 text-purple-600" />,
      color: "bg-purple-500",
    },
    {
      label: "Active Offers",
      value: activeOffers,
      subValue: `Out of ${offers.length} total`,
      icon: <Tag className="h-5 w-5 text-pink-600" />,
      color: "bg-pink-500",
    },
    {
      label: "Order Revenue",
      value: formatAmount(totalRevenue),
      subValue: `${orders.length} total orders`,
      icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
          Good Morning, <span className="text-indigo-600">Admin</span>
        </h1>
        <p className="text-slate-500 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Here's what's happening with your agency today.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="relative overflow-hidden border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl group hover:scale-[1.02] transition-all duration-300">
            <div className={cn("absolute top-0 left-0 w-1 h-full", stat.color)} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                {stat.label}
              </CardDescription>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                {isLoading ? "..." : stat.value}
              </div>
              <p className="text-xs font-semibold text-slate-400">
                {stat.subValue}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Offers */}
        <Card className="border-none shadow-2xl shadow-slate-200/60 bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Recent Offers</CardTitle>
                <CardDescription className="text-slate-500">Latest promotions and deals</CardDescription>
              </div>
              <Tag className="w-5 h-5 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : recentOffers.length === 0 ? (
              <div className="py-12 text-center">
                 <p className="text-slate-400">No offers created yet.</p>
              </div>
            ) : (
              recentOffers.map((offer) => (
                <div
                  key={offer._id}
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Tag className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {offer.offer_name}
                      </p>
                      <p className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {offer.offer_code}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600">{formatOfferDiscount(offer)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Ends {new Date(offer.end_date).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-none shadow-2xl shadow-slate-200/60 bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Recent Orders</CardTitle>
                <CardDescription className="text-slate-500">Live incoming transaction stream</CardDescription>
              </div>
              <ShoppingCart className="w-5 h-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-12 text-center">
                 <p className="text-slate-400">No orders received yet.</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ReceiptIndianRupee className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          order.status === "completed" ? "bg-emerald-500" : "bg-amber-500"
                        )} />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {order.status}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">
                      {formatAmount(order.final_amount || 0)}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                       {new Date(order.created_at || "").toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
