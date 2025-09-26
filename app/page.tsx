"use client";

import { useState } from "react";
import {
  Search,
  Settings,
  LogOut,
  History,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import ProductGrid from "./components/product-grid";
import CartSidebar from "./components/cart-sidebar";
import CategorySidebar from "./components/category-sidebar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "./components/protected-route";
import { useAuth } from "./context/auth-context";
import { cn } from "@/lib/utils";
import ProductFormModal from "./components/product-form-modal";
import { Product } from "./services/supabase-service";

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false); // Default tertutup
  const { user, logout } = useAuth();
  const router = useRouter();

  const [showProductModal, setShowProductModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [refreshProductGrid, setRefreshProductGrid] = useState(0);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const openAddProductModal = () => {
    setProductToEdit(null);
    setShowProductModal(true);
  };

  const openEditProductModal = (product: Product) => {
    setProductToEdit(product);
    setShowProductModal(true);
  };

  const onFormSuccess = () => {
    setRefreshProductGrid(Math.random());
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <div className="sticky top-0 z-10 bg-background p-4 border-b">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Point of Sale</h1>
                <p className="text-sm text-muted-foreground">
                  Selamat datang, {user?.name} (
                  {user?.role === "owner" ? "Owner" : "Kasir"})
                </p>
              </div>
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari produk..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                >
                  Kategori{" "}
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 ml-2 transition-transform duration-200",
                      isCategoryOpen && "rotate-90"
                    )}
                  />
                </Button>
                {user?.role === "owner" && (
                  <Button variant="outline" onClick={openAddProductModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Produk
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => router.push("/transactions")}
                >
                  <History className="h-4 w-4 mr-2" />
                  Riwayat
                </Button>
                {user?.role === "owner" && (
                  <Button
                    variant="outline"
                    onClick={() => router.push("/admin")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto">
            <CategorySidebar
              isOpen={isCategoryOpen}
              onOpenChange={setIsCategoryOpen}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            <div className="p-4">
              <ProductGrid
                key={refreshProductGrid}
                category={selectedCategory}
                searchQuery={searchQuery}
                onEditProduct={openEditProductModal}
              />
            </div>
          </div>
        </main>

        <CartSidebar />
      </div>

      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSuccess={onFormSuccess}
        productToEdit={productToEdit}
      />
    </ProtectedRoute>
  );
}
