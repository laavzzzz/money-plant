"use client";

import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  Zap, 
  Target,
  Bell,
  Sparkles,
  User,
  Droplets
} from "lucide-react";

export default function DashboardHome() {
  return (
    <main className="min-h-dvh w-full relative overflow-x-hidden p-4 md:p-8 lg:p-12">
      {/* 🎨 THE BACKGROUND CANVAS */}
      <div className="vibe-canvas" />
      <div className="grain-overlay" />

      {/* 📱 RESPONSIVE CONTAINER */}
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* 🌿 TOP NAVIGATION */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Money <span className="text-gradient">Plant</span> 🪴
            </h1>
            <p className="text-text-light text-sm font-bold uppercase tracking-widest mt-1">
              Status: Vibing in the Sun
            </p>
          </div>
          
          <div className="flex gap-3">
            <button className="w-10 h-10 md:w-12 md:h-12 glass-panel flex items-center justify-center rounded-vibe-sm haptic-card bg-white/40">
              <Bell size={20} className="text-text-main" />
            </button>
            <button className="w-10 h-10 md:w-12 md:h-12 glass-panel flex items-center justify-center rounded-vibe-sm haptic-card bg-primary/20">
              <User size={20} className="text-primary" />
            </button>
          </div>
        </header>

        {/* 📊 MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 🧊 3D GROWTH STAGE COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            <GlassCard 
              variant="neon" 
              glowColor="#B2F2BB" 
              className="relative overflow-hidden min-h-[450px] flex flex-col items-center justify-center border-none shadow-vibe"
            >
              {/* Floating Light Orbs */}
              <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
              <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-accent/20 blur-[100px] rounded-full animate-pulse" />

              {/* THE 3D PEDESTAL STAGE */}
              <div className="relative" style={{ perspective: '1000px' }}>
                {/* Floating Ground Shadow */}
                <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-40 h-10 bg-black/10 blur-2xl rounded-[100%] animate-pulse" />
                
                {/* Glass Disk Stage */}
                <div 
                  className="relative w-56 h-56 md:w-64 md:h-64 bg-white/10 backdrop-blur-3xl rounded-full border border-white/40 shadow-float flex items-center justify-center animate-vibe-float"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(15deg)'
                  }}
                >
                   {/* Inner Core Glow */}
                   <div className="absolute inset-6 bg-gradient-to-tr from-accent/50 to-primary/50 rounded-full blur-xl animate-pulse" />
                   
                   {/* The Plant "Sprite" */}
                   <span className="text-9xl md:text-[10rem] drop-shadow-[0_25px_35px_rgba(0,0,0,0.3)] select-none">🪴</span>
                </div>
              </div>

              {/* Progress HUD Overlay */}
              <div className="mt-12 w-full max-w-sm px-6 text-center">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-light">Evolution Level 4</span>
                  <span className="text-xl font-black text-accent">65%</span>
                </div>
                <div className="w-full h-4 bg-black/5 dark:bg-white/20 rounded-full overflow-hidden p-1 border border-white/20 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-accent via-primary to-accent rounded-full animate-grow shadow-[0_0_15px_#B2F2BB]" 
                    style={{ width: '65%' }} 
                  />
                </div>
                <p className="text-[10px] font-bold text-text-light mt-4 uppercase tracking-[0.25em]">
                  $420.69 needed for <span className="text-primary font-black">Sprout Stage 2</span>
                </p>
              </div>
            </GlassCard>

            {/* ⚡ QUICK ACTIONS (Smooth scrollable for mobile) */}
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              <Button variant="primary" size="lg" className="shrink-0 px-10 haptic-card" leftIcon={<Plus size={20} />}>
                Deposit
              </Button>
              <Button variant="secondary" size="lg" className="shrink-0 px-10 haptic-card" leftIcon={<Sparkles size={20} />}>
                Nurture
              </Button>
              <Button variant="outline" size="lg" className="shrink-0 px-10 haptic-card" leftIcon={<ArrowUpRight size={20} />}>
                Transfer
              </Button>
            </div>
          </div>

          {/* 📊 BENTO STATS & INVENTORY COLUMN */}
          <div className="space-y-6">
            
            {/* Total Balance Bento */}
            <GlassCard className="p-6 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-700" />
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary"><TrendingUp size={24} /></div>
                <p className="text-[10px] font-black text-text-light uppercase tracking-[0.2em]">Net Worth</p>
              </div>
              <h4 className="text-4xl font-black text-text-main tracking-tighter">$12,450.00</h4>
              <div className="flex items-center gap-2 mt-3 text-green-500 font-bold text-xs">
                <span className="bg-green-100 px-2 py-0.5 rounded-md uppercase tracking-tighter text-[9px] font-black">Stable</span>
                <span>+2.4% vs last week</span>
              </div>
            </GlassCard>

            {/* Streak & Goal mini-bento */}
            <div className="grid grid-cols-2 gap-4">
              <GlassCard className="p-5 haptic-card">
                <div className="p-2 bg-orange-100 w-fit rounded-xl mb-3"><Zap size={20} className="text-orange-500" /></div>
                <p className="text-[10px] font-black text-text-light uppercase tracking-widest">Streak</p>
                <h4 className="text-2xl font-black text-text-main">15d</h4>
              </GlassCard>
              <GlassCard className="p-5 haptic-card">
                <div className="p-2 bg-blue-100 w-fit rounded-xl mb-3"><Target size={20} className="text-blue-500" /></div>
                <p className="text-[10px] font-black text-text-light uppercase tracking-widest">Goal</p>
                <h4 className="text-2xl font-black text-text-main">82%</h4>
              </GlassCard>
            </div>

            {/* RPG Style Inventory */}
            <div className="glass-panel p-6 space-y-4 border-white/30">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-xs uppercase tracking-[0.3em]">Inventory</h3>
                <span className="text-[10px] font-bold text-primary">Open Shop</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/50 haptic-card hover:translate-x-1 transition-transform">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">💧</div>
                     <div>
                        <p className="font-black text-sm">Pure Water</p>
                        <p className="text-[9px] text-text-light uppercase font-bold tracking-widest">Hydration +20</p>
                     </div>
                   </div>
                   <span className="font-black text-xs bg-white px-3 py-1 rounded-full shadow-sm">x4</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/50 opacity-60 grayscale cursor-not-allowed">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-xl">☀️</div>
                     <div>
                        <p className="font-black text-sm">Sun Lamp</p>
                        <p className="text-[9px] text-text-light uppercase font-bold tracking-widest text-danger">Locked</p>
                     </div>
                   </div>
                   <span className="font-black text-xs bg-white/50 px-3 py-1 rounded-full">x0</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}