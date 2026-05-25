"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";

type TransactionModalContextValue = {
  openAdd: (type?: "income" | "expense") => void;
  openVibeCheck: () => void;
};

const TransactionModalContext =
  createContext<TransactionModalContextValue | null>(null);

export function TransactionModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [initialType, setInitialType] = useState<"income" | "expense">("expense");

  const openAdd = useCallback((type: "income" | "expense" = "expense") => {
    setInitialType(type);
    setOpen(true);
  }, []);

  const openVibeCheck = useCallback(() => {
    window.dispatchEvent(new CustomEvent("vibecheck:open"));
  }, []);

  return (
    <TransactionModalContext.Provider value={{ openAdd, openVibeCheck }}>
      {children}
      <AddTransactionModal
        open={open}
        onOpenChange={setOpen}
        initialType={initialType}
        hideTrigger
      />
    </TransactionModalContext.Provider>
  );
}

export function useTransactionModal() {
  const ctx = useContext(TransactionModalContext);
  if (!ctx) {
    throw new Error("useTransactionModal must be used within TransactionModalProvider");
  }
  return ctx;
}
