"use client"

import Image from "next/image"
import { PlusCircle } from "lucide-react"
import { useState, useEffect } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "../context/cart-context"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: string
  name: string
  price: number
  image: string | null
  category_id: string
}

interface ProductGridProps {
  category: string
  searchQuery: string
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ProductGrid({ category, searchQuery }: ProductGridProps) {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      console.log("[v0] Starting to fetch products...")

      const { data, error } = await supabase.from("products").select("id, name, price, image, category_id")

      console.log("[v0] Supabase response:", { data, error })

      if (error) {
        console.error("[v0] Error fetching products:", error)
        return
      }

      console.log("[v0] Successfully fetched products:", data?.length || 0)
      setProducts(data || [])
    } catch (error) {
      console.error("[v0] Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = category === "all" || product.category_id === category
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="aspect-square bg-muted" />
            <CardContent className="p-3">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {filteredProducts.map((product) => (
        <Card
          key={product.id}
          className="overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer group"
          onClick={() =>
            addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image || "/placeholder.svg",
              category: product.category_id,
            })
          }
        >
          <div className="relative aspect-square">
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 z-10">
              <PlusCircle className="h-10 w-10 text-white" />
            </div>
            <Image
              src={product.image || "/placeholder.svg?height=200&width=200&query=food item"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-3">
            <div>
              <h3 className="font-medium line-clamp-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{formatRupiah(product.price)}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredProducts.length === 0 && !loading && (
        <div className="col-span-full py-12 text-center">
          <p className="text-muted-foreground">Tidak ada produk ditemukan</p>
        </div>
      )}
    </div>
  )
}
