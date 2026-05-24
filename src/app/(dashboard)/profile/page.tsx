"use client";

import React, { useState } from "react";
import {
  Settings,
  ChevronRight,
  Award,
  Bell,
  Mail,
  Smartphone,
  Image as ImageIcon,
  Moon,
  Sun,
  Code,
  Camera,
  Zap,
  Heart,
  Target,
} from "lucide-react";

export default function ProfilePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <main className="min-h-screen p-6 pb-32 max-w-2xl mx-auto space-y-8 bg-[#fffdf6]">
      {/* --- TOP NAV --- */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase">My Character</h1>
        <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:rotate-90 transition-transform duration-500">
          <Settings className="text-gray-400" size={20} />
        </button>
      </div>

      {/* --- HERO SECTION --- */}
      <div className="flex flex-col items-center py-4 text-center">
        <div className="relative">
          <div className="w-28 h-28 bg-yellow-100 rounded-[40px] flex items-center justify-center text-5xl mb-4 border-4 border-white shadow-2xl relative z-10">
            👩‍💻
          </div>
          <div className="absolute -inset-2 bg-yellow-400/20 blur-2xl rounded-full" />
          <button className="absolute bottom-4 right-0 p-2 bg-black text-white rounded-full z-20 border-2 border-white hover:scale-110 transition-transform">
            <ImageIcon size={14} />
          </button>
        </div>
        <h2 className="text-2xl font-black mt-2">Ananya Sharma</h2>
        <p className="text-[10px] font-black text-yellow-600 px-3 py-1 bg-yellow-400/10 rounded-full uppercase tracking-[0.2em] mt-1">
          Level 12 Financial Sage
        </p>
        <p className="text-gray-400 text-sm italic mt-3 font-medium">
          "Grinding for that Sprout Stage 2 🪴"
        </p>
      </div>

      {/* --- AURA & STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-black text-white p-6 rounded-[35px] flex justify-between items-center shadow-xl">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Aura</p>
            <p className="text-3xl font-black text-yellow-400">12,450</p>
          </div>
          <div className="bg-yellow-400/20 p-3 rounded-2xl">
            <Award className="text-yellow-400" size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[35px] border border-gray-100 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Rank</p>
            <p className="text-3xl font-black text-black">#42</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-2xl">
            <Target className="text-blue-600" size={28} />
          </div>
        </div>
      </div>

      {/* --- IDENTITY CORE --- */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">Identity Core</h3>
        <div className="bg-white rounded-[35px] p-2 border border-gray-100 shadow-sm space-y-1">
          <DetailRow icon={<Mail size={16}/>} label="Email" value="ananya@moneyplant.dev" />
          <DetailRow icon={<Smartphone size={16}/>} label="Phone" value="+91 98765 43210" />
        </div>
      </div>

      {/* --- SKILL TREE --- */}
      <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm">
        <h3 className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest">Skill Tree</h3>
        <div className="space-y-5">
          <SkillProgress label="Patience" value={85} icon={<Heart size={12}/>} color="bg-pink-400" />
          <SkillProgress label="Precision" value={60} icon={<Zap size={12}/>} color="bg-yellow-400" />
        </div>
      </div>

      {/* --- PREFERENCES & SOCIALS --- */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">Settings & Squad</h3>
        <div className="space-y-2">
          <ProfileOption icon={<Bell size={18}/>} label="Notifications" badge="3" />
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex justify-between items-center p-5 bg-white rounded-3xl border border-gray-50 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="text-gray-400">{isDarkMode ? <Moon size={18}/> : <Sun size={18}/>}</div>
              <span className="font-bold text-sm">{isDarkMode ? "Night Vibe" : "Day Vibe"}</span>
            </div>
            <div className="w-10 h-6 bg-gray-100 rounded-full p-1 flex items-center">
                <div className={`w-4 h-4 rounded-full transition-all duration-300 ${isDarkMode ? 'translate-x-4 bg-black' : 'bg-yellow-400'}`} />
            </div>
          </button>

          <ProfileOption icon={<Code size={18}/>} label="Link GitHub" isConnected />
          <ProfileOption icon={<Camera size={18}/>} label="Link Instagram" />
        </div>
      </div>

      {/* --- FOOTER ACTIONS --- */}
      <div className="pt-6">
        <button className="w-full py-5 rounded-[30px] bg-red-50 text-red-500 font-black text-sm uppercase tracking-widest hover:bg-red-100 transition-colors">
          Log Out
        </button>
        <p className="text-center text-[10px] text-gray-300 font-bold mt-6 uppercase tracking-tighter">
          Money Plant v1.0.4 — Build #4402
        </p>
      </div>
    </main>
  );
}

// --- SUB-COMPONENTS (Fixed with proper types/props) ---

function DetailRow({ icon, label, value, color = "text-black" }: any) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-gray-300">{icon}</div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">{label}</span>
      </div>
      <span className={`text-sm font-black ${color}`}>{value}</span>
    </div>
  );
}

function SkillProgress({ label, value, icon, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">{icon}</span>
          <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-[10px] font-black">{value}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ProfileOption({ icon, label, badge, isConnected }: any) {
  return (
    <div className="flex justify-between items-center p-5 bg-white rounded-3xl border border-gray-50 shadow-sm hover:scale-[1.01] transition-transform cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="text-gray-400">{icon}</div>
        <span className="font-bold text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {badge && <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-lg">{badge}</span>}
        {isConnected && <span className="text-[10px] font-black text-green-500 uppercase">Linked</span>}
        <ChevronRight size={18} className="text-gray-300" />
      </div>
    </div>
  );
}