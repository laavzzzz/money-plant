"use client";

import React, { useState, useRef, useEffect, useMemo, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  Send,
  ChevronDown,
  MessageCircle,
  MessageSquare,
  TrendingUp,
  Trash2,
  Maximize2,
  Minimize2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceContext } from "@/components/providers/FinanceProvider";

// ============================================================================
// TYPE DEFINITIONS & SCHEMAS
// ============================================================================

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

interface QuickPromptItem {
  label: string;
  query?: string;
  href?: string;
}

// ============================================================================
// CONSTANTS & UTILITIES
// ============================================================================

const HIDDEN_PATHS: readonly string[] = ["/", "/login"];
const DASHBOARD_PREFIX = "/dashboard";

const QUICK_PROMPTS: readonly QuickPromptItem[] = [
  { label: "Spending Vibe", query: "Analyze my spending. How much am I dropping on 'Subscriptions' and 'Food' specifically?" },
  { label: "Safe to Spend", query: "How much can I safely spend right now based on my income and expenses?" },
  { label: "Income Mix", query: "What is my income split between Salary and Freelance/Side-hustles?" },
  { label: "Manifest Goal", query: "How close am I to my Dream Vault goals? Give me a timeline based on my current streak." },
  { label: "7-Day Plan", query: "Make me a practical 7-day saving plan from my current money data." },
  { label: "Can I Buy?", query: "Can I buy something worth ₹2,000 right now? Explain the tradeoff." },
  { label: "Add Expense", href: "/transactions" },
  { label: "Analytics", href: "/analytics" },
  { label: "Goals", href: "/goals" },
  { label: "Garden", href: "/garden" },
  { label: "Dream Vault", href: "/wishlist" },
  { label: "Leaderboard", href: "/leaderboard" },
];

/**
 * Generates a collision-resistant pseudorandom runtime structural identifier.
 */
function generateCryptoId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

/**
 * Safely normalizes application relative hyper-links matching configuration layouts.
 */
const withDashboardPath = (href: string): string => `${DASHBOARD_PREFIX}${href}`;

// ============================================================================
// MEMOIZED SUB-COMPONENTS (Performance Optimization against Re-renders)
// ============================================================================

const QuickPromptBadge = memo(({ item, disabled, onClick }: {
  item: QuickPromptItem;
  disabled: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-zinc-300 transition-all duration-200 hover:bg-yellow-400 hover:text-black hover:border-transparent disabled:opacity-40 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
  >
    {item.label}
  </button>
));
QuickPromptBadge.displayName = "QuickPromptBadge";

const LoadingIndicator = memo(() => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex w-fit items-center gap-2.5 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 shadow-2xl"
  >
    <Zap size={14} className="text-yellow-400 fill-yellow-400 animate-pulse" />
    <span className="text-[10px] font-black tracking-widest text-white/60 uppercase">
      Compiling Financial Vectors...
    </span>
  </motion.div>
));
LoadingIndicator.displayName = "LoadingIndicator";

// ============================================================================
// MAIN COMPONENT INTERFACE
// ============================================================================

export default function ChatWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const finance = useFinanceContext();

  // 1. Core Component Reactive Hooks
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 2. Synthesize Initial System Greetings Based on Hydrated Context
  const initialMessage = useMemo((): ChatMessage => {
    const userName = finance?.profile?.name ? finance.profile.name.split(" ")[0] : "Legend";
    const totalSavings = finance?.savings ? finance.savings.toLocaleString("en-IN") : "0";
    const currentStreak = finance?.streak ?? 0;

    if (!finance || finance.transactionCount === 0) {
      return {
        id: "initial_empty",
        role: "assistant",
        content: "Yo! I'm VibeCheck AI, your core financial companion. 🌿 Your transaction index is currently clean. Open the Transactions module to log some data, then let me run an analytics audit on your spend aura.",
      };
    }

    return {
      id: "initial_hydrated",
      role: "assistant",
      content: `Yo ${userName}! VibeCheck AI is synced. You're holding **₹${totalSavings}** in net savings with a steady **${currentStreak}-day streak**. Let's review your spending landscape or hit a specific target. What's the play?`,
    };
  }, [finance]);

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);

  // Synchronize initial greeting updates when contextual ledger changes state
  useEffect(() => {
    setMessages((prev) => 
      prev.length === 1 && (prev[0].id === "initial_empty" || prev[0].id === "initial_hydrated") 
        ? [initialMessage] 
        : prev
    );
  }, [initialMessage]);

  // 3. Layout Control Actions & Context Clearing
  const clearChatContext = (): void => {
    if (window.confirm("Purge conversation context? Let's refresh the system dynamics! 🧹")) {
      if (isLoading) {
        abortControllerRef.current?.abort();
      }
      setMessages([initialMessage]);
    }
  };

  // 4. Viewport Scroll Mechanics Enforcements
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

  // 5. Cleanup Listeners on Component Destruction Pattern
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 6. Global Window Custom Event Handlers & Hotkeys Mapping Engine (Ctrl/Cmd + K)
  useEffect(() => {
    const handleOpenEvent = (): void => setIsOpen(true);
    const handleToggleEvent = (): void => setIsOpen((prev) => !prev);
    
    const handleGlobalKeybind = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleToggleEvent();
      }
    };

    window.addEventListener("vibecheck:open", handleOpenEvent);
    window.addEventListener("vibecheck:toggle", handleToggleEvent);
    window.addEventListener("keydown", handleGlobalKeybind);
    
    return () => {
      window.removeEventListener("vibecheck:open", handleOpenEvent);
      window.removeEventListener("vibecheck:toggle", handleToggleEvent);
      window.removeEventListener("keydown", handleGlobalKeybind);
    };
  }, []);

  // 7. Core Core Streaming Engine Communication Layer
  const executePromptStream = async (textPrompt: string): Promise<void> => {
    if (!textPrompt.trim() || isLoading) return;

    const userMessageNode: ChatMessage = {
      id: generateCryptoId(),
      role: "user",
      content: textPrompt.trim()
    };

    // Construct linear history array filtering error fallbacks and initial templates out
    const operationalHistory = [...messages, userMessageNode]
      .filter((m) => m.id !== "initial_empty" && m.id !== "initial_hydrated" && !m.isError)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessageNode]);
    setIsLoading(true);

    // Enforce clear race-conditions management loops
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const targetPayload = await fetch("/api/vibecheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: operationalHistory,
          context: {
            pathname: pathname || "",
            profile: finance?.profile || {},
            income: finance?.income || 0,
            expense: finance?.expense || 0,
            savings: finance?.savings || 0,
            safeToSpend: finance?.safeToSpend || 0,
            plantStage: finance?.plantStage || {},
            plantStatus: finance?.plantStatus || "",
            streak: finance?.streak || 0,
            categoryTotals: finance?.categoryTotals || {},
            recentTransactions: finance?.recentTransactions || [],
            transactionCount: finance?.transactionCount || 0,
          },
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!targetPayload.ok) {
        let dynamicErrorMessage = "VibeCheck backend sync interrupted. Re-evaluating network parameters.";
        try {
          const parsingExceptionBlock = await targetPayload.json();
          dynamicErrorMessage = parsingExceptionBlock.message ?? parsingExceptionBlock.error ?? dynamicErrorMessage;
        } catch (_) {}
        throw new Error(dynamicErrorMessage);
      }

      const transportStreamReader = targetPayload.body?.getReader();
      const stringTokenDecoder = new TextDecoder("utf-8");
      if (!transportStreamReader) throw new Error("Null data stream pipe initialized.");

      const computationalAssistantId = generateCryptoId();
      setMessages((prev) => [...prev, { id: computationalAssistantId, role: "assistant", content: "" }]);

      let textBufferAccumulator = "";
      
      while (true) {
        const { done, value } = await transportStreamReader.read();
        if (done) break;
        
        textBufferAccumulator += stringTokenDecoder.decode(value, { stream: true });
        
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === computationalAssistantId ? { ...msg, content: textBufferAccumulator } : msg
          )
        );
      }
      
      stringTokenDecoder.decode(new Uint8Array(), { stream: false });

    } catch (streamError: any) {
      if (streamError instanceof Error && streamError.name === "AbortError") return;
      
      const parsedCrashFallbackString = streamError instanceof Error 
        ? streamError.message 
        : "Network protocol collision. Check pipeline connection.";
      
      setMessages((prev) => {
        const trailingNode = prev[prev.length - 1];
        if (trailingNode?.role === "assistant" && !trailingNode.content) {
          return prev.slice(0, -1).concat({
            id: generateCryptoId(),
            role: "assistant",
            content: parsedCrashFallbackString,
            isError: true,
          });
        }
        return [...prev, { id: generateCryptoId(), role: "assistant", content: parsedCrashFallbackString, isError: true }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmission = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const cleanRawInput = input;
    if (!cleanRawInput.trim()) return;
    setInput("");
    executePromptStream(cleanRawInput);
  };

  const handleQuickPromptExecution = (selectedItem: QuickPromptItem): void => {
    if (selectedItem.href) {
      setIsOpen(false);
      router.push(withDashboardPath(selectedItem.href));
      return;
    }
    if (selectedItem.query) {
      setIsOpen(true);
      executePromptStream(selectedItem.query);
    }
  };

  // 8. Custom Regex Tokens Parser mapping markdown characters safely to DOM segments
  const parseInlinedMarkdownElements = (rawTextContent: string) => {
    return rawTextContent.split("\n").map((textLine, trackingIndex) => {
      let renderableNodesArray: React.ReactNode[] = [];
      const formattingPatternMatch = /(\*\*.*?\*\*|`.*?`)/g;
      
      if (formattingPatternMatch.test(textLine)) {
        const matchingSlices = textLine.split(formattingPatternMatch);
        renderableNodesArray = matchingSlices.map((sliceToken, identityIndex) => {
          if (sliceToken.startsWith("**") && sliceToken.endsWith("**")) {
            return (
              <strong key={identityIndex} className="font-extrabold text-white underline decoration-yellow-400/40 decoration-2">
                {sliceToken.slice(2, -2)}
              </strong>
            );
          }
          if (sliceToken.startsWith("`") && sliceToken.endsWith("`")) {
            return (
              <code key={identityIndex} className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-xs text-yellow-300 border border-white/5">
                {sliceToken.slice(1, -1)}
              </code>
            );
          }
          return sliceToken;
        });
      } else {
        renderableNodesArray = [textLine];
      }
      
      return (
        <p key={trackingIndex} className={cn("min-h-[1.2rem] text-zinc-200", trackingIndex > 0 && "mt-2")}>
          {renderableNodesArray}
        </p>
      );
    });
  };

  // Guard rails mapping component visibility constraints cleanly
  if (HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  return (
    <>
      {/* Absolute Trigger Action Bubble Overlay */}
      <motion.button
        aria-label="Open VibeCheck AI Terminal"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        whileHover={{ scale: 1.08, rotate: 6 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-28 right-4 z-[100] flex h-14 w-14 items-center justify-center rounded-full shadow-[0_20px_50px_rgba(234,179,8,0.3)] sm:right-6 sm:h-16 sm:w-16 lg:bottom-8 transition-shadow duration-300",
          "bg-gradient-to-tr from-[#FFD700] via-[#FACC15] to-[#EAB308]",
          "text-black border-[3px] border-white/50",
          isOpen && "hidden"
        )}
      >
        <Sparkles size={26} className="animate-pulse" />
      </motion.button>

      {/* Main Streaming Chat Draw Deck Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            role="dialog"
            aria-label="VibeCheck AI Assistant Interface"
            initial={{ opacity: 0, y: 60, scale: 0.88 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isExpanded ? "min(94vw, 720px)" : "min(94vw, 420px)",
              height: isExpanded ? "min(85vh, 780px)" : "min(620px, calc(100dvh - 9rem))"
            }}
            exit={{ opacity: 0, y: 60, scale: 0.88 }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed inset-x-3 bottom-28 z-[101] flex flex-col overflow-hidden rounded-[32px] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.5)] ring-1 ring-white/10 sm:inset-x-auto sm:right-6 lg:bottom-8 bg-[#0C0C0E]/90 backdrop-blur-3xl"
          >
            {/* Control Panel Section Header */}
            <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:px-5 sm:py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 shadow-inner">
                  <MessageCircle size={24} className="text-yellow-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base tracking-tight text-white">VibeCheck AI</h3>
                    <span className="bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 px-1.5 py-0.5 rounded-md text-[8px] font-black tracking-widest uppercase">PREMIUM</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full ring-4 transition-all duration-500",
                        isLoading || finance?.loading
                          ? "bg-yellow-400 ring-yellow-400/20 animate-pulse" 
                          : "bg-green-500 ring-green-500/20"
                      )}
                    />
                    <span className="text-[9px] font-black uppercase tracking-wider text-white/50">
                      {isLoading ? "Streaming Matrix Context..." : "Secure Ledger Pipeline Synced"}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Context Actions Sub-navigation Row Layout */}
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  aria-label={isExpanded ? "Collapse panel dimensions" : "Expand panel dimensions"}
                  className="hidden sm:flex rounded-xl p-2 text-white/40 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  type="button"
                  onClick={clearChatContext}
                  aria-label="Clear active conversion memory cache values"
                  className="rounded-xl p-2 text-white/40 transition-all hover:bg-white/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Collapse panel view overlay window"
                  className="rounded-xl p-2 transition-all hover:bg-white/10 text-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                >
                  <ChevronDown size={22} />
                </button>
              </div>
            </header>

            {/* Horizontal Dynamic Badges Scroller Menu */}
            <section 
              aria-label="Quick financial query suggestions panel"
              className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto px-4 pt-3.5 pb-1"
            >
              {QUICK_PROMPTS.map((promptItem) => (
                <QuickPromptBadge
                  key={promptItem.label}
                  item={promptItem}
                  disabled={isLoading}
                  onClick={() => handleQuickPromptExecution(promptItem)}
                />
              ))}
            </section>

            {/* Conversational Layout Thread Canvas Viewport */}
            <section 
              ref={scrollAreaRef}
              aria-live="polite"
              aria-relevant="additions text"
              className="no-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto bg-black/20 p-4 sm:space-y-6 sm:p-5"
            >
              {messages.map((messageNode) => (
                <motion.div
                  key={messageNode.id}
                  layout="position"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex flex-col", messageNode.role === "user" ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "max-w-[88%] rounded-[24px] px-4 py-3.5 text-sm font-medium leading-relaxed shadow-xl border transition-all duration-300",
                      messageNode.role === "user"
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-black font-semibold border-white/20 rounded-tr-none shadow-yellow-400/10"
                        : messageNode.isError 
                        ? "bg-red-500/10 border-red-500/20 text-red-400 rounded-tl-none flex items-start gap-2"
                        : "bg-white/[0.03] border-white/10 text-white/90 rounded-tl-none"
                    )}
                  >
                    {messageNode.isError && <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                    <div>
                      {messageNode.role === "assistant" 
                        ? parseInlinedMarkdownElements(messageNode.content) 
                        : messageNode.content}
                    </div>
                  </div>
                  <span className="text-[8px] mt-1.5 font-black tracking-widest opacity-40 uppercase px-2 text-zinc-400">
                    {messageNode.role === "user" ? "Client Device" : messageNode.isError ? "System Pipeline Error" : "VibeCheck Matrix"}
                  </span>
                </motion.div>
              ))}
              
              {/* Dynamic Telemetry Loading Overlay Field */}
              {isLoading && messages[messages.length - 1]?.content === "" && (
                <LoadingIndicator />
              )}
            </section>

            {/* Interactive Form Context Controller Deck */}
            <footer className="shrink-0 border-t border-white/10 bg-[#0C0C0E]/95 p-4 backdrop-blur-2xl sm:p-5">
              <form onSubmit={handleFormSubmission} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-label="Direct interactive terminal prompt compilation entry input string"
                  placeholder="Query cash trends, goal forecasting, safety values..."
                  disabled={isLoading}
                  className="w-full rounded-[24px] border border-white/10 bg-white/5 py-4 pl-5 pr-14 text-sm font-semibold text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent disabled:opacity-50 transition-all duration-300"
                />
                <button
                  type="submit"
                  aria-label="Transmit prompt package to AI cluster"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2.5 rounded-2xl bg-yellow-400 p-2.5 text-black transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-10 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-400"
                >
                  <Send size={18} className="stroke-[2.5]" />
                </button>
              </form>
              
              {/* Secondary Telemetry Information Metrics */}
              <div className="pointer-events-none mt-3.5 flex justify-center gap-5 opacity-20">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={11} className="text-white" />
                  <span className="text-[8px] font-black tracking-widest uppercase text-white">Gemini 2.5 Flash Stream</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={11} className="text-white" />
                  <span className="text-[8px] font-black tracking-widest uppercase text-white">Isolated Context Ledger</span>
                </div>
              </div>
            </footer>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}