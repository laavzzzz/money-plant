import TransactionItem from "./TransactionItem";

export default function TransactionList() {
  return (
    <div className="space-y-3">
      <TransactionItem title="Salary" category="Income" amount={10000} />
      <TransactionItem title="Lunch" category="Food" amount={-250} />
      <TransactionItem title="Uber" category="Transport" amount={-120} />
    </div>
  );
}