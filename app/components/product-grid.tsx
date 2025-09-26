"use client";

import Image from "next/image";
import { PlusCircle, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "../context/cart-context";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/currency";
import { useAuth } from "../context/auth-context";
import { Button } from "@/components/ui/button";
import type { Product } from "../services/supabase-service";

interface ProductGridProps {
  category: string;
  searchQuery: string;
  onEditProduct: (product: Product) => void;
}

export default function ProductGrid({
  category,
  searchQuery,
  onEditProduct,
}: ProductGridProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image, category_id");
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      category === "all" || product.category_id === category;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {filteredProducts.map((product) => (
        <Card
          key={product.id}
          className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer group"
        >
          <div className="relative aspect-square">
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 z-10"
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
              <PlusCircle className="h-10 w-10 text-white" />
            </div>

            {user?.role === "owner" && (
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 z-20 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProduct(product);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}

            <Image
              src={
                product.image ||
                "/placeholder.svg?height=200&width=200&query=food"
              }
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-3">
            <div>
              <h3 className="font-medium line-clamp-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatRupiah(product.price)}
              </p>
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
  );
}
