export const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Convert USD to IDR (demo conversion rate)
export const convertToRupiah = (usdAmount: number) => {
  return usdAmount * 15000 // 1 USD = 15,000 IDR (demo rate)
}

// Format and convert in one function
export const formatPriceInRupiah = (usdAmount: number) => {
  return formatRupiah(convertToRupiah(usdAmount))
}
