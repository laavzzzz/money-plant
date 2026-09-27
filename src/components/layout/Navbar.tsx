"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full max-w-md mx-auto flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2 font-bold">
        🌿 <span>MoneyPlant</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <Link href="/profile">👤</Link>
      </div>
    </nav>
  );
}