"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

/**
 * 🌙 THEME PROVIDER (NIGHT VIBE ENGINE)
 * This component handles the transition between Light and Dark modes.
 * It works with the 'suppressHydrationWarning' in your layout.tsx 
 * to prevent flickering on page load.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      // These default props ensure the "Vibe" aesthetic is preserved
      attribute="class" 
      defaultTheme="system" 
      enableSystem 
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}