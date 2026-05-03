"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Food", value: 400 },
  { name: "Travel", value: 300 },
  { name: "Shopping", value: 300 },
];

const COLORS = ["#22c55e", "#facc15", "#fb923c"];

export default function OverviewChart() {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-md">
      <p className="text-gray-500 text-sm mb-3">Spending Overview</p>

      <div className="h-40">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={70}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}