"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
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
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceContext } from "@/components/providers/FinanceProvider";
import FloatingButton from "@/components/ai/FloatingButton";

// ============================================================================
// TYPE DEFINITIONS & DOMAIN MODELS
// ============================================================================

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  readonly id: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly timestamp: number;
  readonly isError?: boolean;
}

export interface QuickPromptItem {
  readonly label: string;
  readonly query?: string;
  readonly href?: string;
}

export interface ContextPayload {
  readonly pathname: string;
  readonly profile: Record<string, unknown>;
  readonly income: number;
  readonly expense: number;
  readonly savings: number;
  readonly safeToSpend: number;
  readonly plantStage: Record<string, unknown>;
  readonly plantStatus: string;
  readonly streak: number;
  readonly categoryTotals: Record<string, number>;
  readonly recentTransactions: readonly unknown[];
  readonly transactionCount: number;
}

// ============================================================================
// SYSTEM CONFIGURATION & CONSTANTS
// ============================================================================

const API_ENDPOINT =
  process.env.NEXT_PUBLIC_AI_API_ENDPOINT || "/api/ai";

const HIDDEN_PATHS: readonly string[] = ["/", "/login"] as const;
const DASHBOARD_PREFIX = "/dashboard" as const;

const QUICK_PROMPTS: readonly QuickPromptItem[] = [
  {
    label: "Spending Vibe",
    query:
      "Analyze my spending. How much am I dropping on 'Subscriptions' and 'Food' specifically?",
  },
  {
    label: "Safe to Spend",
    query:
      "How much can I safely spend right now based on my income and expenses?",
  },
  {
    label: "Income Mix",
    query:
      "What is my income split between Salary and Freelance/Side-hustles?",
  },
  {
    label: "Manifest Goal",
    query:
      "How close am I to my Dream Vault goals? Give me a timeline based on my current streak.",
  },
  {
    label: "7-Day Plan",
    query:
      "Make me a practical 7-day saving plan from my current money data.",
  },
  {
    label: "Can I Buy?",
    query:
      "Can I buy something worth ₹2,000 right now? Explain the tradeoff.",
  },
  { label: "Add Expense", href: "/transactions" },
  { label: "Analytics", href: "/analytics" },
  { label: "Goals", href: "/goals" },
  { label: "Garden", href: "/garden" },
  { label: "Dream Vault", href: "/wishlist" },
  { label: "Leaderboard", href: "/leaderboard" },
] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a cryptographically secure unique identifier for stream nodes.
 */
function generateSecureId(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Math.random().toString(36).substring(2, 11)}-${Date.now().toString(36)}`;
}

/**
 * Normalizes navigation route paths by prepending dashboard scope.
 */
function resolveDashboardRoute(href: string): string {
  if (href.startsWith(DASHBOARD_PREFIX)) return href;
  return `${DASHBOARD_PREFIX}${href.startsWith("/") ? "" : "/"}${href}`;
}

// ============================================================================
// MEMOIZED SUB-COMPONENTS
// ============================================================================

/**
 * Renders formatted inline markdown elements safely.
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={idx}
          className="font-black text-zinc-950 underline decoration-amber-400 decoration-2"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          className="rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-zinc-900"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={idx} className="italic text-zinc-900">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

/**
 * Enterprise Markdown Parser component.
 */
const MarkdownRenderer = memo(({ content }: { content: string }) => {
  const elements = useMemo(() => {
    const lines = content.split("\n");
    return lines.map((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        return <div key={index} className="h-2" />;
      }

      if (trimmed.startsWith("### ")) {
        return (
          <h4
            key={index}
            className="mt-3 mb-1 text-xs font-black uppercase tracking-wider text-zinc-950"
          >
            {renderInlineMarkdown(trimmed.slice(4))}
          </h4>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h3
            key={index}
            className="mt-4 mb-2 border-b border-zinc-200 pb-1 text-sm font-black uppercase tracking-wide text-zinc-950"
          >
            {renderInlineMarkdown(trimmed.slice(3))}
          </h3>
        );
      }

      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <div key={index} className="ml-2 mt-1 flex items-start gap-2">
            <span className="mt-1 shrink-0 text-[10px] text-amber-500">✦</span>
            <span className="text-sm leading-relaxed text-zinc-800">
              {renderInlineMarkdown(trimmed.slice(2))}
            </span>
          </div>
        );
      }

      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numberedMatch) {
        return (
          <div key={index} className="ml-2 mt-1 flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-xs font-black text-amber-500">
              {numberedMatch[1]}.
            </span>
            <span className="text-sm leading-relaxed text-zinc-800">
              {renderInlineMarkdown(numberedMatch[2])}
            </span>
          </div>
        );
      }

      return (
        <p key={index} className="mt-1.5 text-sm leading-relaxed text-zinc-800">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  }, [content]);

  return <div className="space-y-0.5">{elements}</div>;
});
MarkdownRenderer.displayName = "MarkdownRenderer";

const QuickPromptBadge = memo(
  ({
    item,
    disabled,
    onClick,
  }: {
    item: QuickPromptItem;
    disabled: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-600 transition-all duration-200",
        "hover:border-zinc-950 hover:bg-amber-400 hover:text-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:pointer-events-none disabled:opacity-40"
      )}
    >
      {item.label}
    </button>
  )
);
QuickPromptBadge.displayName = "QuickPromptBadge";

const StreamLoadingIndicator = memo(() => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="flex w-fit items-center gap-2.5 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm"
  >
    <Zap size={14} className="animate-pulse fill-amber-500 text-amber-500" />
    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
      Synthesizing Financial Context Stream...
    </span>
  </motion.div>
));
StreamLoadingIndicator.displayName = "StreamLoadingIndicator";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function VibeCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const finance = useFinanceContext();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Hydrated initial greeting derived from active financial context state
  const initialMessage = useMemo((): ChatMessage => {
    const userName = finance?.profile?.name
      ? String(finance.profile.name).split(" ")[0]
      : "Legend";
    const totalSavings = (finance?.savings ?? 0).toLocaleString("en-IN");
    const currentStreak = finance?.streak ?? 0;

    if (!finance || finance.transactionCount === 0) {
      return {
        id: "initial_empty",
        role: "assistant",
        content:
          "Yo! I'm **VibeCheck AI**, your financial copilot. 🌿 Your transaction index is looking clean. Log some transactions, and let's optimize your financial momentum.",
        timestamp: Date.now(),
      };
    }

    return {
      id: "initial_hydrated",
      role: "assistant",
      content: `Yo **${userName}**! VibeCheck AI is synced. You're holding **₹${totalSavings}** in net savings with a **${currentStreak}-day streak** active. What's our next play?`,
      timestamp: Date.now(),
    };
  }, [finance]);

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);

  // Synchronize greeting when finance state finishes initial hydration
  useEffect(() => {
    setMessages((prev) => {
      if (
        prev.length === 1 &&
        (prev[0].id === "initial_empty" || prev[0].id === "initial_hydrated")
      ) {
        return [initialMessage];
      }
      return prev;
    });
  }, [initialMessage]);

  // Auto-scroll message stream on update
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  // Focus input automatically when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Global event listeners and hotkey handlers (Ctrl/Cmd + K)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleToggle = () => setIsOpen((prev) => !prev);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleToggle();
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("vibecheck:open", handleOpen);
    window.addEventListener("vibecheck:toggle", handleToggle);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("vibecheck:open", handleOpen);
      window.removeEventListener("vibecheck:toggle", handleToggle);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Abort active fetch controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const clearChatContext = useCallback(() => {
    if (
      window.confirm(
        "Purge conversation context? This will reset the AI memory for this session."
      )
    ) {
      if (isLoading) {
        abortControllerRef.current?.abort();
      }
      setMessages([initialMessage]);
    }
  }, [isLoading, initialMessage]);

  const executePromptStream = useCallback(
    async (textPrompt: string) => {
      const cleanPrompt = textPrompt.trim();
      if (!cleanPrompt || isLoading) return;

      const userMessage: ChatMessage = {
        id: generateSecureId(),
        role: "user",
        content: cleanPrompt,
        timestamp: Date.now(),
      };

      const operationalHistory = [...messages, userMessage]
        .filter(
          (m) =>
            m.id !== "initial_empty" &&
            m.id !== "initial_hydrated" &&
            !m.isError
        )
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const contextPayload: ContextPayload = {
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
      };

      try {
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: operationalHistory,
            context: contextPayload,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          let errorMsg = `Server error status ${response.status}. Failed to communicate with VibeCheck AI.`;
          try {
            const errJson = await response.json();
            errorMsg = errJson.message ?? errJson.error ?? errorMsg;
          } catch {
            // Fallback to generic error message
          }
          throw new Error(errorMsg);
        }

        if (!response.body) {
          throw new Error("Received empty response payload stream.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        const assistantId = generateSecureId();

        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            timestamp: Date.now(),
          },
        ]);

        let accumulatedContent = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            accumulatedContent += decoder.decode(value, { stream: true });

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: accumulatedContent }
                  : msg
              )
            );
          }
        } finally {
          reader.releaseLock();
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        const fallbackErrorText =
          err instanceof Error
            ? err.message
            : "Network boundary error. Please check your system connection.";

        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === "assistant" && !lastMsg.content) {
            return prev.slice(0, -1).concat({
              id: generateSecureId(),
              role: "assistant",
              content: fallbackErrorText,
              timestamp: Date.now(),
              isError: true,
            });
          }
          return [
            ...prev,
            {
              id: generateSecureId(),
              role: "assistant",
              content: fallbackErrorText,
              timestamp: Date.now(),
              isError: true,
            },
          ];
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, pathname, finance]
  );

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput("");
    executePromptStream(currentInput);
  };

  const handleQuickPromptClick = useCallback(
    (item: QuickPromptItem) => {
      if (item.href) {
        setIsOpen(false);
        router.push(resolveDashboardRoute(item.href));
        return;
      }
      if (item.query) {
        setIsOpen(true);
        executePromptStream(item.query);
      }
    },
    [router, executePromptStream]
  );

  if (pathname && HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  return (
    <>
      {/* Floating Action Trigger Button */}
      <FloatingButton
        isPanelOpen={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      />

      {/* Interactive AI Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="VibeCheck AI Interface"
            id="vibecheck-assistant-panel"
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              width: isExpanded ? "min(94vw, 760px)" : "min(94vw, 440px)",
              height: isExpanded
                ? "min(88vh, 820px)"
                : "min(640px, calc(100dvh - 8rem))",
            }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed inset-x-3 bottom-24 z-[101] flex flex-col overflow-hidden rounded-[24px] border-2 border-zinc-950 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:inset-x-auto sm:right-6 lg:bottom-8"
          >
            {/* Header Control Bar */}
            <header className="flex shrink-0 items-center justify-between border-b-2 border-zinc-950 bg-zinc-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-zinc-950 bg-amber-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <MessageCircle size={22} className="text-zinc-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black tracking-tight text-zinc-950">
                      VibeCheck AI
                    </h3>
                    <span className="rounded border border-zinc-950 bg-amber-400 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-zinc-950">
                      PRO STREAM
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full ring-2 ring-zinc-950 transition-colors duration-300",
                        isLoading || finance?.loading
                          ? "animate-pulse bg-amber-400"
                          : "bg-emerald-400"
                      )}
                    />
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
                      {isLoading
                        ? "Synthesizing Stream..."
                        : "Encrypted Context Synced"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  aria-label={isExpanded ? "Collapse modal" : "Expand modal"}
                  className="hidden rounded-lg p-2 text-zinc-500 transition-colors hover:border hover:border-zinc-950 hover:bg-zinc-100 hover:text-zinc-950 sm:flex"
                >
                  {isExpanded ? (
                    <Minimize2 size={16} />
                  ) : (
                    <Maximize2 size={16} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={clearChatContext}
                  aria-label="Clear chat context history"
                  className="rounded-lg p-2 text-zinc-500 transition-colors hover:border hover:border-zinc-950 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close modal"
                  className="rounded-lg p-2 text-zinc-500 transition-colors hover:border hover:border-zinc-950 hover:bg-zinc-100 hover:text-zinc-950"
                >
                  <ChevronDown size={20} />
                </button>
              </div>
            </header>

            {/* Quick Prompts Navigation Strip */}
            <section
              aria-label="Quick Prompt Suggestions"
              className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto border-b border-zinc-150 bg-zinc-50/50 px-4 py-3"
            >
              {QUICK_PROMPTS.map((promptItem) => (
                <QuickPromptBadge
                  key={promptItem.label}
                  item={promptItem}
                  disabled={isLoading}
                  onClick={() => handleQuickPromptClick(promptItem)}
                />
              ))}
            </section>

            {/* Scrollable Message Thread */}
            <section
              ref={scrollAreaRef}
              aria-live="polite"
              aria-relevant="additions text"
              className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto bg-zinc-50/30 p-4 sm:p-5"
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  layout="position"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col",
                    message.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[88%] rounded-[20px] px-4 py-3 text-sm transition-all duration-200",
                      message.role === "user"
                        ? "rounded-tr-none border-2 border-zinc-950 bg-amber-400 font-bold text-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        : message.isError
                          ? "flex items-start gap-2 rounded-tl-none border border-red-300 bg-red-50 text-red-600"
                          : "rounded-tl-none border border-zinc-200 bg-white font-medium text-zinc-900 shadow-sm"
                    )}
                  >
                    {message.isError && (
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    )}
                    <div>
                      {message.role === "assistant" ? (
                        <MarkdownRenderer content={message.content} />
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                  <span className="mt-1 px-2 text-[8px] font-black uppercase tracking-widest text-zinc-400">
                    {message.role === "user"
                      ? "Client Input"
                      : message.isError
                        ? "Pipeline Fault"
                        : "VibeCheck Intelligence"}
                  </span>
                </motion.div>
              ))}

              {isLoading &&
                messages[messages.length - 1]?.content === "" && (
                  <StreamLoadingIndicator />
                )}
            </section>

            {/* Footer Form Input */}
            <footer className="shrink-0 border-t-2 border-zinc-950 bg-white p-4">
              <form
                onSubmit={handleFormSubmit}
                className="relative flex items-center"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-label="VibeCheck prompt query input"
                  placeholder="Ask about spending vibes, savings goals..."
                  disabled={isLoading}
                  className={cn(
                    "w-full rounded-[20px] border-2 border-zinc-950 bg-zinc-50 py-3.5 pl-4 pr-14 text-sm font-bold text-zinc-950 placeholder:text-zinc-400 transition-all",
                    "focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                  )}
                />
                <button
                  type="submit"
                  aria-label="Send query"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "absolute right-2 rounded-xl border border-zinc-950 bg-amber-400 p-2 text-zinc-950 transition-all",
                    "hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-40"
                  )}
                >
                  <Send size={18} className="stroke-[2.5]" />
                </button>
              </form>

              <div className="pointer-events-none mt-3 flex items-center justify-center gap-6 text-[8px] font-black uppercase tracking-widest text-zinc-400">
                <span className="flex items-center gap-1">
                  <TrendingUp size={11} className="text-zinc-500" />
                  Gemini 2.5 Flash
                </span>
                <span className="flex items-center gap-1">
                  <Terminal size={11} className="text-zinc-500" />
                  Isolated Context
                </span>
              </div>
            </footer>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}