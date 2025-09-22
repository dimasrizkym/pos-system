"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { Coffee, Cookie, LayoutGrid, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface CategorySidebarProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

interface Category {
  id: string
  name: string
  icon: string
}

const getIconComponent = (iconName: string): React.ElementType => {
  switch (iconName) {
    case "UtensilsCrossed":
      return UtensilsCrossed
    case "Coffee":
      return Coffee
    case "Cookie":
      return Cookie
    default:
      return LayoutGrid
  }
}

export default function CategorySidebar({ selectedCategory, onSelectCategory }: CategorySidebarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      console.log("[v0] Starting to fetch categories...")

      const { data, error } = await supabase.from("categories").select("*").order("name")

      console.log("[v0] Categories response:", { data, error })

      if (error) {
        console.error("[v0] Error fetching categories:", error)
        return
      }

      console.log("[v0] Successfully fetched categories:", data?.length || 0)
      setCategories(data || [])
    } catch (error) {
      console.error("[v0] Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-56 border-r bg-background p-4 relative z-10">
        <h2 className="mb-4 text-lg font-semibold">Categories</h2>
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-56 border-r bg-background p-4 relative z-10">
      <h2 className="mb-4 text-lg font-semibold">Categories</h2>
      <div className="grid gap-3">
        <Button
          variant="ghost"
          className={cn(
            "flex h-auto flex-col items-center justify-center py-4 border bg-transparent",
            selectedCategory === "all"
              ? "border-2 border-primary text-foreground font-medium"
              : "border-muted text-muted-foreground hover:border-muted-foreground hover:text-foreground",
            "hover:bg-transparent",
          )}
          onClick={() => onSelectCategory("all")}
        >
          <LayoutGrid className="mb-2 h-6 w-6" />
          <span className="text-sm">Semua Produk</span>
        </Button>

        {categories.map((category) => {
          const Icon = getIconComponent(category.icon || "LayoutGrid")
          return (
            <Button
              key={category.id}
              variant="ghost"
              className={cn(
                "flex h-auto flex-col items-center justify-center py-4 border bg-transparent",
                selectedCategory === category.id
                  ? "border-2 border-primary text-foreground font-medium"
                  : "border-muted text-muted-foreground hover:border-muted-foreground hover:text-foreground",
                "hover:bg-transparent",
              )}
              onClick={() => onSelectCategory(category.id)}
            >
              <Icon className="mb-2 h-6 w-6" />
              <span className="text-sm">{category.name}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
