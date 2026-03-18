import { useEffect, useMemo, useState } from "react";
import { Edit, Loader2, Plus, RefreshCw, Trash2, Tag, Calendar, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { adminApi } from "../../lib/adminApi";
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
      const data = await adminApi.getOffers();
      setOffers(Array.isArray(data) ? data : []);
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
        await adminApi.updateOffer(editingOffer._id, data);
      } else {
        await adminApi.createOffer(data);
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
      await adminApi.deleteOffer(id);
      fetchOffers();
    } catch (error) {
      console.error("Failed to delete offer", error);
    }
  };

  const handleToggleStatus = async (offer: Offer) => {
    try {
      await adminApi.updateOffer(offer._id, {
        is_active: !offer.is_active,
      });
      fetchOffers();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const activeOfferCount = useMemo(
    () => offers.filter((offer) => offer.is_active).length,
    [offers],
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-600 flex items-center justify-center shadow-lg shadow-pink-200">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Campaign Management</h1>
            <p className="text-slate-500 text-sm font-medium">Manage active offers and discount codes.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-50 border border-pink-100 mr-2">
             <Sparkles className="w-4 h-4 text-pink-500" />
             <span className="text-xs font-bold text-pink-700 uppercase tracking-wider">{activeOfferCount} Active Campaigns</span>
          </div>

          <Button variant="outline" size="icon" onClick={fetchOffers} disabled={isLoading} className="rounded-xl border-slate-200 hover:bg-slate-50 hover:text-pink-600 transition-all">
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
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-100 px-6 py-6 font-bold h-auto">
                <Plus className="mr-2 h-5 w-5" /> New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] rounded-3xl border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{editingOffer ? "Edit Campaign" : "New Campaign"}</DialogTitle>
                <DialogDescription className="font-medium">Configure offer details and availability.</DialogDescription>
              </DialogHeader>

              <form className="space-y-5 py-2" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="offer_name" className="font-bold text-slate-700">Campaign Name</Label>
                    <Input id="offer_name" {...register("offer_name", { required: true })} className="rounded-xl border-slate-200 h-11" placeholder="Summer Sale" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offer_code" className="font-bold text-slate-700">Promo Code</Label>
                    <Input id="offer_code" {...register("offer_code", { required: true })} className="rounded-xl border-slate-200 h-11 font-mono uppercase" placeholder="SUMMER24" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="offer_type" className="font-bold text-slate-700">Target Type</Label>
                    <select
                      id="offer_type"
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 font-medium"
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
                    <Label htmlFor="discount_type" className="font-bold text-slate-700">Type</Label>
                    <select
                      id="discount_type"
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 font-medium"
                      {...register("discount_type", { required: true })}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="flat">Flat Amount</option>
                      <option value="free_product">Free Product</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount_value" className="font-bold text-slate-700">Value</Label>
                    <Input
                      id="discount_value"
                      type="number"
                      {...register("discount_value", { required: true, valueAsNumber: true })}
                      className="rounded-xl border-slate-200 h-11"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="font-bold text-slate-700">Starts</Label>
                    <Input id="start_date" type="date" {...register("start_date", { required: true })} className="rounded-xl border-slate-200 h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="font-bold text-slate-700">Ends</Label>
                    <Input id="end_date" type="date" {...register("end_date", { required: true })} className="rounded-xl border-slate-200 h-11" />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-1">
                  <input type="checkbox" id="is_active" className="h-5 w-5 rounded-lg border-slate-300 text-pink-600 focus:ring-pink-500" {...register("is_active")} />
                  <Label htmlFor="is_active" className="font-bold text-slate-700">Enable campaign immediately</Label>
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-lg shadow-lg shadow-pink-100 transition-all mt-4">
                  Save Campaign
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-80 items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-pink-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">Promo Code</TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">Campaign Name</TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">Type</TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">Discount</TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">Duration</TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">Status</TableHead>
                    <TableHead className="py-5 text-right font-bold text-slate-900 uppercase tracking-wider text-[10px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-48 text-center text-slate-400 font-medium">
                        No active campaigns found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    offers.map((offer) => (
                      <TableRow key={offer._id} className="hover:bg-slate-50/50 border-slate-50 transition-colors group">
                        <TableCell>
                          <div className="inline-flex px-3 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-black tracking-widest uppercase">
                            {offer.offer_code}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-slate-900 group-hover:text-pink-600 transition-colors">{offer.offer_name}</TableCell>
                        <TableCell>
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            {offer.offer_type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-black text-pink-600 text-base">{formatDiscount(offer)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(offer.start_date).toLocaleDateString("en-IN")} - {new Date(offer.end_date).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                              offer.is_active 
                                ? "bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100" 
                                : "bg-slate-200 text-slate-500",
                            )}
                          >
                            {offer.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(offer)}
                              className={cn(
                                "text-[10px] font-black uppercase tracking-tighter h-8 px-2 rounded-lg",
                                offer.is_active ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              )}
                            >
                              {offer.is_active ? "Pause" : "Start"}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(offer)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(offer._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
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
