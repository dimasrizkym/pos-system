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
  loyalty_points: number;
  outstanding_debt: number;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: { name: string };
}

export interface Transaction {
  id: string;
  user_id: string | null;
  customer_id: string | null;
  total: number;
  payment_method: string;
  created_at: string;
  receiptNumber: string;
  status: "paid" | "unpaid";
  cash_paid: number;
  change: number;
  points_earned: number;
  debt_incurred: number;
  transaction_items: TransactionItem[];
  customer?: {
    name: string;
    email: string;
    loyalty_points: number;
    outstanding_debt: number;
  };
}

class SupabaseService {
  private supabase = createClient();

  // ... (Fungsi Categories, Products tidak berubah) ...
  async getCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .order("name");
    if (error) throw error;
    return data || [];
  }
  async createCategory(
    category: Omit<Category, "id" | "created_at">
  ): Promise<Category> {
    const { data, error } = await this.supabase
      .from("categories")
      .insert([category])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  async updateCategory(
    id: string,
    updates: Partial<Omit<Category, "id" | "created_at">>
  ): Promise<Category> {
    const { data, error } = await this.supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("categories")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from("products")
      .select("*")
      .order("name");
    if (error) throw error;
    return data || [];
  }
  async getProductsWithCategories(): Promise<ProductWithCategory[]> {
    const { data, error } = await this.supabase
      .from("products")
      .select(`*, category:categories(*)`)
      .order("name");
    if (error) throw error;
    return data || [];
  }
  async createProduct(
    product: Omit<Product, "id" | "created_at">
  ): Promise<Product> {
    const { data, error } = await this.supabase
      .from("products")
      .insert([product])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  async updateProduct(
    id: string,
    updates: Partial<Omit<Product, "id" | "created_at">>
  ): Promise<Product> {
    const { data, error } = await this.supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("products")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
  async getProductCountByCategory(): Promise<Record<string, number>> {
    const { data, error } = await this.supabase
      .from("products")
      .select("category_id");
    if (error) return {};
    const counts: Record<string, number> = {};
    data?.forEach((product: { category_id?: string }) => {
      if (product.category_id) {
        counts[product.category_id] = (counts[product.category_id] || 0) + 1;
      }
    });
    return counts;
  }
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await this.supabase
      .from("customers")
      .select("*")
      .order("name");
    if (error) throw error;
    return data || [];
  }
  async createCustomer(
    customerData: Omit<
      Customer,
      "id" | "created_at" | "loyalty_points" | "outstanding_debt"
    >
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
  async payOffDebt(
    customerId: string,
    amount: number,
    currentDebt: number
  ): Promise<Customer> {
    const newDebt = Math.max(0, currentDebt - amount);
    return this.updateCustomer(customerId, { outstanding_debt: newDebt });
  }

  async redeemPoints(
    customerId: string,
    pointsToRedeem: number,
    currentPoints: number
  ): Promise<Customer> {
    const newPoints = Math.max(0, currentPoints - pointsToRedeem);
    return this.updateCustomer(customerId, { loyalty_points: newPoints });
  }

  // --- Transaction Management ---
  async createTransaction(transactionData: {
    user_id: string | null;
    customer_id: string | null;
    total: number;
    payment_method: string;
    receiptNumber: string;
    status: "paid" | "unpaid";
    items: CartItem[];
    cash_paid: number;
    change: number;
    points_earned: number;
    debt_incurred: number;
  }): Promise<Transaction> {
    const { data: newTransaction, error: transactionError } =
      await this.supabase
        .from("transactions")
        .insert({
          user_id: transactionData.user_id,
          customer_id: transactionData.customer_id,
          total: transactionData.total,
          payment_method: transactionData.payment_method,
          receiptNumber: transactionData.receiptNumber,
          status: transactionData.status,
          cash_paid: transactionData.cash_paid,
          change: transactionData.change,
          points_earned: transactionData.points_earned,
          debt_incurred: transactionData.debt_incurred,
        })
        .select()
        .single();

    if (transactionError) throw transactionError;

    const transactionItems = transactionData.items.map((item) => ({
      transaction_id: newTransaction.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await this.supabase
      .from("transaction_items")
      .insert(transactionItems);

    if (itemsError) {
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
        `*, transaction_items(*, products(name)), customer:customers(name, email, loyalty_points, outstanding_debt)`
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export const supabaseService = new SupabaseService();
