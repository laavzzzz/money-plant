"use client";

import Link from "next/link";

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 text-lg">
      <Link href="/dashboard">🏠</Link>
      <Link href="/transactions">💸</Link>
      <Link href="/analytics">📊</Link>
      <Link href="/goals">🎯</Link>
      <Link href="/profile">👤</Link>
    </div>
  );
}