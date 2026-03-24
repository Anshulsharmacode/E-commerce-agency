import { useState, useEffect, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { adminApi, PRODUCT_LIMIT } from "../../lib/adminApi";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent } from "../ui/card";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Package,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useForm } from "react-hook-form";

interface Product {
  _id: string;
  name: string;
  category_id: string;
  description?: string;
  image_url?: string;
  selling_price_box: number;
  purchase_price_box: number;
  unit_weight: number;
  pieces_per_box: number;
  is_active: boolean;
  unit: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageStorageValue, setImageStorageValue] = useState("");

  const { register, handleSubmit, reset, setValue } = useForm();

  const extractS3Key = (value?: string) => {
    if (!value) return "";
    if (!/^https?:\/\//i.test(value)) return value;

    try {
      const parsed = new URL(value);
      return decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
    } catch {
      return value;
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([
        adminApi.getProducts(1, PRODUCT_LIMIT),
        adminApi.getCategories(),
      ]);
      setProducts(Array.isArray(productData) ? productData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        image_url: imageStorageValue || undefined,
      };

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct._id, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      setIsDialogOpen(false);
      setEditingProduct(null);
      setImageUrl("");
      setImageStorageValue("");
      reset();
      fetchData();
    } catch (error) {
      console.error("Failed to save product", error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
    setValue("name", product.name);
    setValue("description", product.description ?? "");
    setValue("category_id", product.category_id);
    setValue("selling_price_box", product.selling_price_box);
    setValue("purchase_price_box", product.purchase_price_box);
    setValue("unit_weight", product.unit_weight);
    setValue("pieces_per_box", product.pieces_per_box);
    setValue("unit", product.unit);
    setValue("image_url", product.image_url ?? "");
    setImageUrl(product.image_url ?? "");
    setImageStorageValue(extractS3Key(product.image_url));
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImageUploading(true);
      const uploadData = await adminApi.getProductImageUploadUrl(file.type);
      if (!uploadData?.uploadUrl || !uploadData?.key) {
        throw new Error("Upload URL not received");
      }

      const uploadRes = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Image upload failed");
      }

      setImageUrl(uploadData.viewUrl || uploadData.publicUrl || "");
      setImageStorageValue(uploadData.key);
      setValue("image_url", uploadData.key);
    } catch (error) {
      console.error("Failed to upload product image", error);
      alert("Image upload failed. Please try again.");
    } finally {
      setIsImageUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await adminApi.deleteProduct(id);
        fetchData();
      } catch (error) {
        console.error("Failed to delete product", error);
      }
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      await adminApi.updateProduct(product._id, {
        is_active: !product.is_active,
      });
      fetchData();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Product Inventory
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Manage your agency's product catalog.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchData}
            disabled={isLoading}
            className="rounded-xl border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-all"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
              setEditingProduct(null);
              setImageUrl("");
              setImageStorageValue("");
              reset();
            }
          }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 px-6 py-6 font-bold h-auto">
                <Plus className="mr-2 h-5 w-5" /> Add New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {editingProduct ? "Edit Product" : "Create Product"}
                </DialogTitle>
                <DialogDescription className="font-medium">
                  Fill in the details to {editingProduct ? "update" : "create"}{" "}
                  a product.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5 py-4"
              >
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-bold text-slate-700">
                      Name
                    </Label>
                    <Input
                      id="name"
                      {...register("name", { required: true })}
                      className="rounded-xl border-slate-200 focus:ring-indigo-500 h-11"
                      placeholder="Premium Coffee Box"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="font-bold text-slate-700"
                    >
                      Description
                    </Label>
                    <Input
                      id="description"
                      {...register("description")}
                      className="rounded-xl border-slate-200 focus:ring-indigo-500 h-11"
                      placeholder="Short description..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="category"
                    className="font-bold text-slate-700"
                  >
                    Category
                  </Label>
                  <select
                    id="category"
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium"
                    {...register("category_id", { required: true })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="font-bold text-slate-700">
                      Selling Price
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      {...register("selling_price_box", {
                        required: true,
                        valueAsNumber: true,
                      })}
                      className="rounded-xl border-slate-200 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="purchase_price_box"
                      className="font-bold text-slate-700"
                    >
                      Purchase Price
                    </Label>
                    <Input
                      id="purchase_price_box"
                      type="number"
                      {...register("purchase_price_box", {
                        required: true,
                        valueAsNumber: true,
                      })}
                      className="rounded-xl border-slate-200 h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="unit_weight"
                      className="font-bold text-slate-700"
                    >
                      Unit Weight
                    </Label>
                    <Input
                      id="unit_weight"
                      type="number"
                      step="0.01"
                      {...register("unit_weight", {
                        required: true,
                        valueAsNumber: true,
                      })}
                      className="rounded-xl border-slate-200 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="pieces_per_box"
                      className="font-bold text-slate-700"
                    >
                      Pieces / Box
                    </Label>
                    <Input
                      id="pieces_per_box"
                      type="number"
                      {...register("pieces_per_box", {
                        required: true,
                        valueAsNumber: true,
                      })}
                      className="rounded-xl border-slate-200 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit" className="font-bold text-slate-700">
                    Unit
                  </Label>
                  <select
                    id="unit"
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium"
                    {...register("unit", { required: true })}
                  >
                    <option value="piece">Piece</option>
                    <option value="kg">KG</option>
                    <option value="gram">Gram</option>
                    <option value="liter">Liter</option>
                    <option value="ml">ML</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="product_image"
                    className="font-bold text-slate-700"
                  >
                    Product Image
                  </Label>
                  <Input
                    id="product_image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isImageUploading}
                    className="rounded-xl border-slate-200 h-11"
                  />
                  <input type="hidden" {...register("image_url")} />
                  {isImageUploading ? (
                    <p className="text-xs text-indigo-600 font-semibold">
                      Uploading image...
                    </p>
                  ) : null}
                  {imageUrl ? (
                    <div className="space-y-2">
                      <img
                        src={imageUrl}
                        alt="Product preview"
                        className="h-24 w-24 rounded-lg object-cover border border-slate-200"
                      />
                      <p className="text-[10px] text-slate-500 break-all">
                        {imageUrl}
                      </p>
                    </div>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-100 transition-all mt-4"
                >
                  Save Product
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-80">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                      Product Info
                    </TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                      Category
                    </TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                      Pricing (Box)
                    </TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                      Per Piece
                    </TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                      Specifications
                    </TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                      Status
                    </TableHead>
                    <TableHead className="py-5 text-right font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center h-48 text-slate-400 font-medium"
                      >
                        No products found in your catalog.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow
                        key={product._id}
                        className="hover:bg-slate-50/50 border-slate-50 transition-colors group"
                      >
                        <TableCell>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-400 line-clamp-1">
                              {product.description || "No description"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            {categories.find(
                              (c) => c._id === product.category_id,
                            )?.name || "Unknown"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-400">
                              Sell:{" "}
                              <span className="text-slate-900 font-black text-sm">
                                ₹{product.selling_price_box}
                              </span>
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              Buy: ₹{product.purchase_price_box}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-16 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                            <span className="text-xs font-black text-emerald-700">
                              ₹
                              {(
                                product.selling_price_box /
                                product.pieces_per_box
                              ).toFixed(1)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-[10px] font-bold text-slate-500 space-y-0.5">
                            <p>
                              {product.unit_weight} {product.unit} / unit
                            </p>
                            <p>{product.pieces_per_box} pieces / box</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                              product.is_active
                                ? "bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100"
                                : "bg-red-100 text-red-700 shadow-sm shadow-red-100",
                            )}
                          >
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(product)}
                              className={cn(
                                "text-[10px] font-black uppercase tracking-tighter h-8 px-2 rounded-lg",
                                product.is_active
                                  ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                  : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50",
                              )}
                            >
                              {product.is_active ? "Disable" : "Enable"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(product)}
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(product._id)}
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
