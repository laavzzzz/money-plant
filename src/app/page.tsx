"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fffdf6] flex flex-col items-center justify-center px-6">

      {/* 🌱 HERO SECTION */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="text-center max-w-md"
      >
        {/* 🌿 Plant */}
        <div className="text-6xl mb-4 animate-bounce">
          🌱
        </div>

        {/* 🧠 Heading */}
        <h1 className="text-3xl font-bold text-gray-800">
          Grow your money, grow your future 🌿
        </h1>

        {/* 💬 Subtitle */}
        <p className="text-gray-500 mt-3">
          Track your spending, build habits, and watch your plant thrive 💸✨
        </p>

        {/* 🚀 CTA Buttons */}
        <div className="mt-6 flex flex-col gap-3">

          <Link href="/dashboard">
            <button className="btn-primary">
              Get Started 🌱
            </button>
          </Link>

          <Link href="/login">
            <button className="bg-white border border-gray-200 text-gray-700 py-3 rounded-full font-medium shadow-sm hover:bg-gray-50">
              Login
            </button>
          </Link>

        </div>
      </motion.div>

      {/* 🌼 FEATURES SECTION */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center max-w-4xl">

        <div className="card">
          <div className="text-3xl">💧</div>
          <h3 className="font-semibold mt-2">Track Income</h3>
          <p className="text-sm text-gray-500">
            Every earning waters your plant
          </p>
        </div>

        <div className="card">
          <div className="text-3xl">🌱</div>
          <h3 className="font-semibold mt-2">Grow Savings</h3>
          <p className="text-sm text-gray-500">
            Watch your plant grow daily
          </p>
        </div>

        <div className="card">
          <div className="text-3xl">🍂</div>
          <h3 className="font-semibold mt-2">Control Spending</h3>
          <p className="text-sm text-gray-500">
            Spending affects your plant health
          </p>
        </div>

      </div>

    </div>
  );
}