"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Download, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "../services/database"
import ProtectedRoute from "../components/protected-route"

interface Transaction {
  id: string
  customerId?: string
  customerName: string
  items: Array<{
    id: number
    name: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  discount: number
  total: number
  paymentMethod: string
  status: string
  timestamp: Date
  cashierName: string
}

// Helper function to format currency to Rupiah
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("today")

  useEffect(() => {
    loadTransactions()
  }, [statusFilter, dateFilter])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const dbTransactions = await db.getTransactions()

      // Convert to display format with Rupiah
      const formattedTransactions: Transaction[] = dbTransactions.map((t) => ({
        id: t.id,
        customerId: t.customerId,
        customerName: t.customerId ? `Pelanggan ${t.customerId}` : "Tamu",
        items: t.items,
        subtotal: t.subtotal * 15000, // Convert to Rupiah
        discount: t.discount * 15000,
        total: t.total * 15000,
        paymentMethod: t.paymentMethod || "Tunai",
        status: "selesai",
        timestamp: new Date(t.timestamp),
        cashierName: "Kasir",
      }))

      // Apply filters
      let filtered = formattedTransactions

      if (statusFilter !== "all") {
        filtered = filtered.filter((t) => t.status === statusFilter)
      }

      if (dateFilter === "today") {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        filtered = filtered.filter((t) => t.timestamp >= today)
      } else if (dateFilter === "week") {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        filtered = filtered.filter((t) => t.timestamp >= weekAgo)
      }

      if (searchQuery) {
        filtered = filtered.filter(
          (t) =>
            t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      }

      setTransactions(filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
    } catch (error) {
      console.error("Failed to load transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "selesai":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Selesai
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            Pending
          </Badge>
        )
      case "dibatalkan":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            Dibatalkan
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["cashier", "owner"]}>
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["cashier", "owner"]}>
      <div className="container mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold">Manajemen Transaksi</h1>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari berdasarkan ID transaksi atau nama pelanggan..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Tanggal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="week">7 Hari Terakhir</SelectItem>
                  <SelectItem value="month">30 Hari Terakhir</SelectItem>
                  <SelectItem value="all">Semua</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Tidak ada transaksi</h3>
                <p className="text-sm text-muted-foreground">
                  Tidak ada transaksi yang ditemukan dengan filter yang dipilih.
                </p>
              </CardContent>
            </Card>
          ) : (
            transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">#{transaction.id}</h3>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Pelanggan: {transaction.customerName}</p>
                        <p>Kasir: {transaction.cashierName}</p>
                        <p>Waktu: {transaction.timestamp.toLocaleString("id-ID")}</p>
                        <p>Pembayaran: {transaction.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-lg font-bold">{formatRupiah(transaction.total)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Item ({transaction.items.length}):</p>
                    <div className="text-sm text-muted-foreground">
                      {transaction.items.slice(0, 3).map((item, index) => (
                        <span key={item.id}>
                          {item.name} ({item.quantity}x)
                          {index < Math.min(transaction.items.length, 3) - 1 && ", "}
                        </span>
                      ))}
                      {transaction.items.length > 3 && <span> dan {transaction.items.length - 3} item lainnya</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
