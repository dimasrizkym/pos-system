import { createClient } from "@/lib/supabase/client";
import type { CartItem } from "../context/cart-context";

export interface Category {
  id: string;
  name: string;
  icon: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category_id: string;
  created_at: string;
}

export interface ProductWithCategory extends Product {
  category: Category;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string | null;
  customer_id: string | null;
  total: number;
  payment_method: string;
  created_at: string;
  receiptNumber: string;
  transaction_items: TransactionItem[];
  customer?: { name: string; email: string };
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

class SupabaseService {
  private supabase = createClient();

  // Categories
  async getCategories(): Promise<Category[]> {
    console.log("[v0] Fetching categories from Supabase...");
    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("[v0] Error fetching categories:", error);
      throw error;
    }

    console.log("[v0] Successfully fetched categories:", data?.length || 0);
    return data || [];
  }

  async createCategory(
    category: Omit<Category, "id" | "created_at">
  ): Promise<Category> {
    console.log("[v0] Creating category:", category.name);
    const { data, error } = await this.supabase
      .from("categories")
      .insert([category])
      .select()
      .single();

    if (error) {
      console.error("[v0] Error creating category:", error);
      throw error;
    }

    console.log("[v0] Successfully created category:", data.name);
    return data;
  }

  async updateCategory(
    id: string,
    updates: Partial<Omit<Category, "id" | "created_at">>
  ): Promise<Category> {
    console.log("[v0] Updating category:", id);
    const { data, error } = await this.supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[v0] Error updating category:", error);
      throw error;
    }

    console.log("[v0] Successfully updated category:", data.name);
    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    console.log("[v0] Deleting category:", id);
    const { error } = await this.supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[v0] Error deleting category:", error);
      throw error;
    }

    console.log("[v0] Successfully deleted category");
  }

  // Products
  async getProducts(): Promise<Product[]> {
    console.log("[v0] Fetching products from Supabase...");
    const { data, error } = await this.supabase
      .from("products")
      .select("*")
      .order("name");

    if (error) {
      console.error("[v0] Error fetching products:", error);
      throw error;
    }

    console.log("[v0] Successfully fetched products:", data?.length || 0);
    return data || [];
  }

  async getProductsWithCategories(): Promise<ProductWithCategory[]> {
    console.log("[v0] Fetching products with categories from Supabase...");
    const { data, error } = await this.supabase
      .from("products")
      .select(
        `
        *,
        category:categories(*)
      `
      )
      .order("name");

    if (error) {
      console.error("[v0] Error fetching products with categories:", error);
      throw error;
    }

    console.log(
      "[v0] Successfully fetched products with categories:",
      data?.length || 0
    );
    return data || [];
  }

  async createProduct(
    product: Omit<Product, "id" | "created_at">
  ): Promise<Product> {
    console.log("[v0] Creating product:", product.name);
    const { data, error } = await this.supabase
      .from("products")
      .insert([product])
      .select()
      .single();

    if (error) {
      console.error("[v0] Error creating product:", error);
      throw error;
    }

    console.log("[v0] Successfully created product:", data.name);
    return data;
  }

  async updateProduct(
    id: string,
    updates: Partial<Omit<Product, "id" | "created_at">>
  ): Promise<Product> {
    console.log("[v0] Updating product:", id);
    const { data, error } = await this.supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[v0] Error updating product:", error);
      throw error;
    }

    console.log("[v0] Successfully updated product:", data.name);
    return data;
  }

  async deleteProduct(id: string): Promise<void> {
    console.log("[v0] Deleting product:", id);
    const { error } = await this.supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[v0] Error deleting product:", error);
      throw error;
    }

    console.log("[v0] Successfully deleted product");
  }

  async getProductCountByCategory(): Promise<Record<string, number>> {
    console.log("[v0] Getting product count by category...");
    const { data, error } = await this.supabase
      .from("products")
      .select("category_id");

    if (error) {
      console.error("[v0] Error getting product count:", error);
      return {};
    }

    const counts: Record<string, number> = {};
    data?.forEach((product: { category_id?: string }) => {
      if (product.category_id) {
        counts[product.category_id] = (counts[product.category_id] || 0) + 1;
      }
    });

    console.log("[v0] Product counts by category:", counts);
    return counts;
  }
  // Customer Management
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await this.supabase
      .from("customers")
      .select("*")
      .order("name");
    if (error) throw error;
    return data || [];
  }

  async createCustomer(
    customerData: Omit<Customer, "id" | "created_at">
  ): Promise<Customer> {
    const { data, error } = await this.supabase
      .from("customers")
      .insert(customerData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateCustomer(
    id: string,
    updates: Partial<Customer>
  ): Promise<Customer> {
    const { data, error } = await this.supabase
      .from("customers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("customers")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }

  // Transaction Management
  async createTransaction(transactionData: {
    user_id: string | null;
    customer_id: string | null;
    total: number;
    payment_method: string;
    receiptNumber: string;
    items: CartItem[];
  }): Promise<Transaction> {
    // 1. Buat record transaksi utama
    const { data: newTransaction, error: transactionError } =
      await this.supabase
        .from("transactions")
        .insert({
          user_id: transactionData.user_id,
          customer_id: transactionData.customer_id,
          total: transactionData.total,
          payment_method: transactionData.payment_method,
          receiptNumber: transactionData.receiptNumber,
        })
        .select()
        .single();

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      throw transactionError;
    }

    // 2. Siapkan item-item transaksi
    const transactionItems = transactionData.items.map((item) => ({
      transaction_id: newTransaction.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    // 3. Masukkan semua item ke tabel transaction_items
    const { error: itemsError } = await this.supabase
      .from("transaction_items")
      .insert(transactionItems);

    if (itemsError) {
      console.error("Error creating transaction items:", itemsError);
      // Optional: Hapus transaksi utama jika item gagal dibuat
      await this.supabase
        .from("transactions")
        .delete()
        .eq("id", newTransaction.id);
      throw itemsError;
    }

    return { ...newTransaction, transaction_items: transactionItems };
  }

  async getTransactionsWithDetails(): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from("transactions")
      .select(
        `
            *,
            transaction_items(*),
            customer:customers(name, email)
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
    return data || [];
  }
}

export const supabaseService = new SupabaseService();
