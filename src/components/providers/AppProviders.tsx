"use client";

import React from "react";
import { FinanceProvider } from "./FinanceProvider";
import VibeCheck from "@/components/ai/VibeCheck";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <FinanceProvider>
      {children}
      <VibeCheck />
    </FinanceProvider>
  );
}
