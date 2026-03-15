import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  FolderTree,
  Loader2,
  Package,
  ReceiptIndianRupee,
  ShoppingCart,
  Tag,
} from "lucide-react";
import api from "../../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Live admin metrics from products, categories, offers, and orders.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardDescription>Total Products</CardDescription>
            <CardTitle className="text-3xl">{isLoading ? "..." : products.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Package className="h-3.5 w-3.5 text-primary" />
              Active: {products.filter((item) => item.is_active).length}
            </span>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardDescription>Total Categories</CardDescription>
            <CardTitle className="text-3xl">{isLoading ? "..." : categories.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <FolderTree className="h-3.5 w-3.5 text-chart-1" />
              Active: {categories.filter((item) => item.is_active).length}
            </span>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardDescription>Offers</CardDescription>
            <CardTitle className="text-3xl">{isLoading ? "..." : offers.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-chart-2" />
              Active now: {activeOffers}
            </span>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardDescription>Order Revenue</CardDescription>
            <CardTitle className="text-3xl">{isLoading ? "..." : formatAmount(totalRevenue)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ShoppingCart className="h-3.5 w-3.5 text-chart-3" />
              Total orders: {orders.length}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-xl">Recent Offers</CardTitle>
            <CardDescription>Latest offers from the backend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="flex h-28 items-center justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : recentOffers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No offers available.</p>
            ) : (
              recentOffers.map((offer) => (
                <div
                  key={offer._id}
                  className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/35 px-3 py-2"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{offer.offer_name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{offer.offer_code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{formatOfferDiscount(offer)}</p>
                    <p className="text-xs text-muted-foreground">
                      Ends {new Date(offer.end_date).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-xl">Recent Orders</CardTitle>
            <CardDescription>Latest incoming orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="flex h-28 items-center justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/35 px-3 py-2"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs capitalize text-muted-foreground">Status: {order.status}</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-sm font-semibold">
                    <ReceiptIndianRupee className="h-4 w-4 text-primary" />
                    {formatAmount(order.final_amount || 0)}
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
