import { TransactionType } from "@/types/transaction";

export function calculateStats(transactions: TransactionType[]) {
  let income = 0;
  let expense = 0;

  transactions.forEach((tx) => {
    if (tx.type === "income") income += tx.amount;
    else expense += tx.amount;
  });

  return {
    income,
    expense,
    savings: income - expense,
  };
}