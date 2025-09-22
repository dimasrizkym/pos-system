"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/lib/currency";
import type { CartItem } from "../context/cart-context";

interface ReceiptData {
  receiptNumber: string;
  created_at: string;
  items: CartItem[];
  subtotal: number;
  total: number;
}

export default function SuccessPage() {
  const router = useRouter();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  useEffect(() => {
    const lastTransactionJSON = sessionStorage.getItem("lastTransaction");
    if (lastTransactionJSON) {
      try {
        const transactionData = JSON.parse(lastTransactionJSON);
        setReceipt(transactionData);
        sessionStorage.removeItem("lastTransaction");
      } catch (error) {
        console.error(
          "Failed to parse transaction from session storage",
          error
        );
      }
    }
  }, []);

  const handleBackToPOS = () => {
    router.push("/");
  };

  const handlePrint = () => {
    window.print();
  };

  if (!receipt) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Tidak ada transaksi untuk ditampilkan
          </h1>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Kembali ke POS
          </Button>
        </div>
      </div>
    );
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
          <p className="font-medium">Struk #{receipt.receiptNumber}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(receipt.created_at).toLocaleString("id-ID")}
          </p>
        </div>
        <Separator className="my-4" />
        <div className="space-y-3">
          {receipt.items.map((item) => (
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
            <p>{formatRupiah(receipt.subtotal)}</p>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <p>Total</p>
            <p>{formatRupiah(receipt.total)}</p>
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
