"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { FinanceProvider } from "./FinanceProvider";
import { TransactionModalProvider } from "./TransactionModalProvider";
import VibeCheck from "@/components/ai/VibeCheck";

interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <FinanceProvider>
        <TransactionModalProvider>
          {children}
          {/* VibeCheck now has access to session data if it needs to tailor AI insights based on the logged-in user */}
          <VibeCheck />
        </TransactionModalProvider>
      </FinanceProvider>
    </SessionProvider>
  );
}