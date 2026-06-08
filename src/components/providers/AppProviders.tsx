"use client";

import React from "react";
import { FinanceProvider } from "./FinanceProvider";
import { TransactionModalProvider } from "./TransactionModalProvider";
import ChatWidget from "@/components/ai/ChatWidget";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <FinanceProvider>
      <TransactionModalProvider>
        {children}
        <ChatWidget />
      </TransactionModalProvider>
    </FinanceProvider>
  );
}
