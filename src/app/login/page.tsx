"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#fffdf6] flex flex-col items-center justify-center p-8">

      {/* 🧠 Header */}
      <header className="text-center mb-10">
        <h1 className="text-3xl font-black mb-2">
          Welcome Back! 🌿
        </h1>
        <p className="text-gray-400 text-sm font-medium">
          Login to continue your financial journey
        </p>
      </header>

      {/* 🌱 Hero Illustration */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-12"
      >
        <div className="w-48 h-48 bg-yellow-100 rounded-[60px] flex items-center justify-center text-8xl shadow-inner">
          🪴
        </div>
      </motion.div>

      {/* 🔐 Auth Buttons */}
      <div className="w-full max-w-xs space-y-4">

        {/* Google Login */}
        <button
          type="button"
          className="w-full bg-white border-2 border-gray-100 py-4 rounded-3xl flex items-center justify-center gap-3 font-bold text-sm shadow-sm hover:bg-gray-50 transition"
        >
          <Globe size={20} className="text-red-500" />
          Continue with Google
        </button>

        {/* Email Login */}
        <button
          type="button"
          className="w-full bg-white border-2 border-gray-100 py-4 rounded-3xl flex items-center justify-center gap-3 font-bold text-sm shadow-sm hover:bg-gray-50 transition"
        >
          Continue with Email
        </button>

      </div>

      {/* 📩 Signup */}
      <p className="mt-8 text-xs text-gray-400 font-bold text-center">
        Don&apos;t have an account?{" "}
        <span className="text-green-500 underline cursor-pointer">
          Sign up
        </span>
      </p>

    </main>
  );
}