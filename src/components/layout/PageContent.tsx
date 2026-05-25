"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Full-width page body inside the dashboard shell — no narrow max-w-md clamp */
export default function PageContent({ children, className }: Props) {
  return (
    <div className={cn("w-full min-w-0 space-y-6", className)}>{children}</div>
  );
}
