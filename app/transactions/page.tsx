"use client";

import { useState, useEffect } from "react";
import { Search, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  supabaseService,
  type Transaction,
} from "../services/supabase-service";
import ProtectedRoute from "../components/protected-route";
import { formatRupiah } from "@/lib/currency";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    let filtered = transactions;
    if (searchQuery) {
      filtered = transactions.filter(
        (t) =>
          t.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.customer?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredTransactions(filtered);
  }, [searchQuery, transactions]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const dbTransactions = await supabaseService.getTransactionsWithDetails();
      setTransactions(dbTransactions);
      setFilteredTransactions(dbTransactions);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-6">
          Riwayat Transaksi
        </h1>
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold">Riwayat Transaksi</h1>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
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

        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">
                  Tidak ada transaksi ditemukan
                </h3>
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">
                          #{transaction.receiptNumber}
                        </h3>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Pelanggan: {transaction.customer?.name || "Tamu"}</p>
                        <p>Waktu: {formatDate(transaction.created_at)}</p>
                        <p>Pembayaran: {transaction.payment_method}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-lg font-bold">
                          {formatRupiah(transaction.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
