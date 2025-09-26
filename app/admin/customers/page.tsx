"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  Award,
  Search,
  MoreHorizontal,
  DollarSign,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  supabaseService,
  type Customer,
} from "../../services/supabase-service";
import { formatRupiah } from "@/lib/currency";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  // State untuk hutang
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [payingCustomer, setPayingCustomer] = useState<Customer | null>(null);

  // State baru untuk poin
  const [redeemAmount, setRedeemAmount] = useState<number>(0);
  const [redeemingCustomer, setRedeemingCustomer] = useState<Customer | null>(
    null
  );

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    let results = customers;
    if (searchQuery.trim()) {
      results = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredCustomers(results);
  }, [searchQuery, customers]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const allCustomers = await supabaseService.getCustomers();
      setCustomers(allCustomers);
      setFilteredCustomers(allCustomers);
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const customerData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
    };

    try {
      if (editingCustomer) {
        await supabaseService.updateCustomer(editingCustomer.id, customerData);
      } else {
        await supabaseService.createCustomer(customerData as any);
      }
      resetForm();
      await loadCustomers();
    } catch (error) {
      console.error("Failed to save customer:", error);
      alert("Gagal menyimpan pelanggan. Email mungkin sudah ada.");
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (customerId: string) => {
    try {
      await supabaseService.deleteCustomer(customerId);
      await loadCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "" });
    setEditingCustomer(null);
    setShowAddDialog(false);
  };

  const handlePayDebt = async () => {
    if (!payingCustomer || paymentAmount <= 0) return;
    try {
      await supabaseService.payOffDebt(
        payingCustomer.id,
        paymentAmount,
        payingCustomer.outstanding_debt
      );
      setPayingCustomer(null);
      setPaymentAmount(0);
      await loadCustomers();
    } catch (error) {
      console.error("Failed to pay debt:", error);
      alert("Gagal memproses pembayaran hutang.");
    }
  };

  // Fungsi baru untuk menukar poin
  const handleRedeemPoints = async () => {
    if (!redeemingCustomer || redeemAmount <= 0) return;
    if (redeemAmount > redeemingCustomer.loyalty_points) {
      alert("Poin yang ditukar melebihi poin yang dimiliki.");
      return;
    }
    try {
      await supabaseService.redeemPoints(
        redeemingCustomer.id,
        redeemAmount,
        redeemingCustomer.loyalty_points
      );
      setRedeemingCustomer(null);
      setRedeemAmount(0);
      await loadCustomers();
    } catch (error) {
      console.error("Failed to redeem points:", error);
      alert("Gagal menukar poin.");
    }
  };

  if (loading) return <div className="p-6">Memuat data pelanggan...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            Manajemen Pelanggan
          </h1>
          <p className="text-muted-foreground">
            Kelola informasi, poin, dan hutang pelanggan
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCustomer(null);
            setFormData({ name: "", email: "", phone: "" });
            setShowAddDialog(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pelanggan
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Poin Loyalitas</TableHead>
                <TableHead>Total Hutang</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.email}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      <Award className="h-3 w-3 mr-1" />
                      {customer.loyalty_points} poin
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {customer.outstanding_debt > 0 ? (
                      <span className="text-red-600 font-medium">
                        {formatRupiah(customer.outstanding_debt)}
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setPayingCustomer(customer);
                            setPaymentAmount(customer.outstanding_debt);
                          }}
                          disabled={customer.outstanding_debt <= 0}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Bayar Hutang
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setRedeemingCustomer(customer);
                            setRedeemAmount(0);
                          }}
                          disabled={customer.loyalty_points <= 0}
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Tukar Poin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(customer)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Apakah Anda yakin?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Ini akan
                                menghapus pelanggan secara permanen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(customer.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="name">Nama *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Telepon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!payingCustomer}
        onOpenChange={() => setPayingCustomer(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bayar Hutang untuk {payingCustomer?.name}</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-4">
            <p>
              Total hutang saat ini:{" "}
              <span className="font-bold">
                {formatRupiah(payingCustomer?.outstanding_debt || 0)}
              </span>
            </p>
            <div>
              <Label htmlFor="payment">Jumlah Pembayaran</Label>
              <Input
                id="payment"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayingCustomer(null)}>
              Batal
            </Button>
            <Button onClick={handlePayDebt}>Konfirmasi Pembayaran</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!redeemingCustomer}
        onOpenChange={() => setRedeemingCustomer(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Tukar Poin untuk {redeemingCustomer?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-4">
            <p>
              Total poin saat ini:{" "}
              <span className="font-bold">
                {redeemingCustomer?.loyalty_points || 0} Poin
              </span>
            </p>
            <div>
              <Label htmlFor="redeem">Jumlah Poin untuk Ditukar</Label>
              <Input
                id="redeem"
                type="number"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRedeemingCustomer(null)}
            >
              Batal
            </Button>
            <Button onClick={handleRedeemPoints}>Konfirmasi Penukaran</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
