/**
 * @file src/components/dashboard/OverviewChart.tsx
 * @module Components/Dashboard/OverviewChart
 * @description Enterprise-grade interactive spending distribution pie chart component
 * built with Recharts, featuring category aggregation, percentage computation, and empty state handling.
 * 
 * @version 3.1.0
 * @author Senior Principal UI/UX Engineering Team
 */

"use client";

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import GlassCard from "../ui/GlassCard";
import { Transaction } from "@/hooks/useTransactions";

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

export interface OverviewChartProps {
  readonly transactions: readonly Transaction[];
}

interface CategorySum {
  readonly name: string;
  readonly value: number;
}

// ============================================================================
// CONSTANTS: PALETTE
// ============================================================================

const COLORS: readonly string[] = Object.freeze([
  "#22c55e", // green
  "#facc15", // yellow
  "#fb923c", // orange
  "#60a5fa", // blue
  "#a78bfa", // purple
]);

// ============================================================================
// HELPER: GROUP BY CATEGORY
// ============================================================================

function groupByCategory(transactions: readonly Transaction[]): readonly CategorySum[] {
  if (!transactions || !transactions.length) return [];
  
  const map: Record<string, number> = {};

  transactions.forEach((tx) => {
    if (tx.type === "expense" && tx.category) {
      const categoryName = String(tx.category).trim().toLowerCase();
      map[categoryName] = (map[categoryName] || 0) + Number(tx.amount || 0);
    }
  });

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
  }));
}

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

export default function OverviewChart({
  transactions,
}: OverviewChartProps): React.ReactElement {
  /* 🔄 COMPUTE DATA */
  const data = useMemo(() => {
    return groupByCategory(transactions || []);
  }, [transactions]);

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  /* ❌ EMPTY STATE */
  if (data.length === 0) {
    return (
      <GlassCard>
        <p className="text-sm font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
          Spending Overview
        </p>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-4 font-medium italic">
          No expense data yet 💸
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-4">
      {/* 🏷 TITLE */}
      <p className="text-sm font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
        Spending Overview
      </p>

      {/* 📊 CHART */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data as CategorySum[]}
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell
                  key={`pie-cell-${i}`}
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
              key={`legend-item-${item.name}`}
              className="flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    backgroundColor: COLORS[i % COLORS.length],
                  }}
                  aria-hidden="true"
                />
                <span className="capitalize font-bold text-xs text-text-main">
                  {item.name}
                </span>
              </div>

              <span className="text-gray-500 dark:text-zinc-400 text-xs font-black">
                {percent}%
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}