/**
 * @file src/components/dashboard/ActionButtons.tsx
 * @module Components/Dashboard/ActionButtons
 * @description Enterprise dashboard interactive action trigger card for invoking
 * the transaction modal creation flow with fluid Framer Motion feedback.
 * 
 * @version 3.1.0
 * @author Senior Principal UI/UX Engineering Team
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useTransactionModal } from "@/components/providers/TransactionModalProvider";

export function ActionButtons(): React.ReactElement {
  const { openAdd } = useTransactionModal();

  return (
    <section>
      <motion.button
        type="button"
        onClick={() => openAdd("expense")}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Add new transaction entry"
        className="glass-panel flex w-full items-center justify-center gap-3 border-emerald-400/30 bg-emerald-500/15 p-5 text-emerald-700 transition-all hover:bg-emerald-500/20 dark:text-emerald-300 sm:p-6 cursor-pointer rounded-3xl"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
          <Plus size={26} strokeWidth={3} aria-hidden="true" />
        </span>
        <span className="text-sm font-black uppercase tracking-widest">
          Add Transaction
        </span>
      </motion.button>
    </section>
  );
}

export default ActionButtons;