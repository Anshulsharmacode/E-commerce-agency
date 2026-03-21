import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Edit, Loader2, Plus, RefreshCw, Trash2, Users, Mail, Phone, MapPin } from "lucide-react";
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

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  created_at?: string;
}

interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<EmployeeFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      street: "",
      city: "",
      state: "",
      zip: "",
    },
  });

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const list = await adminApi.getEmployees();
      setEmployees(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to fetch employees", error);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const onSubmit = async (data: EmployeeFormData) => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        zip: data.zip,
      },
    };

    try {
      await adminApi.createEmployee(payload);
      setIsDialogOpen(false);
      reset();
      fetchEmployees();
    } catch (error) {
      console.error("Failed to save employee", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Employee Management</h1>
            <p className="text-slate-500 text-sm font-medium">Manage your agency's staff and roles.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchEmployees} 
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
                reset();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 px-6 py-6 font-bold h-auto">
                <Plus className="mr-2 h-5 w-5" /> Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  New Employee
                </DialogTitle>
                <DialogDescription className="font-medium">
                  Create a new staff account with specific roles.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 py-2" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-bold text-slate-700">Full Name</Label>
                    <Input id="name" {...register("name", { required: true })} className="rounded-xl border-slate-200 h-11" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-bold text-slate-700">Email</Label>
                    <Input id="email" type="email" {...register("email", { required: true })} className="rounded-xl border-slate-200 h-11" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-bold text-slate-700">Phone</Label>
                    <Input id="phone" {...register("phone", { required: true })} className="rounded-xl border-slate-200 h-11" placeholder="+91 9876543210" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-bold text-slate-700">Password</Label>
                    <Input id="password" type="password" {...register("password", { required: true })} className="rounded-xl border-slate-200 h-11" placeholder="••••••••" />
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                  <Label className="font-bold text-slate-900 border-b pb-1 border-slate-100 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-500" /> Address Details
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="street" className="text-xs font-bold text-slate-500 uppercase">Street</Label>
                      <Input id="street" {...register("street")} className="rounded-xl border-slate-200 h-10" placeholder="123 Main St" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-xs font-bold text-slate-500 uppercase">City</Label>
                      <Input id="city" {...register("city")} className="rounded-xl border-slate-200 h-10" placeholder="Mumbai" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-xs font-bold text-slate-500 uppercase">State</Label>
                      <Input id="state" {...register("state")} className="rounded-xl border-slate-200 h-10" placeholder="Maharashtra" />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-100 transition-all mt-4">
                  Create Employee
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
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">Employee</TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">Contact</TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">Location</TableHead>
                    <TableHead className="py-5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">Status</TableHead>
                    <TableHead className="py-5 text-right font-bold text-slate-900 uppercase tracking-wider text-[10px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center h-48 text-slate-400 font-medium"
                      >
                        No employees found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee._id} className="hover:bg-slate-50/50 border-slate-50 transition-colors group">
                        <TableCell className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-bold">{employee.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">ID: {employee._id.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 font-medium">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <Mail className="w-3 h-3 text-slate-400" /> {employee.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Phone className="w-3 h-3 text-slate-400" /> {employee.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 font-medium text-xs">
                          {employee.address?.city ? `${employee.address.city}, ${employee.address.state}` : "No address"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                              employee.is_active
                                ? "bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100"
                                : "bg-red-100 text-red-700 shadow-sm shadow-red-100",
                            )}
                          >
                            {employee.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
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
