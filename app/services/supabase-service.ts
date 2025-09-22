import { createClient } from "@/lib/supabase/client"

export interface Category {
  id: string
  name: string
  icon: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  price: number
  image: string
  category_id: string
  created_at: string
}

export interface ProductWithCategory extends Product {
  category: Category
}

class SupabaseService {
  private supabase = createClient()

  // Categories
  async getCategories(): Promise<Category[]> {
    console.log("[v0] Fetching categories from Supabase...")
    const { data, error } = await this.supabase.from("categories").select("*").order("name")

    if (error) {
      console.error("[v0] Error fetching categories:", error)
      throw error
    }

    console.log("[v0] Successfully fetched categories:", data?.length || 0)
    return data || []
  }

  async createCategory(category: Omit<Category, "id" | "created_at">): Promise<Category> {
    console.log("[v0] Creating category:", category.name)
    const { data, error } = await this.supabase.from("categories").insert([category]).select().single()

    if (error) {
      console.error("[v0] Error creating category:", error)
      throw error
    }

    console.log("[v0] Successfully created category:", data.name)
    return data
  }

  async updateCategory(id: string, updates: Partial<Omit<Category, "id" | "created_at">>): Promise<Category> {
    console.log("[v0] Updating category:", id)
    const { data, error } = await this.supabase.from("categories").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("[v0] Error updating category:", error)
      throw error
    }

    console.log("[v0] Successfully updated category:", data.name)
    return data
  }

  async deleteCategory(id: string): Promise<void> {
    console.log("[v0] Deleting category:", id)
    const { error } = await this.supabase.from("categories").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting category:", error)
      throw error
    }

    console.log("[v0] Successfully deleted category")
  }

  // Products
  async getProducts(): Promise<Product[]> {
    console.log("[v0] Fetching products from Supabase...")
    const { data, error } = await this.supabase.from("products").select("*").order("name")

    if (error) {
      console.error("[v0] Error fetching products:", error)
      throw error
    }

    console.log("[v0] Successfully fetched products:", data?.length || 0)
    return data || []
  }

  async getProductsWithCategories(): Promise<ProductWithCategory[]> {
    console.log("[v0] Fetching products with categories from Supabase...")
    const { data, error } = await this.supabase
      .from("products")
      .select(`
        *,
        category:categories(*)
      `)
      .order("name")

    if (error) {
      console.error("[v0] Error fetching products with categories:", error)
      throw error
    }

    console.log("[v0] Successfully fetched products with categories:", data?.length || 0)
    return data || []
  }

  async createProduct(product: Omit<Product, "id" | "created_at">): Promise<Product> {
    console.log("[v0] Creating product:", product.name)
    const { data, error } = await this.supabase.from("products").insert([product]).select().single()

    if (error) {
      console.error("[v0] Error creating product:", error)
      throw error
    }

    console.log("[v0] Successfully created product:", data.name)
    return data
  }

  async updateProduct(id: string, updates: Partial<Omit<Product, "id" | "created_at">>): Promise<Product> {
    console.log("[v0] Updating product:", id)
    const { data, error } = await this.supabase.from("products").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("[v0] Error updating product:", error)
      throw error
    }

    console.log("[v0] Successfully updated product:", data.name)
    return data
  }

  async deleteProduct(id: string): Promise<void> {
    console.log("[v0] Deleting product:", id)
    const { error } = await this.supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting product:", error)
      throw error
    }

    console.log("[v0] Successfully deleted product")
  }

  async getProductCountByCategory(): Promise<Record<string, number>> {
    console.log("[v0] Getting product count by category...")
    const { data, error } = await this.supabase.from("products").select("category_id")

    if (error) {
      console.error("[v0] Error getting product count:", error)
      return {}
    }

    const counts: Record<string, number> = {}
    data?.forEach((product) => {
      if (product.category_id) {
        counts[product.category_id] = (counts[product.category_id] || 0) + 1
      }
    })

    console.log("[v0] Product counts by category:", counts)
    return counts
  }
}

export const supabaseService = new SupabaseService()
