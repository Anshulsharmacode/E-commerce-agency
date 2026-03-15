import { useState, useEffect } from "react";
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
import { Plus, Edit, Trash2, Loader2, RefreshCw } from "lucide-react";
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

  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([
        adminApi.getProducts(PRODUCT_LIMIT),
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
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct._id, data);
      } else {
        await adminApi.createProduct(data);
      }
      setIsDialogOpen(false);
      setEditingProduct(null);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingProduct(null);
                reset();
              }
            }}
          >
            <DialogTrigger>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                <DialogDescription>
                  Enter the product details below. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 py-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...register("name", { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" {...register("description")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                    <Label htmlFor="price">Price (per box)</Label>
                    <Input
                      id="price"
                      type="number"
                      {...register("selling_price_box", {
                        required: true,
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchase_price_box">Purchase Price</Label>
                    <Input
                      id="purchase_price_box"
                      type="number"
                      {...register("purchase_price_box", {
                        required: true,
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit_weight">Unit Weight</Label>
                    <Input
                      id="unit_weight"
                      type="number"
                      step="0.01"
                      {...register("unit_weight", {
                        required: true,
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pieces_per_box">Pieces Per Box</Label>
                    <Input
                      id="pieces_per_box"
                      type="number"
                      {...register("pieces_per_box", {
                        required: true,
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <select
                      id="unit"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      {...register("unit", { required: true })}
                    >
                      <option value="piece">Piece</option>
                      <option value="kg">KG</option>
                      <option value="gram">Gram</option>
                      <option value="liter">Liter</option>
                      <option value="ml">ML</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Save Product
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  {/* <TableHead>Price</TableHead> */}
                  <TableHead>Purchase_price_box</TableHead>
                  <TableHead>selling_price_box</TableHead>
                  <TableHead>Selling_price_pices</TableHead>
                  <TableHead>unit_weight</TableHead>

                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center h-24 text-muted-foreground"
                    >
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        {categories.find((c) => c._id === product.category_id)
                          ?.name || "Unknown"}
                      </TableCell>
                      {/* <TableCell>₹{product.selling_price_box}</TableCell> */}
                      <TableCell>₹{product.purchase_price_box}</TableCell>
                      <TableCell>₹{product.selling_price_box}</TableCell>
                      <TableCell>
                        ₹{product.selling_price_box / product.pieces_per_box}
                      </TableCell>
                      <TableCell>{product.unit_weight}</TableCell>
                      <TableCell className="capitalize">
                        {product.unit}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            product.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700",
                          )}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(product)}
                        >
                          {product.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(product._id)}
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
