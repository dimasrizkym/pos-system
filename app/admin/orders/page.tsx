"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Printer, RefreshCw, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  supabaseService,
  type Transaction,
} from "../../services/supabase-service";
import { formatRupiah } from "@/lib/currency";

const orderStatuses = [
  {
    value: "completed",
    label: "Completed",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
  },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Transaction | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;
    if (searchQuery) {
      filtered = orders.filter(
        (order) =>
          order.receiptNumber
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          order.customer?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }
    setFilteredOrders(filtered);
  }, [orders, searchQuery]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const allOrders = await supabaseService.getTransactionsWithDetails();
      setOrders(allOrders);
      setFilteredOrders(allOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Transaction) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (index: number) => {
    // This is a placeholder logic as we don't have status in db
    const status = orderStatuses[index % orderStatuses.length];
    return <Badge className={status.color}>{status.label}</Badge>;
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Pesanan</h1>
          <p className="text-muted-foreground">
            Kelola dan lacak semua pesanan
          </p>
        </div>
        <Button onClick={loadOrders}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan ID struk atau nama pelanggan..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                <div className="col-span-2">Struk ID</div>
                <div className="col-span-3">Pelanggan</div>
                <div className="col-span-3">Tanggal</div>
                <div className="col-span-1">Item</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-1">Aksi</div>
              </div>

              <div className="divide-y">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/50 items-center"
                  >
                    <div className="col-span-2 font-medium">
                      #{order.receiptNumber}
                    </div>
                    <div className="col-span-3">
                      {order.customer?.name || "Tamu"}
                    </div>
                    <div className="col-span-3 text-sm">
                      {formatDate(order.created_at)}
                    </div>
                    <div className="col-span-1 text-sm">
                      {order.transaction_items.reduce(
                        (acc, item) => acc + item.quantity,
                        0
                      )}
                    </div>
                    <div className="col-span-2 font-medium">
                      {formatRupiah(order.total)}
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {filteredOrders.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <p>Tidak ada pesanan ditemukan.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detail Pesanan - #{selectedOrder?.receiptNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-2">Informasi Pelanggan</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Nama:</span>{" "}
                      {selectedOrder.customer?.name || "Tamu"}
                    </p>
                    {selectedOrder.customer?.email && (
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {selectedOrder.customer.email}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Informasi Pesanan</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Tanggal:</span>{" "}
                      {formatDate(selectedOrder.created_at)}
                    </p>
                    <p>
                      <span className="font-medium">Pembayaran:</span>{" "}
                      {selectedOrder.payment_method}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-4">Item Pesanan</h3>
                <div className="space-y-3">
                  {selectedOrder.transaction_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          Item ID: {item.product_id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatRupiah(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatRupiah(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-4">Ringkasan Pesanan</h3>
                <div className="space-y-2">
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>{formatRupiah(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4 print:hidden">
                <Button onClick={handlePrintReceipt}>
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak Struk
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowOrderDetails(false)}
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
