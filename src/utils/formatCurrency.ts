export function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}