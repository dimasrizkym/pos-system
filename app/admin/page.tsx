"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, ShoppingCart, Users, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  supabaseService,
  type Transaction,
} from "../services/supabase-service";
import ProtectedRoute from "../components/protected-route";
import { formatRupiah } from "@/lib/currency";

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  recentOrders: Transaction[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // PERBAIKAN: Menggunakan supabaseService untuk mengambil data
      const [transactions, customers] = await Promise.all([
        supabaseService.getTransactionsWithDetails(),
        supabaseService.getCustomers(),
      ]);

      const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);

      setStats({
        totalSales,
        totalOrders: transactions.length,
        totalCustomers: customers.length,
        recentOrders: transactions.slice(0, 5),
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold">Dashboard Admin</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Penjualan
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatRupiah(stats.totalSales)}
              </div>
              <p className="text-xs text-muted-foreground">
                Dari seluruh transaksi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pesanan
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Jumlah transaksi berhasil
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pelanggan
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Jumlah pelanggan terdaftar
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pesanan Terbaru</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/orders")}
            >
              <Eye className="h-4 w-4 mr-2" />
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">
                      #{order.receiptNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.customer?.name || "Tamu"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {formatRupiah(order.total)}
                    </p>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-100 text-green-700"
                    >
                      Selesai
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
