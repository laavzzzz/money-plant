"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPE DEFINITIONS & SCHEMAS
// ============================================================================

interface FloatingButtonProps {
  /**
   * Action trigger callback executed upon primary mouse click or keyboard confirmation.
   */
  onClick: (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void;
  /**
   * State binding flag reflecting whether the associated VibeCheck panel is currently visible.
   * Maps automatically to the component's underlying ARIA layout attributes.
   */
  isPanelOpen?: boolean;
  /**
   * Optional structural modifier allowing structural pass-through styles to override positions securely.
   */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT INTERFACE
// ============================================================================

/**
 * Premium Enterprise-Grade Floating Action Button (FAB) Trigger.
 * Designed with dynamic spring telemetry, full screen-reader compliance,
 * and seamless styling sync for the VibeCheck conversational platform workspace.
 */
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
        boxShadow: "0 25px 60px rgba(234, 179, 8, 0.4)"
      }}
      whileTap={{ scale: 0.92 }}
      transition={{ 
        type: "spring", 
        damping: 18, 
        stiffness: 300 
      }}
      onClick={onClick}
      className={cn(
        // Core Layout and Anchor Coordinates (Matching Layout Boundaries)
        "fixed bottom-28 right-4 z-[100] flex h-14 w-14 items-center justify-center rounded-full sm:right-6 sm:h-16 sm:w-16 lg:bottom-8",
        // System Premium Design Canvas Alignment
        "bg-gradient-to-tr from-[#FFD700] via-[#FACC15] to-[#EAB308]",
        "text-black border-[3px] border-white/50 shadow-[0_20px_50px_rgba(234,179,8,0.3)]",
        // Precision Focus Target Ring Mapping
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        // Hardware Acceleration Configurations
        "will-change-transform select-none transform-gpu transition-shadow duration-300",
        className
      )}
    >
      <Sparkles 
        size={26} 
        className="pointer-events-none stroke-[2.2] animate-pulse" 
        aria-hidden="true"
      />
    </motion.button>
  );
});

// Explicit component tree identifier binding for clean production debugging stacks
FloatingButton.displayName = "FloatingButton";

export default FloatingButton;