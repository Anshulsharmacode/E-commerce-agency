import { useEffect, useMemo, useState } from "react";
import { Edit, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import api from "../../lib/api";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface Offer {
  _id: string;
  offer_name: string;
  offer_code: string;
  offer_type: string;
  discount_value: number;
  discount_type: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface OfferFormData {
  offer_name: string;
  offer_code: string;
  offer_type: string;
  discount_value: number;
  discount_type: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const getTodayISO = () => new Date().toISOString().slice(0, 10);
const getDefaultEndISO = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const formatDiscount = (offer: Offer) => {
  if (offer.discount_type === "percentage") return `${offer.discount_value}%`;
  if (offer.discount_type === "flat") return `₹${offer.discount_value}`;
  return "Free Product";
};

export default function OfferManagement() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<OfferFormData>({
    defaultValues: {
      offer_name: "",
      offer_code: "",
      offer_type: "ORDER",
      discount_type: "percentage",
      discount_value: 0,
      start_date: getTodayISO(),
      end_date: getDefaultEndISO(),
      is_active: true,
    },
  });

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/offer/all");
      setOffers(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error("Failed to fetch offers", error);
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const onSubmit = async (data: OfferFormData) => {
    try {
      if (editingOffer) {
        await api.patch(`/offer/${editingOffer._id}`, data);
      } else {
        await api.post("/offer/create", data);
      }

      setIsDialogOpen(false);
      setEditingOffer(null);
      reset({
        offer_name: "",
        offer_code: "",
        offer_type: "ORDER",
        discount_type: "percentage",
        discount_value: 0,
        start_date: getTodayISO(),
        end_date: getDefaultEndISO(),
        is_active: true,
      });
      fetchOffers();
    } catch (error) {
      console.error("Failed to save offer", error);
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setIsDialogOpen(true);

    setValue("offer_name", offer.offer_name);
    setValue("offer_code", offer.offer_code);
    setValue("offer_type", offer.offer_type);
    setValue("discount_value", offer.discount_value);
    setValue("discount_type", offer.discount_type);
    setValue("start_date", new Date(offer.start_date).toISOString().slice(0, 10));
    setValue("end_date", new Date(offer.end_date).toISOString().slice(0, 10));
    setValue("is_active", offer.is_active);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    try {
      await api.delete(`/offer/${id}`);
      fetchOffers();
    } catch (error) {
      console.error("Failed to delete offer", error);
    }
  };

  const activeOfferCount = useMemo(
    () => offers.filter((offer) => offer.is_active).length,
    [offers],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Offers</h1>
          <p className="text-sm text-muted-foreground">
            Total offers: {offers.length} | Active: {activeOfferCount}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchOffers} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingOffer(null);
                reset({
                  offer_name: "",
                  offer_code: "",
                  offer_type: "ORDER",
                  discount_type: "percentage",
                  discount_value: 0,
                  start_date: getTodayISO(),
                  end_date: getDefaultEndISO(),
                  is_active: true,
                });
              }
            }}
          >
            <DialogTrigger>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>{editingOffer ? "Edit Offer" : "Add New Offer"}</DialogTitle>
                <DialogDescription>Configure offer details with real dates and status.</DialogDescription>
              </DialogHeader>

              <form className="space-y-4 py-2" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="offer_name">Offer Name</Label>
                    <Input id="offer_name" {...register("offer_name", { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offer_code">Offer Code</Label>
                    <Input id="offer_code" {...register("offer_code", { required: true })} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="offer_type">Type</Label>
                    <select
                      id="offer_type"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      {...register("offer_type", { required: true })}
                    >
                      <option value="ORDER">Order</option>
                      <option value="PRODUCT">Product</option>
                      <option value="CATEGORY">Category</option>
                      <option value="BXGY">BXGY</option>
                      <option value="TARGET">Target</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount_type">Discount Type</Label>
                    <select
                      id="discount_type"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      {...register("discount_type", { required: true })}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="flat">Flat Amount</option>
                      <option value="free_product">Free Product</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount_value">Discount Value</Label>
                    <Input
                      id="discount_value"
                      type="number"
                      {...register("discount_value", { required: true, valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input id="start_date" type="date" {...register("start_date", { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input id="end_date" type="date" {...register("end_date", { required: true })} />
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-[color:var(--primary)]" {...register("is_active")} />
                  Keep offer active
                </label>

                <Button type="submit" className="w-full">
                  Save Offer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-border/70">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No offers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  offers.map((offer) => (
                    <TableRow key={offer._id}>
                      <TableCell className="font-mono font-semibold">{offer.offer_code}</TableCell>
                      <TableCell>{offer.offer_name}</TableCell>
                      <TableCell className="text-xs uppercase text-muted-foreground">{offer.offer_type}</TableCell>
                      <TableCell>{formatDiscount(offer)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(offer.start_date).toLocaleDateString("en-IN")} -{" "}
                        {new Date(offer.end_date).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-xs font-medium",
                            offer.is_active ? "bg-chart-5/30 text-foreground" : "bg-muted text-muted-foreground",
                          )}
                        >
                          {offer.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="space-x-2 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(offer)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(offer._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
