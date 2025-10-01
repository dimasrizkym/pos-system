"use client";

import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2, User, Award } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "../context/cart-context";
import CustomerModal from "./customer-modal";
import { formatRupiah } from "@/lib/currency";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "../context/auth-context";
import { supabaseService } from "../services/supabase-service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CartSidebar() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    itemCount,
    customer,
    clearCart,
    setCustomer,
  } = useCart();

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [cashPaid, setCashPaid] = useState(0);
  const [displayCashPaid, setDisplayCashPaid] = useState("");
  const [includeDebt, setIncludeDebt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const totalToPay = useMemo(() => {
    return cartTotal + (includeDebt ? customer?.outstanding_debt || 0 : 0);
  }, [cartTotal, customer, includeDebt]);

  const debtPaidThisTransaction = useMemo(() => {
    if (!includeDebt || !customer || cashPaid <= cartTotal) return 0;
    const cashAfterCart = cashPaid - cartTotal;
    return Math.min(customer.outstanding_debt, cashAfterCart);
  }, [cashPaid, cartTotal, customer, includeDebt]);

  const newDebtThisTransaction = useMemo(() => {
    return Math.max(0, cartTotal - cashPaid);
  }, [cashPaid, cartTotal]);

  const change = useMemo(() => {
    return Math.max(0, cashPaid - totalToPay);
  }, [cashPaid, totalToPay]);

  const finalDebt = useMemo(() => {
    if (!customer) return newDebtThisTransaction;
    return (
      customer.outstanding_debt -
      debtPaidThisTransaction +
      newDebtThisTransaction
    );
  }, [customer, debtPaidThisTransaction, newDebtThisTransaction]);

  const pointsToEarn = useMemo(
    () => (cartTotal > 0 ? Math.floor(cartTotal / 20000) : 0),
    [cartTotal]
  );

  const handleCashPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseInt(rawValue.replace(/[^0-9]/g, ""), 10);

    if (isNaN(numericValue)) {
      setCashPaid(0);
      setDisplayCashPaid("");
    } else {
      setCashPaid(numericValue);
      setDisplayCashPaid(new Intl.NumberFormat("id-ID").format(numericValue));
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (newDebtThisTransaction > 0 && !customer) {
      alert("Pilih pelanggan untuk mencatat hutang.");
      return;
    }

    setIsLoading(true);
    try {
      const transactionStatus: "unpaid" | "paid" =
        finalDebt > 0 ? "unpaid" : "paid";

      const transactionData = {
        user_id: user?.id || null,
        customer_id: customer?.id || null,
        total: cartTotal,
        payment_method: "cash",
        receiptNumber: Math.floor(100000 + Math.random() * 900000).toString(),
        status: transactionStatus,
        items: cart,
        cash_paid: cashPaid,
        change: change,
        points_earned: pointsToEarn,
        debt_incurred: newDebtThisTransaction,
        debt_snapshot: customer?.outstanding_debt || 0,
        debt_paid_this_transaction: debtPaidThisTransaction,
        final_debt_snapshot: finalDebt,
      };

      const newTransaction = await supabaseService.createTransaction(
        transactionData
      );

      if (customer) {
        const updatedCustomer = await supabaseService.updateCustomer(
          customer.id,
          {
            loyalty_points: customer.loyalty_points + pointsToEarn,
            outstanding_debt: finalDebt,
          }
        );
        setCustomer(updatedCustomer);
      }

      sessionStorage.setItem(
        "lastReceiptData",
        JSON.stringify({
          receiptNumber: newTransaction.receiptNumber,
          created_at: newTransaction.created_at,
          items: cart,
          subtotal: cartTotal,
          includeDebt: includeDebt,
          totalToPay: totalToPay,
          amountPaid: cashPaid,
          change: change,
          previousDebt: customer?.outstanding_debt || 0,
          debtPaidThisTransaction: debtPaidThisTransaction,
          newDebtThisTransaction: newDebtThisTransaction,
          totalOutstandingDebt: finalDebt,
          previousPoints: customer?.loyalty_points || 0,
          pointsEarned: pointsToEarn,
          totalPoints: customer
            ? customer.loyalty_points + pointsToEarn
            : pointsToEarn,
        })
      );

      clearCart();
      setCustomer(null);
      setCashPaid(0);
      setDisplayCashPaid("");
      setIncludeDebt(false);
      router.push("/checkout");
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout Gagal: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex w-96 flex-col border-l bg-background">
        {/* Header dan Customer Section */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="flex items-center text-lg font-semibold">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Keranjang
          </h2>
          <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
            {itemCount} item
          </span>
        </div>
        <div className="border-b p-4">
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent"
            onClick={() => setShowCustomerModal(true)}
          >
            <User className="mr-2 h-4 w-4" />
            {customer ? customer.name : "Pilih Pelanggan"}
          </Button>
          {customer && (
            <div className="text-xs text-muted-foreground mt-2 flex justify-between">
              <span>Hutang: {formatRupiah(customer.outstanding_debt)}</span>
              <span>Poin: {customer.loyalty_points}</span>
            </div>
          )}
        </div>

        {/* Daftar Item Keranjang */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <ShoppingCart className="mb-2 h-12 w-12" />
              <h3 className="font-medium">Keranjang kosong</h3>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <h3 className="font-medium line-clamp-1">{item.name}</h3>
                    <p className="font-medium">
                      {formatRupiah(item.price * item.quantity)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatRupiah(item.price)} per item
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t p-4 space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <p>Total Belanja SKG</p>
              <p>{formatRupiah(cartTotal)}</p>
            </div>
            {customer && customer.outstanding_debt > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-debt"
                    checked={includeDebt}
                    onCheckedChange={(checked) =>
                      setIncludeDebt(Boolean(checked))
                    }
                  />
                  <Label htmlFor="include-debt" className="text-sm">
                    Sertakan Pembayaran Hutang
                  </Label>
                </div>
                <p>{formatRupiah(customer.outstanding_debt)}</p>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-baseline font-bold text-lg">
              <div className="flex items-center">
                <p>Total Bayar</p>
                {includeDebt && (
                  <span className="ml-2 text-xs font-normal text-blue-600">
                    (Termasuk Hutang)
                  </span>
                )}
              </div>
              <p>{formatRupiah(totalToPay)}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="cash-paid">Input Uang</Label>
            <Input
              id="cash-paid"
              type="text"
              placeholder="Rp 0"
              value={displayCashPaid}
              onChange={handleCashPaidChange}
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-green-600">
              <p>Kembalian</p>
              <p>{formatRupiah(change)}</p>
            </div>
            <div className="flex justify-between text-red-600">
              <p>Hutang Baru</p>
              <p>{formatRupiah(newDebtThisTransaction)}</p>
            </div>
          </div>

          {customer && (
            <div className="text-xs text-center text-muted-foreground p-2 rounded-md bg-muted">
              Poin didapat: {pointsToEarn} | Total Poin akan menjadi:{" "}
              {customer.loyalty_points + pointsToEarn}
            </div>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full"
                size="lg"
                disabled={cart.length === 0 || isLoading}
              >
                Selesaikan Pembayaran
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Pembayaran</AlertDialogTitle>
                <AlertDialogDescription>
                  Pastikan semua detail transaksi sudah benar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="text-sm space-y-2">
                <div className="border-t border-b py-2 my-2">
                  <div className="font-medium mb-1">Detail Item:</div>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-2">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-muted-foreground"
                      >
                        <span>
                          {item.name} x{item.quantity}
                        </span>
                        <span>{formatRupiah(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-baseline font-bold">
                  <div className="flex items-center">
                    <span>Total Tagihan</span>
                    {includeDebt && (
                      <span className="ml-2 text-xs font-normal text-blue-600">
                        (Termasuk Hutang)
                      </span>
                    )}
                  </div>
                  <span>{formatRupiah(totalToPay)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tunai Diberikan</span>
                  <span>{formatRupiah(cashPaid)}</span>
                </div>
                <div className="flex justify-between font-bold text-green-600">
                  <span>Kembalian</span>
                  <span>{formatRupiah(change)}</span>
                </div>

                {customer && (
                  <>
                    <Separator className="my-1" />
                    <div className="flex justify-between">
                      <span>Hutang Sebelumnya</span>
                      <span>{formatRupiah(customer.outstanding_debt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hutang Dibayar</span>
                      <span className="text-blue-600">
                        -{formatRupiah(debtPaidThisTransaction)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hutang Baru</span>
                      <span className="text-red-600">
                        +{formatRupiah(newDebtThisTransaction)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total Hutang Setelah Transaksi</span>
                      <span className="text-red-600">
                        {formatRupiah(finalDebt)}
                      </span>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex justify-between">
                      <span>Poin Saat Ini</span>
                      <span>{customer.loyalty_points} Poin</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Poin Akan Didapat</span>
                      <span>+{pointsToEarn} Poin</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total Poin Setelah Transaksi</span>
                      <span>{customer.loyalty_points + pointsToEarn} Poin</span>
                    </div>
                  </>
                )}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Kembali</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCheckout}
                  disabled={isLoading}
                >
                  {isLoading ? "Memproses..." : "Konfirmasi & Cetak Struk"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
      />
    </>
  );
}
