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

function generateCryptoId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

const withDashboardPath = (href: string): string => `${DASHBOARD_PREFIX}${href}`;

// ============================================================================
// MEMOIZED SUB-COMPONENTS
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
    className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-zinc-600 transition-all duration-200 hover:bg-yellow-400 hover:text-black hover:border-zinc-300 disabled:opacity-40 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
  >
    {item.label}
  </button>
));
QuickPromptBadge.displayName = "QuickPromptBadge";

const LoadingIndicator = memo(() => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex w-fit items-center gap-2.5 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-md"
  >
    <Zap size={14} className="text-yellow-500 fill-yellow-500 animate-pulse" />
    <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
      Compiling Financial Vectors...
    </span>
  </motion.div>
));
LoadingIndicator.displayName = "LoadingIndicator";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ChatWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const finance = useFinanceContext();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  useEffect(() => {
    setMessages((prev) => 
      prev.length === 1 && (prev[0].id === "initial_empty" || prev[0].id === "initial_hydrated") 
        ? [initialMessage] 
        : prev
    );
  }, [initialMessage]);

  const clearChatContext = (): void => {
    if (window.confirm("Purge conversation context? Let's refresh the system dynamics! 🧹")) {
      if (isLoading) {
        abortControllerRef.current?.abort();
      }
      setMessages([initialMessage]);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollAreaRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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

  const executePromptStream = async (textPrompt: string): Promise<void> => {
    if (!textPrompt.trim() || isLoading) return;

    const userMessageNode: ChatMessage = {
      id: generateCryptoId(),
      role: "user",
      content: textPrompt.trim()
    };

    const operationalHistory = [...messages, userMessageNode]
      .filter((m) => m.id !== "initial_empty" && m.id !== "initial_hydrated" && !m.isError)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessageNode]);
    setIsLoading(true);

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

  const parseInlineTokens = (text: string): React.ReactNode[] | string => {
    const formattingPatternMatch = /(\*\*.*?\*\*|`.*?`)/g;
    if (!formattingPatternMatch.test(text)) return text;

    const matchingSlices = text.split(formattingPatternMatch);
    return matchingSlices.map((sliceToken, identityIndex) => {
      if (sliceToken.startsWith("**") && sliceToken.endsWith("**")) {
        return (
          <strong key={identityIndex} className="font-extrabold text-zinc-950 underline decoration-yellow-500/50 decoration-2">
            {sliceToken.slice(2, -2)}
          </strong>
        );
      }
      if (sliceToken.startsWith("`") && sliceToken.endsWith("`")) {
        return (
          <code key={identityIndex} className="px-1.5 py-0.5 bg-zinc-100 rounded font-mono text-[11px] text-zinc-900 border border-zinc-200">
            {sliceToken.slice(1, -1)}
          </code>
        );
      }
      return sliceToken;
    });
  };

  const parseInlinedMarkdownElements = (rawTextContent: string) => {
    return rawTextContent.split("\n").map((textLine, trackingIndex) => {
      const cleanLine = textLine.trim();

      if (cleanLine.startsWith("### ")) {
        return (
          <h4 key={trackingIndex} className="text-xs font-black text-zinc-900 uppercase tracking-widest mt-4 mb-1.5">
            {parseInlineTokens(cleanLine.slice(4))}
          </h4>
        );
      }
      if (cleanLine.startsWith("## ")) {
        return (
          <h3 key={trackingIndex} className="text-sm font-black text-zinc-950 border-b border-zinc-200 pb-1 mt-5 mb-2 uppercase tracking-wide">
            {parseInlineTokens(cleanLine.slice(3))}
          </h3>
        );
      }

      if (cleanLine.startsWith("- ") || cleanLine.startsWith("* ")) {
        return (
          <div key={trackingIndex} className="flex items-start gap-2.5 ml-2 mt-1">
            <span className="text-yellow-500 select-none mt-1 shrink-0 text-[10px]">✦</span>
            <span className="text-zinc-700 text-sm leading-relaxed">
              {parseInlineTokens(cleanLine.slice(2))}
            </span>
          </div>
        );
      }

      const numberedListMatch = cleanLine.match(/^(\d+)\.\s(.*)/);
      if (numberedListMatch) {
        return (
          <div key={trackingIndex} className="flex items-start gap-2 ml-2 mt-1">
            <span className="text-yellow-500 font-black text-xs select-none mt-0.5 shrink-0">
              {numberedListMatch[1]}.
            </span>
            <span className="text-zinc-700 text-sm leading-relaxed">
              {parseInlineTokens(numberedListMatch[2])}
            </span>
          </div>
        );
      }

      return (
        <p key={trackingIndex} className={cn("min-h-[1.2rem] text-zinc-700 text-sm leading-relaxed", trackingIndex > 0 && "mt-2")}>
          {parseInlineTokens(textLine)}
        </p>
      );
    });
  };

  if (HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  return (
    <>
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
          "fixed bottom-28 right-4 z-[100] flex h-14 w-14 items-center justify-center rounded-full shadow-lg sm:right-6 sm:h-16 sm:w-16 lg:bottom-8 transition-shadow duration-300",
          "bg-[#FACC15] hover:bg-yellow-400 text-black border-2 border-zinc-950",
          isOpen && "hidden"
        )}
      >
        <Sparkles size={26} />
      </motion.button>

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
            className="fixed inset-x-3 bottom-28 z-[101] flex flex-col overflow-hidden rounded-[24px] border-2 border-zinc-950 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:inset-x-auto sm:right-6 lg:bottom-8"
          >
            {/* Header */}
            <header className="flex items-center justify-between gap-3 border-b-2 border-zinc-950 bg-zinc-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-zinc-950 bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <MessageCircle size={22} className="text-zinc-900" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base tracking-tight text-zinc-950">VibeCheck AI</h3>
                    <span className="bg-yellow-400 border border-zinc-950 text-zinc-950 px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase">PREMIUM</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full ring-2 ring-zinc-950 transition-all duration-500",
                        isLoading || finance?.loading
                          ? "bg-yellow-400 animate-pulse" 
                          : "bg-green-400"
                      )}
                    />
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
                      {isLoading ? "Streaming Matrix Context..." : "Secure Ledger Pipeline Synced"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
                  className="hidden sm:flex rounded-lg p-2 text-zinc-500 border border-transparent hover:border-zinc-950 hover:bg-zinc-100 hover:text-zinc-950"
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  type="button"
                  onClick={clearChatContext}
                  aria-label="Clear context"
                  className="rounded-lg p-2 text-zinc-500 border border-transparent hover:border-zinc-950 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close panel"
                  className="rounded-lg p-2 text-zinc-500 border border-transparent hover:border-zinc-950 hover:bg-zinc-100 hover:text-zinc-950"
                >
                  <ChevronDown size={20} />
                </button>
              </div>
            </header>

            {/* Quick Suggestions Panel */}
            <section 
              aria-label="Quick suggestions panel"
              className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto px-4 pt-3.5 pb-2 border-b border-zinc-150 bg-zinc-50/50"
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

            {/* Chat Messages */}
            <section 
              ref={scrollAreaRef}
              aria-live="polite"
              aria-relevant="additions text"
              className="no-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto bg-zinc-50/50 p-4 sm:space-y-6 sm:p-5"
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
                      "max-w-[88%] rounded-[20px] px-4 py-3 text-sm font-medium leading-relaxed border transition-all duration-300",
                      messageNode.role === "user"
                        ? "bg-gradient-to-br from-yellow-400 to-amber-400 text-black font-bold border-zinc-950 rounded-tr-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        : messageNode.isError 
                        ? "bg-red-50 border-red-200 text-red-600 rounded-tl-none flex items-start gap-2"
                        : "bg-white border-zinc-200 text-zinc-900 rounded-tl-none shadow-sm"
                    )}
                  >
                    {messageNode.isError && <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                    <div>
                      {messageNode.role === "assistant" 
                        ? parseInlinedMarkdownElements(messageNode.content) 
                        : messageNode.content}
                    </div>
                  </div>
                  <span className="text-[8px] mt-1.5 font-bold tracking-widest uppercase px-2 text-zinc-500">
                    {messageNode.role === "user" ? "Client Device" : messageNode.isError ? "System Pipeline Error" : "VibeCheck Matrix"}
                  </span>
                </motion.div>
              ))}
              
              {isLoading && messages[messages.length - 1]?.content === "" && (
                <LoadingIndicator />
              )}
            </section>

            {/* Footer Input Area */}
            <footer className="shrink-0 border-t-2 border-zinc-950 bg-white p-4">
              <form onSubmit={handleFormSubmission} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-label="Terminal prompt input"
                  placeholder="Query cash trends, goal forecasting, safety values..."
                  disabled={isLoading}
                  className="w-full rounded-[20px] border-2 border-zinc-950 bg-zinc-50 py-4 pl-5 pr-14 text-sm font-bold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 transition-all duration-300"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2.5 rounded-xl bg-[#FACC15] hover:bg-yellow-400 p-2.5 text-black border border-zinc-950 transition-all duration-300 hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
                >
                  <Send size={18} className="stroke-[2.5]" />
                </button>
              </form>
              
              <div className="pointer-events-none mt-3.5 flex justify-center gap-5">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={11} className="text-zinc-500" />
                  <span className="text-[8px] font-black tracking-widest uppercase text-zinc-500">Gemini 2.5 Flash Stream</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={11} className="text-zinc-500" />
                  <span className="text-[8px] font-black tracking-widest uppercase text-zinc-500">Isolated Context Ledger</span>
                </div>
              </div>
            </footer>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}