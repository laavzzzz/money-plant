"use client";
import { motion } from "framer-motion";

const leaders = [
  { rank: 1, name: "MoneyMonk", aura: 34550, emoji: "🐒", trophy: "🥇" },
  { rank: 2, name: "SaverGirl", aura: 18450, emoji: "🌸", trophy: "🥈" },
  { rank: 3, name: "FrugalKing", aura: 15230, emoji: "👑", trophy: "🥉" },
  { rank: 4, name: "BudgetBoss", aura: 13400, emoji: "💼" },
  { rank: 5, name: "SaveMaster", aura: 12450, emoji: "🧙" },
];

export default function LeaderboardPage() {
  return (
    <main className="p-6 pb-24 max-w-md mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-black">Leaderboard</h1>
        <div className="flex justify-center gap-4 mt-4">
          <button className="bg-white px-4 py-1 rounded-full text-xs font-bold shadow-sm">This Month</button>
          <button className="text-gray-400 px-4 py-1 text-xs font-bold">All Time</button>
        </div>
      </header>

      {/* Podium for Top 3 */}
      <div className="flex justify-around items-end mb-10 h-40">
        <Podium rank={2} name="SaverGirl" aura="18k" emoji="🌸" height="h-24" />
        <Podium rank={1} name="MoneyMonk" aura="34k" emoji="🐒" height="h-32" />
        <Podium rank={3} name="FrugalKing" aura="15k" emoji="👑" height="h-20" />
      </div>

      {/* List for others */}
      <div className="space-y-3">
        {leaders.map((user) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={user.rank} 
            className="bg-white p-4 rounded-3xl flex justify-between items-center border border-gray-50 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-400 w-4">{user.rank}</span>
              <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-xl">
                {user.emoji}
              </div>
              <span className="font-bold text-sm">{user.name}</span>
            </div>
            <span className="text-xs font-black text-green-500">+{user.aura} Aura</span>
          </motion.div>
        ))}
      </div>
    </main>
  );
}

function Podium({ rank, name, aura, emoji, height }: any) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-2xl mb-2">{emoji}</div>
      <div className={`${height} w-16 bg-[#fff3c4] rounded-t-2xl flex flex-col items-center justify-center border-b-4 border-yellow-200`}>
        <span className="font-black text-xl">{rank}</span>
        <span className="text-[10px] font-bold uppercase">{aura}</span>
      </div>
      <span className="text-[10px] font-bold mt-2">{name}</span>
    </div>
  );
}