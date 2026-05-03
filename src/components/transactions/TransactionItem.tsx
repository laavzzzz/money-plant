export default function TransactionItem({
  title = "Lunch",
  category = "Food",
  amount = -250,
}: {
  title?: string;
  category?: string;
  amount?: number;
}) {
  const isIncome = amount > 0;

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
      
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-gray-400">{category}</p>
      </div>

      <span
        className={`font-semibold ${
          isIncome ? "text-green-500" : "text-red-500"
        }`}
      >
        {isIncome ? "+" : "-"}₹{Math.abs(amount)}
      </span>

    </div>
  );
}