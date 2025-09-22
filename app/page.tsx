"use client"

import { useState } from "react"
import { Search, Settings, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import ProductGrid from "./components/product-grid"
import CartSidebar from "./components/cart-sidebar"
import CategorySidebar from "./components/category-sidebar"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import ProtectedRoute from "./components/protected-route"
import { useAuth } from "./context/auth-context"

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <CategorySidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <div className="sticky top-0 z-10 bg-background p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Point of Sale</h1>
                <p className="text-sm text-muted-foreground">
                  Selamat datang, {user?.name} ({user?.role === "owner" ? "Owner" : "Kasir"})
                </p>
              </div>
              <div className="flex items-center gap-4">
                {user?.role === "owner" && (
                  <Button variant="outline" onClick={() => router.push("/admin")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </Button>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari produk..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <ProductGrid category={selectedCategory} searchQuery={searchQuery} />
          </div>
        </main>

        <CartSidebar />
      </div>
    </ProtectedRoute>
  )
}
