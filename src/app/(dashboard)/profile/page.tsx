"use client";

import React, { useState, useRef } from "react";
import { Camera, User, Shield, Zap, Award, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8 p-4 md:p-8 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center gap-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          Character sheet
        </p>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="px-4 py-2 bg-yellow-400 text-black rounded-xl font-bold text-[10px] uppercase tracking-wider hover:scale-105 transition-transform shadow-sm"
        >
          {isDarkMode ? "Dark View" : "Light View"}
        </button>
      </div>

      {/* PROFILE INFO CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
           <Zap size={200} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          {/* AVATAR UPLOAD SECTION */}
          <div className="relative group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-32 h-32 md:w-40 md:h-40 rounded-[45px] bg-gray-50 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center cursor-pointer relative"
              onClick={triggerFileInput}
            >
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-gray-300">
                  <User size={48} />
                  <span className="text-[8px] font-black uppercase mt-1">No Image</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white" size={24} />
              </div>
            </motion.div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
            
            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white p-2.5 rounded-2xl shadow-xl">
              <Shield size={20} />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none mb-2">
              Player <span className="text-yellow-500">One</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.2em] mb-6">
              Level 12 Wealth Guardian
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-green-100">
                <Star size={12} fill="currentColor" /> Active Streak: 5 Days
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-purple-100">
                <Award size={12} /> Pro Member
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Global Aura" value="+1,240" color="text-yellow-500" />
        <StatCard label="Savings Rate" value="64%" color="text-green-500" />
        <StatCard label="Achievements" value="12/50" color="text-purple-500" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[35px] border border-gray-100 shadow-sm"
    >
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className={`text-3xl font-black tracking-tighter ${color}`}>{value}</p>
    </motion.div>
  );
}