"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Menu, X, LogOut, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import ProtectedRoute from "../components/protected-route"
import { useAuth } from "../context/auth-context"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Produk", href: "/admin/products", icon: Package },
  { name: "Kategori", href: "/admin/categories", icon: Package },
  { name: "Pesanan", href: "/admin/orders", icon: ShoppingCart },
  { name: "Pelanggan", href: "/admin/customers", icon: Users },
  { name: "Analitik", href: "/admin/analytics", icon: BarChart3 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex h-full flex-col", mobile ? "w-full" : "w-64")}>
      <div className="flex h-16 items-center justify-between px-6 border-b">
        <div className="flex items-center gap-2">
          <Store className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">POS Admin</span>
        </div>
        {mobile && (
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.name}
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-3 h-11", isActive && "bg-primary/10 text-primary font-medium")}
              onClick={() => {
                router.push(item.href)
                if (mobile) setSidebarOpen(false)
              }}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Button>
          )
        })}
      </nav>

      <div className="border-t p-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-3 h-11" onClick={() => router.push("/")}>
          <Store className="h-5 w-5" />
          Kembali ke POS
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </Button>
      </div>
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <div className="flex h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex w-64 flex-col border-r bg-white">
            <Sidebar />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar mobile />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="flex h-16 items-center justify-between border-b bg-white px-4 lg:hidden">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <div className="flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              <span className="font-bold">POS Admin</span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 lg:p-8">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
