"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Zap, ArrowUpRight, Leaf } from "lucide-react";
import MoneyBackground from "../../MoneyBackground";

export default function LandingPage() {
  const vibePreviewRef = useRef<HTMLDivElement>(null);

  const scrollToVibePreview = () => {
    vibePreviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden relative">
      {/* --- CURSOR REPEL BACKGROUND --- */}
      <MoneyBackground />

      {/* --- NAVIGATION --- */}
      <nav className="relative z-50 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 text-2xl font-black italic tracking-tighter"
        >
          <Leaf size={28} className="text-primary" />
          MONEYPLANT
        </motion.div>
        
        <div className="flex gap-4">
          <Link href="/login" className="px-6 py-2.5 font-bold text-sm hover:opacity-70 transition-opacity">
            Login
          </Link>
          <Link href="/login" className="px-6 py-2.5 bg-black text-white rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-transform">
            Join the Squad
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center">

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-8 text-white"
        >
          STOP SAVING<br />
          <span className="text-primary italic">START GROWING</span>
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
          <Link href="/login" className="flex-1 group bg-primary text-white font-black py-5 rounded-[30px] shadow-[0_20px_50px_rgba(234,179,8,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-2">
            CLAIM YOUR SEED <ArrowUpRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            type="button"
            onClick={scrollToVibePreview}
            className="flex-1 bg-white border border-gray-100 text-black font-black py-5 rounded-[30px] shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            WATCH VIBE
          </button>
        </motion.div>

        {/* --- FEATURE BENTO PREVIEW --- */}
        <motion.div
          ref={vibePreviewRef}
          id="vibe-preview"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-24 w-full scroll-mt-8"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8">
            See the vibe
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
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
          </div>
        </motion.div>
      </main>

      {/* --- REVIEWS SLIDER --- */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-4">
            real reviews
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
            What the community is saying
          </h2>
        </div>

        <div className="overflow-hidden rounded-[40px] border border-gray-800 bg-black/30">
          <motion.div
            className="flex min-w-[200%] gap-6 px-6 py-8"
            animate={{ x: ["-100%", "0%"] }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          >
            {REVIEW_CARDS.concat(REVIEW_CARDS).map((review, index) => (
              <ReviewCard key={`${review.name}-${index}`} review={review} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 py-20 px-6 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand & Socials */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 text-2xl font-black italic tracking-tighter mb-4">
              <Leaf size={28} className="text-primary" />
              MONEYPLANT
            </div>
            <p className="text-gray-400 font-medium max-w-sm mb-6">
              The ultimate wealth-building RPG. Level up your financial aura and grow your garden from seed to sanctuary.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary transition-colors cursor-pointer">𝕏</div>
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary transition-colors cursor-pointer">👾</div>
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary transition-colors cursor-pointer">🐙</div>
            </div>
          </div>

          {/* Sitemap */}
          <div>
            <h4 className="font-black uppercase text-[10px] tracking-widest text-gray-950 mb-6">Quests</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-400">
              <li className="hover:text-primary cursor-pointer transition-colors">Aura Ranking</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Garden Mechanics</li>
              <li className="hover:text-primary cursor-pointer transition-colors">The Vault</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Patch Notes</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-black uppercase text-[10px] tracking-widest text-gray-950 mb-6">Governance</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-400">
              <li className="hover:text-primary cursor-pointer transition-colors">Privacy Lore</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Cookie Policy</li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">
            Designed for the 1% of Main Characters
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            All Systems Operational
          </div>
        </div>
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

const REVIEW_CARDS = [
  {
    text: "MoneyPlant turned my savings into something I actually want to watch grow. The garden system keeps me motivated every day.",
    name: "Nia",
    role: "Student",
  },
  {
    text: "The aura streaks and XP rewards make budgeting feel like a game. I actually look forward to making smart money moves.",
    name: "Jax",
    role: "Freelancer",
  },
  {
    text: "I love how clean the app is and how easy it is to track progress. My plant actually makes me think twice before spending.",
    name: "Mia",
    role: "Designer",
  },
  {
    text: "The vibe checks and leaderboards are my favorite. It’s the only money app I’ve used that feels fun and powerful.",
    name: "Theo",
    role: "Entrepreneur",
  },
];

function ReviewCard({ review }: { review: { text: string; name: string; role: string } }) {
  return (
    <div className="min-w-[320px] max-w-[320px] shrink-0 rounded-[30px] border border-gray-800 bg-white/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.15)] backdrop-blur-xl">
      <p className="text-gray-100 font-medium leading-relaxed mb-6">“{review.text}”</p>
      <div className="text-sm uppercase tracking-[0.22em] text-gray-500 mb-2">{review.role}</div>
      <div className="text-lg font-black text-white">{review.name}</div>
    </div>
  );
}
