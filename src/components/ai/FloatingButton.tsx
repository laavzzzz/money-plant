"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPE DEFINITIONS & SCHEMAS
// ============================================================================

interface FloatingButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void;
  isPanelOpen?: boolean;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const FloatingButton = memo(({
  onClick,
  isPanelOpen = false,
  className,
}: FloatingButtonProps) => {
  return (
    <motion.button
      type="button"
      id="vibecheck-trigger-fab"
      aria-label="Open VibeCheck AI Terminal"
      aria-haspopup="dialog"
      aria-expanded={isPanelOpen}
      aria-controls="vibecheck-assistant-panel"
      initial={{ scale: 0, y: 20 }}
      animate={{ 
        scale: isPanelOpen ? 0 : 1, 
        y: isPanelOpen ? 40 : 0,
        visibility: isPanelOpen ? "hidden" : "visible"
      }}
      exit={{ scale: 0, y: 20 }}
      whileHover={{ 
        scale: 1.08, 
        rotate: 6,
        boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)"
      }}
      whileTap={{ scale: 0.92 }}
      transition={{ 
        type: "spring", 
        damping: 18, 
        stiffness: 300 
      }}
      onClick={onClick}
      className={cn(
        "fixed bottom-28 right-4 z-[100] flex h-14 w-14 items-center justify-center rounded-full sm:right-6 sm:h-16 sm:w-16 lg:bottom-8",
        "bg-[#FACC15] hover:bg-yellow-400 text-black border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "will-change-transform select-none transform-gpu transition-shadow duration-300",
        className
      )}
    >
      <Sparkles 
        size={26} 
        className="pointer-events-none stroke-[2.2]" 
        aria-hidden="true"
      />
    </motion.button>
  );
});

FloatingButton.displayName = "FloatingButton";

export default FloatingButton;