"use client";
import { Settings, ChevronRight, Award, Bell, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  return (
    <main className="p-6 pb-24 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-black">Profile</h1>
        <Settings className="text-gray-400" />
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-yellow-100 rounded-[35px] flex items-center justify-center text-5xl mb-4 border-4 border-white shadow-lg">
          👩‍💻
        </div>
        <h2 className="text-xl font-black">Ananya Sharma</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Level 12 Financial Sage</p>
      </div>

      {/* Aura Score Card */}
      <div className="bg-black text-white p-6 rounded-[40px] mb-8 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase">Total Aura</p>
          <p className="text-3xl font-black text-yellow-400">12,450</p>
        </div>
        <div className="bg-yellow-400/20 p-3 rounded-2xl">
          <Award className="text-yellow-400" size={32} />
        </div>
      </div>

      {/* Settings List */}
      <div className="space-y-2">
        <ProfileOption icon={<Bell size={18}/>} label="Notifications" />
        <ProfileOption icon={<ShieldCheck size={18}/>} label="Privacy & Security" />
        <ProfileOption icon={<Award size={18}/>} label="My Achievements" />
      </div>

      <button className="w-full mt-10 py-4 rounded-3xl border-2 border-red-50 text-red-400 font-bold text-sm">
        Log Out
      </button>
    </main>
  );
}

function ProfileOption({ icon, label }: any) {
  return (
    <div className="flex justify-between items-center p-5 bg-white rounded-3xl border border-gray-50 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="text-gray-400">{icon}</div>
        <span className="font-bold text-sm">{label}</span>
      </div>
      <ChevronRight size={18} className="text-gray-300" />
    </div>
  );
}