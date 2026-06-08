"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, Clock3, Download, Plus } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useSharedTransactions } from "@/components/providers/FinanceProvider";
import { cn } from "@/lib/utils";

const TABS = ["All", "Income", "Expense"] as const;

type TabOption = (typeof TABS)[number];

function iconForTransaction(type: string) {
  return type === "income" ? (
    <ArrowDownLeft className="text-green-500" />
  ) : (
    <ArrowUpRight className="text-orange-500" />
  );
}

import { redirect } from "next/navigation";

export default function HistoryPage() {
  redirect("/dashboard/transactions");
}
