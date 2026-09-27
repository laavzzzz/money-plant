"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { FinanceProvider } from "./FinanceProvider";
import { TransactionModalProvider } from "./TransactionModalProvider";
import VibeCheck from "@/components/ai/VibeCheck";
import { useSession } from "next-auth/react";

interface AppProvidersProps {
  children: React.ReactNode;
}

function AuthenticatedVibeCheck() {
  const { status } = useSession();
  return status === "authenticated" ? <VibeCheck /> : null;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <FinanceProvider>
        <TransactionModalProvider>
          {children}
          <AuthenticatedVibeCheck />
        </TransactionModalProvider>
      </FinanceProvider>
    </SessionProvider>
  );
}