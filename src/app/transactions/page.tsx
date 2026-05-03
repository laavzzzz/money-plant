"use client";
import { Search, Plus } from "lucide-react";

const transactions = [
  { id: 1, title: "Salary", category: "Income", amount: 10000, type: "plus", date: "Today" },
  { id: 2, title: "Lunch", category: "Food", amount: 250, type: "minus", date: "Today" },
  { id: 3, title: "Metro Card", category: "Transport", amount: 120, type: "minus", date: "Today" },
];

export default function TransactionsPage() {
  return (
    <main className="p-6 pb-24 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black">Transactions</h1>
        <Search className="text-gray-400" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8">
        {["All", "Income", "Expense"].map((tab) => (
          <button key={tab} className={`px-5 py-2 rounded-full text-xs font-bold ${tab === 'All' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase">Today</h2>
        {transactions.map((t) => (
          <div key={t.id} className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-xl">
                {t.category === "Income" ? "💰" : "🍔"}
              </div>
              <div>
                <p className="font-bold text-sm">{t.title}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{t.category}</p>
              </div>
            </div>
            <p className={`font-black ${t.type === 'plus' ? 'text-green-500' : 'text-red-400'}`}>
              {t.type === 'plus' ? '+' : '-'} ₹{t.amount}
            </p>
          </div>
        ))}
      </div>

      <button className="fixed bottom-28 right-6 bg-green-500 text-white p-4 rounded-2xl shadow-xl">
        <Plus />
      </button>
    </main>
  );
}