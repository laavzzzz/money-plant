"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Zap, ArrowUpRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black overflow-hidden relative">
      {/* --- BACKGROUND ANIMATION ELEMENTS --- */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ y: [0, -30, 0], x: [0, 20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] text-6xl md:text-8xl opacity-20 filter blur-sm"
        >
          💰
        </motion.div>
        <motion.div 
          animate={{ y: [0, 30, 0], x: [0, -20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[10%] text-6xl md:text-8xl opacity-20 filter blur-sm"
        >
          🌱
        </motion.div>
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-yellow-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="relative z-50 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-black italic tracking-tighter"
        >
          MONEYPLANT<span className="text-primary">.</span>
        </motion.div>
        
        <div className="flex gap-4">
          <Link href="/login" className="px-6 py-2.5 font-bold text-sm hover:opacity-70 transition-opacity">
            Login
          </Link>
          <Link href="/signup" className="px-6 py-2.5 bg-black text-white rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-transform">
            Join the Squad
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-gray-100 shadow-sm px-4 py-1.5 rounded-full flex items-center gap-2 mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            V2.0 Now Live — The Aura Update
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.9] mb-8"
        >
          STOP SAVING.<br />
          <span className="text-primary italic underline decoration-black decoration-4 underline-offset-8">START GROWING.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl text-gray-500 font-medium text-lg md:text-xl mb-12 leading-relaxed"
        >
          The finance app that treats your bank account like an RPG. 
          Build your garden, boost your aura, and hit level 99 wealth.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
        >
          <Link href="/signup" className="flex-1 group bg-primary text-white font-black py-5 rounded-[30px] shadow-[0_20px_50px_rgba(234,179,8,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-2">
            CLAIM YOUR SEED <ArrowUpRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="flex-1 bg-white border border-gray-100 text-black font-black py-5 rounded-[30px] shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"> WATCH VIBE
          </button>
        </motion.div>

        {/* --- FEATURE BENTO PREVIEW --- */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
        >
          <FeatureCard 
            icon={<Zap size={24} />} 
            title="Aura System" 
            desc="Gamified credit scoring. Every save boosts your global vibe." 
            color="bg-yellow-400"
          />
          <FeatureCard 
            icon={<TrendingUp size={24} />} 
            title="The Garden" 
            desc="Your money is literally alive. Don't let your plant wither." 
            color="bg-green-400"
          />
          <FeatureCard 
            icon={<Sparkles size={24} />} 
            title="Rare Gear" 
            desc="Unlock exclusive badges and themes for your character sheet." 
            color="bg-purple-400"
          />
        </motion.div>
      </main>

      {/* --- FOOTER BANNER --- */}
      <footer className="py-10 text-center border-t border-gray-50">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">
          Designed for the 1% of Main Characters
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-8 bg-white rounded-[45px] border border-gray-50 shadow-sm flex flex-col items-start text-left group"
    >
      <div className={`mb-6 p-4 rounded-2xl text-white ${color} shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-black text-xl mb-3 uppercase tracking-tighter">{title}</h3>
      <p className="text-gray-400 font-medium leading-relaxed">{desc}</p>
    </motion.div>
  );
}