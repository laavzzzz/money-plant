"use client";

const goals = [
  { title: "Europe Trip", saved: 35000, target: 100000, emoji: "✈️", color: "bg-blue-100" },
  { title: "New Laptop", saved: 45000, target: 80000, emoji: "💻", color: "bg-purple-100" },
];

export default function GoalsPage() {
  return (
    <main className="p-6 pb-24 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black">My Goals</h1>
        <button className="text-2xl">➕</button>
      </div>

      <div className="space-y-4">
        {goals.map((goal, i) => (
          <div key={i} className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex gap-4 mb-4">
              <div className={`${goal.color} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl`}>
                {goal.emoji}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold">{goal.title}</h3>
                  <span className="text-xs font-bold text-green-500">
                    {Math.round((goal.saved / goal.target) * 100)}%
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-400">
                  ₹ {goal.saved.toLocaleString()} / ₹ {goal.target.toLocaleString()}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-400 rounded-full" 
                style={{ width: `${(goal.saved / goal.target) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}