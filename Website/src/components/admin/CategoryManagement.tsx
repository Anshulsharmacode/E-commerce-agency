import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Edit, Loader2, Plus, RefreshCw, Trash2, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminApi } from "../../lib/adminApi";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface Category {
  _id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

interface CategoryFormData {
  name: string;
  description?: string;
  is_active: string;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      description: "",
      is_active: "true",
    },
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const list = await adminApi.getCategories();
      setCategories(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (data: CategoryFormData) => {
    const payload = {
      name: data.name,
      description: data.description?.trim() || undefined,
      is_active: data.is_active === "true",
    };

    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory._id, payload);
      } else {
        await adminApi.createCategory(payload);
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      reset({ name: "", description: "", is_active: "true" });
      fetchCategories();
    } catch (error) {
      console.error("Failed to save category", error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
    setValue("name", category.name);
    setValue("description", category.description ?? "");
    setValue("is_active", category.is_active ? "true" : "false");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await adminApi.deleteCategory(id);
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete category", error);
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      await adminApi.updateCategory(category._id, {
        is_active: !category.is_active,
      });
      fetchCategories();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
            <Boxes className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h1>
            <p className="text-slate-500 text-sm font-medium">Manage product groups and taxonomies.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchCategories} 
            disabled={isLoading}
            className="rounded-xl border-slate-200 hover:bg-slate-50 hover:text-purple-600 transition-all"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingCategory(null);
                reset({ name: "", description: "", is_active: "true" });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-100 px-6 py-6 font-bold h-auto">
                <Plus className="mr-2 h-5 w-5" /> Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px] rounded-3xl border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {editingCategory ? "Edit Category" : "New Category"}
                </DialogTitle>
                <DialogDescription className="font-medium">
                  Define category name and visibility.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-5 py-2" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold text-slate-700">Name</Label>
                  <Input id="name" {...register("name", { required: true })} className="rounded-xl border-slate-200 h-11" placeholder="e.g. Beverages" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="font-bold text-slate-700">Description</Label>
                  <Input id="description" {...register("description")} className="rounded-xl border-slate-200 h-11" placeholder="Optional description..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="is_active" className="font-bold text-slate-700">Status</Label>
                  <select
                    id="is_active"
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 font-medium"
                    {...register("is_active", { required: true })}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg shadow-lg shadow-purple-100 transition-all mt-4">
                  Save Category
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
              <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">Name</TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">Description</TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">Status</TableHead>
                    <TableHead className="py-5 text-right font-bold text-slate-900 uppercase tracking-wider text-[10px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center h-48 text-slate-400 font-medium"
                      >
                        No categories found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category._id} className="hover:bg-slate-50/50 border-slate-50 transition-colors group">
                        <TableCell className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                          {category.name}
                        </TableCell>
                        <TableCell className="text-slate-500 font-medium">
                          {category.description || "—"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                              category.is_active
                                ? "bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100"
                                : "bg-red-100 text-red-700 shadow-sm shadow-red-100",
                            )}
                          >
                            {category.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(category)}
                              className={cn(
                                "text-[10px] font-black uppercase tracking-tighter h-8 px-2 rounded-lg",
                                category.is_active ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              )}
                            >
                              {category.is_active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(category)}
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(category._id)}
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
