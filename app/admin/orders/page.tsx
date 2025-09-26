"use client";

import { useState, useEffect } from "react";
import { Search, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  supabaseService,
  type Transaction,
} from "../../services/supabase-service";
import { formatRupiah } from "@/lib/currency";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;
    if (searchQuery) {
      filtered = orders.filter(
        (t) =>
          t.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.customer?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const dbTransactions = await supabaseService.getTransactionsWithDetails();
      // Sekarang 'setOrders' akan ditemukan dan tidak error lagi
      setOrders(dbTransactions);
      setFilteredOrders(dbTransactions);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) return <div className="p-6">Memuat riwayat pesanan...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Riwayat Pesanan</h1>
          <p className="text-muted-foreground">
            Lacak semua transaksi yang terjadi
          </p>
        </div>
        <Button onClick={loadOrders}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Cari ID Struk atau Nama Pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Struk</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Total Belanja</TableHead>
                <TableHead>Hutang Baru</TableHead>
                <TableHead>Kembalian</TableHead>
                <TableHead>Poin Didapat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">#{order.receiptNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {order.customer?.name || "Tamu"}
                      </div>
                      {order.customer && (
                        <div className="text-sm text-muted-foreground">
                          Hutang Akhir:{" "}
                          {formatRupiah(order.customer.outstanding_debt)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{formatRupiah(order.total)}</TableCell>
                    <TableCell
                      className={
                        order.debt_incurred > 0
                          ? "text-red-600 font-medium"
                          : ""
                      }
                    >
                      {formatRupiah(order.debt_incurred)}
                    </TableCell>
                    <TableCell className="text-green-600">
                      {formatRupiah(order.change)}
                    </TableCell>
                    <TableCell>{order.points_earned} Poin</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    Tidak ada data transaksi ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedOrder}
        onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Detail Transaksi #{selectedOrder?.receiptNumber}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedOrder && formatDate(selectedOrder.created_at)}
            </p>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm pt-2">
              <div>
                <h4 className="font-semibold mb-2">Item Dibeli:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-2">
                  {selectedOrder.transaction_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-muted-foreground"
                    >
                      <span>
                        {item.quantity}x (ID: ...{item.product_id.slice(-6)})
                      </span>
                      <span>{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Total Belanja:</span>
                  <span className="font-medium">
                    {formatRupiah(selectedOrder.total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tunai Dibayar:</span>
                  <span>{formatRupiah(selectedOrder.cash_paid)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kembalian:</span>
                  <span className="text-green-600 font-medium">
                    {formatRupiah(selectedOrder.change)}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Hutang Transaksi Ini:</span>
                  <span
                    className={
                      selectedOrder.debt_incurred > 0
                        ? "text-red-600 font-medium"
                        : ""
                    }
                  >
                    {formatRupiah(selectedOrder.debt_incurred)}
                  </span>
                </div>
                {selectedOrder.customer && (
                  <div className="flex justify-between">
                    <span>Total Hutang Pelanggan:</span>
                    <span className="font-bold">
                      {formatRupiah(selectedOrder.customer.outstanding_debt)}
                    </span>
                  </div>
                )}
              </div>
              <Separator />
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Poin Didapat:</span>
                  <span>{selectedOrder.points_earned} Poin</span>
                </div>
                {selectedOrder.customer && (
                  <div className="flex justify-between">
                    <span>Total Poin Pelanggan:</span>
                    <span className="font-bold">
                      {selectedOrder.customer.loyalty_points} Poin
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
