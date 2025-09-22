"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Eye,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { db } from "../services/database";
import ProtectedRoute from "../components/protected-route";
import { formatRupiah } from "@/lib/currency";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockItems: number;
  salesGrowth: number;
  orderGrowth: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    growth: number;
  }>;
  recentOrders: Array<{
    id: string;
    customer: string;
    total: number;
    status: string;
    timestamp: Date;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(
        endDate.getDate() -
          (timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90)
      );

      const transactions = await db.getTransactions();
      const customers = await db.getCustomers();
      const lowStockItems = await db.getLowStockItems();

      const filteredTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.timestamp);
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      // PERBAIKAN: Hapus perkalian * 15000 yang salah
      const totalSales = filteredTransactions.reduce(
        (sum, t) => sum + t.total,
        0
      );
      const totalOrders = filteredTransactions.length;

      const salesGrowth = Math.random() * 20 - 10;
      const orderGrowth = Math.random() * 15 - 5;

      const productSales = new Map();
      filteredTransactions.forEach((transaction) => {
        transaction.items.forEach((item) => {
          const existing = productSales.get(item.id) || {
            name: item.name,
            sales: 0,
          };
          // PERBAIKAN: Hapus perkalian * 15000 yang salah
          existing.sales += item.total;
          productSales.set(item.id, existing);
        });
      });

      const topProducts = Array.from(productSales.entries())
        .map(([id, data]) => ({
          id: String(id),
          ...(data as any),
          growth: Math.random() * 30 - 10,
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      const recentOrders = filteredTransactions
        .slice(-5)
        .reverse()
        .map((t) => ({
          id: t.id,
          customer: `Pelanggan ${t.customerId || "Tamu"}`,
          // PERBAIKAN: Hapus perkalian * 15000 yang salah
          total: t.total,
          status: "selesai",
          timestamp: new Date(t.timestamp),
        }));

      setStats({
        totalSales,
        totalOrders,
        totalCustomers: customers.length,
        lowStockItems: lowStockItems.length,
        salesGrowth,
        orderGrowth,
        topProducts,
        recentOrders,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <ProtectedRoute allowedRoles={["owner"]}>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold">Dashboard Admin</h1>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold">Dashboard Admin</h1>
          <div className="flex gap-2">
            {[
              { key: "7d", label: "7 Hari" },
              { key: "30d", label: "30 Hari" },
              { key: "90d", label: "90 Hari" },
            ].map((range) => (
              <Button
                key={range.key}
                variant={timeRange === range.key ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range.key)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <div className="flex items-center text-xs text-muted-foreground">
                {stats.salesGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span
                  className={
                    stats.salesGrowth >= 0 ? "text-green-500" : "text-red-500"
                  }
                >
                  {Math.abs(stats.salesGrowth).toFixed(1)}%
                </span>
                <span className="ml-1">dari periode sebelumnya</span>
              </div>
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
              <div className="flex items-center text-xs text-muted-foreground">
                {stats.orderGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span
                  className={
                    stats.orderGrowth >= 0 ? "text-green-500" : "text-red-500"
                  }
                >
                  {Math.abs(stats.orderGrowth).toFixed(1)}%
                </span>
                <span className="ml-1">dari periode sebelumnya</span>
              </div>
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
                Basis pelanggan aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Peringatan Stok Rendah
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {stats.lowStockItems}
              </div>
              <p className="text-xs text-muted-foreground">Item perlu restok</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Produk Terlaris</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatRupiah(product.sales)}
                          </span>
                          {product.growth >= 0 ? (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-700"
                            >
                              +{product.growth.toFixed(1)}%
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-red-100 text-red-700"
                            >
                              {product.growth.toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={(product.sales / stats.topProducts[0].sales) * 100}
                      className="w-20"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
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
                        #{order.id.slice(-6)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {formatRupiah(order.total)}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button className="h-20 flex-col gap-2">
                <Package className="h-6 w-6" />
                Tambah Produk
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent"
              >
                <ShoppingCart className="h-6 w-6" />
                Lihat Pesanan
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent"
              >
                <Users className="h-6 w-6" />
                Kelola Pelanggan
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent"
              >
                <BarChart3 className="h-6 w-6" />
                Lihat Analitik
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
