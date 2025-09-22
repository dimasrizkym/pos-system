"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  supabaseService,
  type Transaction,
  type ProductWithCategory,
} from "../../services/supabase-service";
import { formatRupiah } from "@/lib/currency";
import { Progress } from "@radix-ui/react-progress";

interface AnalyticsData {
  revenue: { current: number };
  orders: { current: number };
  customers: { current: number };
  avgOrderValue: { current: number };
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    quantity: number;
  }>;
  salesByCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const transactions = await supabaseService.getTransactionsWithDetails();
      const customers = await supabaseService.getCustomers();
      const products = await supabaseService.getProductsWithCategories();

      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const filteredTransactions = transactions.filter(
        (t) => new Date(t.created_at) >= startDate
      );

      const currentRevenue = filteredTransactions.reduce(
        (sum, t) => sum + t.total,
        0
      );
      const currentOrders = filteredTransactions.length;
      const currentAvgOrder =
        currentOrders > 0 ? currentRevenue / currentOrders : 0;

      const productSales = new Map<
        string,
        { name: string; revenue: number; quantity: number }
      >();
      filteredTransactions.forEach((transaction) => {
        transaction.transaction_items.forEach((item) => {
          const productInfo = products.find((p) => p.id === item.product_id);
          const existing = productSales.get(item.product_id) || {
            name: productInfo?.name || "Unknown",
            revenue: 0,
            quantity: 0,
          };
          existing.revenue += item.price * item.quantity;
          existing.quantity += item.quantity;
          productSales.set(item.product_id, existing);
        });
      });
      const topProducts = Array.from(productSales.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const categorySales = new Map<string, number>();
      filteredTransactions.forEach((transaction) => {
        transaction.transaction_items.forEach((item) => {
          const productInfo = products.find((p) => p.id === item.product_id);
          if (productInfo?.category) {
            const categoryName = productInfo.category.name;
            const currentCategorySale = categorySales.get(categoryName) || 0;
            categorySales.set(
              categoryName,
              currentCategorySale + item.price * item.quantity
            );
          }
        });
      });

      const totalCategoryRevenue = Array.from(categorySales.values()).reduce(
        (sum, val) => sum + val,
        0
      );
      const salesByCategory = Array.from(categorySales.entries()).map(
        ([category, revenue]) => ({
          category,
          revenue,
          percentage:
            totalCategoryRevenue > 0
              ? (revenue / totalCategoryRevenue) * 100
              : 0,
        })
      );

      setAnalytics({
        revenue: { current: currentRevenue },
        orders: { current: currentOrders },
        customers: { current: customers.length },
        avgOrderValue: { current: currentAvgOrder },
        topProducts,
        salesByCategory,
      });
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Analitik</h1>
          <p className="text-muted-foreground">
            Wawasan bisnis dan metrik performa
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Hari</SelectItem>
              <SelectItem value="30d">30 Hari</SelectItem>
              <SelectItem value="90d">90 Hari</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendapatan
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRupiah(analytics.revenue.current)}
            </div>
          </CardContent>
        </Card>
        {/* ... (Kartu lainnya) ... */}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produk Berperforma Terbaik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="font-medium text-sm">
                    {formatRupiah(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Penjualan per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.salesByCategory.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">
                      {category.category}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatRupiah(category.revenue)}
                    </span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
