"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "../context/cart-context";
import { formatRupiah } from "@/lib/currency";

export default function SuccessPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();

  const tax = cartTotal * 0.11;
  const grandTotal = cartTotal + tax;
  const receiptNumber = Math.floor(100000 + Math.random() * 900000);
  const date = new Date().toLocaleString("id-ID");

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/");
    }
  }, [cart, router]);

  const handleBackToPOS = () => {
    clearCart();
    router.push("/");
  };

  const handlePrint = () => {
    window.print();
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-md py-8">
      <div className="rounded-lg border p-6 print:border-none bg-white">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold">
          Pembayaran Berhasil
        </h1>
        <p className="mb-6 text-center text-muted-foreground">
          Terima kasih atas pembelian Anda!
        </p>
        <div className="mb-6 text-center">
          <p className="font-medium">Struk #{receiptNumber}</p>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
        <Separator className="my-4" />
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between">
              <div>
                <p>
                  {item.name} × {item.quantity}
                </p>
              </div>
              <p>{formatRupiah(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <p>Subtotal</p>
            <p>{formatRupiah(cartTotal)}</p>
          </div>
          <div className="flex justify-between">
            <p>Pajak (11%)</p>
            <p>{formatRupiah(tax)}</p>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <p>Total</p>
            <p>{formatRupiah(grandTotal)}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 print:hidden">
          <Button onClick={handlePrint} variant="outline" className="w-full">
            <Printer className="mr-2 h-4 w-4" />
            Cetak Struk
          </Button>
          <Button onClick={handleBackToPOS} className="w-full">
            Kembali ke POS
          </Button>
        </div>
      </div>
    </div>
  );
}
