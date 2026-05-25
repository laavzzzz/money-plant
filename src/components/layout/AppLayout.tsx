"use client";

import { ReactNode } from "react";
import PageContent from "./PageContent";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * @deprecated Use PageContent — AppLayout no longer clamps to max-w-md.
 * Kept as alias so existing imports keep working during migration.
 */
export default function AppLayout({ children, className }: Props) {
  return <PageContent className={className}>{children}</PageContent>;
}
