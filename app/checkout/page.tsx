"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "../context/cart-context";
import { useAuth } from "../context/auth-context";
import { supabaseService } from "../services/supabase-service";
import { formatRupiah } from "@/lib/currency";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, customer } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isLoading, setIsLoading] = useState(false);

  const grandTotal = cartTotal;

  const handlePayment = async () => {
    if (cart.length === 0) return;
    setIsLoading(true);
    try {
      const transactionData = {
        user_id: user?.id || null,
        customer_id: customer?.id || null,
        total: grandTotal,
        payment_method: paymentMethod,
        receiptNumber: Math.floor(100000 + Math.random() * 900000).toString(),
        items: cart,
      };

      const newTransaction = await supabaseService.createTransaction(
        transactionData
      );

      sessionStorage.setItem(
        "lastTransaction",
        JSON.stringify({
          ...newTransaction,
          items: cart,
          subtotal: cartTotal,
        })
      );

      clearCart();
      router.push("/success");
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Pembayaran Gagal: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0 && !isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Keranjang Anda kosong</h1>
          <p className="mt-2 text-muted-foreground">
            Tambahkan item ke keranjang sebelum checkout
          </p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Kembali ke POS
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke POS
      </Button>

      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Ringkasan Pesanan</h2>
          <div className="rounded-lg border p-4 bg-white">
            {cart.map((item) => (
              <div key={item.id} className="mb-3 flex justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatRupiah(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  {formatRupiah(item.price * item.quantity)}
                </p>
              </div>
            ))}
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>{formatRupiah(cartTotal)}</p>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>{formatRupiah(grandTotal)}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Metode Pembayaran</h2>
          <div className="rounded-lg border p-4 bg-white">
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Kartu Kredit/Debit
                </Label>
              </div>
              <div className="mt-3 flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center">
                  <Wallet className="mr-2 h-4 w-4" />
                  Tunai
                </Label>
              </div>
            </RadioGroup>
            <Button
              className="mt-6 w-full"
              size="lg"
              onClick={handlePayment}
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Selesaikan Pembayaran"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
