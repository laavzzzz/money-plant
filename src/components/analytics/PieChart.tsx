"use client";

import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Food", value: 500 },
  { name: "Bills", value: 300 },
  { name: "Fun", value: 200 },
];

const COLORS = ["#22c55e", "#facc15", "#fb923c"];

export default function CustomPieChart() {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-md">
      <h3 className="text-sm text-gray-500 mb-3">Category Split</h3>

      <div className="h-52">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              outerRadius={80}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}