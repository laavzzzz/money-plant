"use client";

import Link from "next/link";

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3">
      <Link href="/dashboard">🏠</Link>
      <Link href="#">💸</Link>
      <Link href="#">📊</Link>
      <Link href="#">👤</Link>
    </div>
  );
}