"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import GlassCard from "../ui/GlassCard";
import { Transaction } from "@/hooks/useTransactions";
import { useMemo } from "react";

/* 🧠 TYPES */
type Props = {
  transactions: Transaction[];
};

/* 🎨 COLORS */
const COLORS = [
  "#22c55e", // green
  "#facc15", // yellow
  "#fb923c", // orange
  "#60a5fa", // blue
  "#a78bfa", // purple
];

/* 🧠 HELPER: GROUP BY CATEGORY */
function groupByCategory(transactions: Transaction[]) {
  if (!transactions.length) return [];
  
  const map: Record<string, number> = {};

  transactions.forEach((tx) => {
    if (tx.type === "expense") {
      map[tx.category] =
        (map[tx.category] || 0) + tx.amount;
    }
  });

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
  }));
}

/* 📊 COMPONENT */
export default function OverviewChart({
  transactions,
}: Props) {
  /* 🔄 COMPUTE DATA */
  const data = useMemo(() => {
    return groupByCategory(transactions);
  }, [transactions]);

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  /* ❌ EMPTY STATE */
  if (data.length === 0) {
    return (
      <GlassCard>
        <p className="text-sm text-gray-500">
          Spending Overview
        </p>
        <p className="text-xs text-gray-400 mt-4">
          No expense data yet 💸
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-4">
      {/* 🏷 TITLE */}
      <p className="text-sm text-gray-500">
        Spending Overview
      </p>

      {/* 📊 CHART */}
      <div className="h-44">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 📋 LEGEND */}
      <div className="space-y-2 text-sm">
        {data.map((item, i) => {
          const percent = total > 0 
            ? ((item.value / total) * 100).toFixed(0) 
            : "0";

          return (
            <div
              key={item.name}
              className="flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      COLORS[i % COLORS.length],
                  }}
                />
                <span className="capitalize">
                  {item.name}
                </span>
              </div>

              <span className="text-gray-500 text-xs">
                {percent}%
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}