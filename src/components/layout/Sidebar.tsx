"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 p-4 bg-white border-r">
      <h2 className="font-bold mb-4">🌿 MoneyPlant</h2>

      <nav className="flex flex-col gap-3 text-sm">
        <Link href="/dashboard">🏠 Dashboard</Link>
        <Link href="/dashboard/transactions">💸 Transactions</Link>
        <Link href="/dashboard/analytics">📊 Analytics</Link>
        <Link href="/dashboard/goals">🎯 Goals</Link>
        <Link href="/dashboard/leaderboard">🏆 Leaderboard</Link>
      </nav>
    </aside>
  );
}