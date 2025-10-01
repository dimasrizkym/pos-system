"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/lib/currency";
import type { CartItem } from "../context/cart-context";

interface ReceiptData {
  receiptNumber: string;
  created_at: string;
  items: CartItem[];
  subtotal: number;
  includeDebt: boolean;
  totalToPay: number;
  amountPaid: number;
  change: number;
  previousDebt: number;
  debtPaidThisTransaction: number;
  newDebtThisTransaction: number;
  totalOutstandingDebt: number;
  previousPoints: number;
  pointsEarned: number;
  totalPoints: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  useEffect(() => {
    const lastReceiptJSON = sessionStorage.getItem("lastReceiptData");
    if (lastReceiptJSON) {
      try {
        setReceipt(JSON.parse(lastReceiptJSON));
        sessionStorage.removeItem("lastReceiptData");
      } catch (error) {
        console.error("Gagal mem-parsing data struk", error);
      }
    }
  }, []);

  const handleBackToPOS = () => router.push("/");
  const handlePrint = () => window.print();

  if (!receipt) {
    return (
      <div className="flex h-screen items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold">
            Tidak ada struk untuk ditampilkan
          </h1>
          <p className="text-muted-foreground mb-4">
            Selesaikan transaksi untuk melihat struk.
          </p>
          <Button className="mt-4" onClick={handleBackToPOS}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke POS
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md py-8">
      <div className="rounded-lg border bg-white p-6 print:border-none">
        <div className="mb-4 text-center">
          <Check className="mx-auto mb-2 h-12 w-12 text-green-500" />
          <h1 className="text-2xl font-bold">Transaksi Berhasil</h1>
          <p className="text-muted-foreground">
            Terima kasih atas pembelian Anda!
          </p>
          <p className="mt-4 font-medium">Struk #{receipt.receiptNumber}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(receipt.created_at).toLocaleString("id-ID")}
          </p>
        </div>
        <Separator className="my-4" />
        <div className="space-y-2">
          <h3 className="font-semibold">Detail Item:</h3>
          {receipt.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatRupiah(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-baseline font-bold">
            <div className="flex items-center">
              <span>Total Tagihan</span>
              {receipt.includeDebt && (
                <span className="ml-2 text-xs font-normal text-blue-600">
                  (Termasuk Hutang)
                </span>
              )}
            </div>
            <span className="font-bold">
              {formatRupiah(receipt.totalToPay)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tunai Diberikan</span>
            <span>{formatRupiah(receipt.amountPaid)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kembalian</span>
            <span className="font-bold text-green-600">
              {formatRupiah(receipt.change)}
            </span>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="space-y-2 text-sm">
          <h3 className="font-semibold">Rincian Hutang:</h3>
          <div className="flex justify-between">
            <span>Hutang Sebelumnya</span>
            <span>{formatRupiah(receipt.previousDebt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Hutang Dibayar</span>
            <span className="text-blue-600">
              -{formatRupiah(receipt.debtPaidThisTransaction)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Hutang Baru</span>
            <span className="text-red-600">
              +{formatRupiah(receipt.newDebtThisTransaction)}
            </span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total Hutang Akhir</span>
            <span className="text-red-700">
              {formatRupiah(receipt.totalOutstandingDebt)}
            </span>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="space-y-2 text-sm">
          <h3 className="font-semibold">Rincian Poin:</h3>
          <div className="flex justify-between">
            <span>Poin Saat Ini</span>
            <span>{receipt.previousPoints}</span>
          </div>
          <div className="flex justify-between">
            <span>Poin Didapat</span>
            <span>+{receipt.pointsEarned}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total Poin</span>
            <span>{receipt.totalPoints}</span>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 print:hidden">
          <Button onClick={handlePrint} variant="outline" className="w-full">
            <Printer className="mr-2 h-4 w-4" />
            Cetak Struk
          </Button>
          <Button onClick={handleBackToPOS} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Selesai (Kembali ke POS)
          </Button>
        </div>
      </div>
    </div>
  );
}
