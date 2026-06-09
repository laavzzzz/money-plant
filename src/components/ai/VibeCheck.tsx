"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceContext } from "@/components/providers/FinanceProvider";

function generateId() {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const HIDDEN_PATHS = ["/", "/login"];
const withDashboardPath = (href: string) => `/dashboard${href}`;

const QUICK_PROMPTS: Array<{
  label: string;
  query?: string;
  href?: string;
}> = [
  { label: "Spending Vibe", query: "Analyze my spending. How much am I dropping on 'Subscriptions' and 'Food' specifically?" },
  { label: "Safe to spend", query: "How much can I safely spend right now based on my income and expenses?" },
  { label: "Income Mix", query: "What is my income split between Salary and Freelance/Side-hustles?" },
  { label: "Manifest Goal", query: "How close am I to my Dream Vault goals? Give me a timeline based on my current streak." },
  { label: "7-day plan", query: "Make me a practical 7-day saving plan from my current money data." },
  { label: "Can I buy?", query: "Can I buy something worth ₹2,000 right now? Explain the tradeoff." },
  { label: "Add expense", href: "/transactions" },
  { label: "Analytics", href: "/analytics" },
  { label: "Goals", href: "/goals" },
  { label: "Garden", href: "/garden" },
  { label: "Dream Vault", href: "/wishlist" },
  { label: "Leaderboard", href: "/leaderboard" },
];

export default function VibeCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const finance = useFinanceContext();

  const initialMessage = useMemo((): ChatMessage => {
    if (finance.transactionCount === 0) {
      return {
        id: "initial",
        role: "assistant",
        content:
          "Hi, I'm VibeCheck AI, your MoneyPlant assistant. I do not see any transactions yet. Open Transactions to log income or spending, then ask me anything about your money.",
      };
    }
    return {
      id: "initial",
      role: "assistant",
      content: `Hi ${finance.profile.name.split(" ")[0]}, VibeCheck AI is synced with your data: ₹${finance.savings.toLocaleString("en-IN")} net savings and a ${finance.streak}-day streak. Ask about spending, goals, analytics, or where to go next.`,
    };
  }, [finance.transactionCount, finance.profile.name, finance.savings, finance.plantStage.name, finance.streak]);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);

  useEffect(() => {
    setMessages((prev) =>
      prev.length === 1 && prev[0].id === "initial" ? [initialMessage] : prev
    );
  }, [initialMessage]);

  const clearChat = () => {
    if (window.confirm("Clear our history? The vibes are fresh otherwise! 🧹")) {
      if (isLoading) abortControllerRef.current?.abort();
      setMessages([initialMessage]);
    }
  };

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    const onOpen = () => setIsOpen(true);
    window.addEventListener("vibecheck:open", onOpen);
    window.addEventListener("vibecheck:toggle", onOpen);
    return () => {
      window.removeEventListener("vibecheck:open", onOpen);
      window.removeEventListener("vibecheck:toggle", onOpen);
    };
  }, []);

  const sendToAI = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: generateId(), role: "user", content: text.trim() };
    const historyForApi = [...messages, userMessage].filter((m) => m.id !== "initial");

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForApi,
          context: {
            pathname: finance.pathname,
            profile: finance.profile,
            income: finance.income,
            expense: finance.expense,
            savings: finance.savings,
            safeToSpend: finance.safeToSpend,
            plantStage: finance.plantStage,
            plantStatus: finance.plantStatus,
            streak: finance.streak,
            categoryTotals: finance.categoryTotals,
            recentTransactions: finance.recentTransactions,
            transactionCount: finance.transactionCount,
          },
        }),
        signal: abortControllerRef.current.signal,
      });

      const contentType = response.headers.get("content-type") ?? "";

      if (!response.ok) {
        let errMsg =
          "VibeCheck AI could not respond right now. Please check the API setup and try again.";
        if (contentType.includes("application/json")) {
          const err = await response.json();
          errMsg = err.message ?? err.error ?? errMsg;
        }
        throw new Error(errMsg);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      const assistantId = generateId();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: msg.content + chunk } : msg
          )
        );
      }
      decoder.decode(new Uint8Array(), { stream: false });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      const errText =
        err instanceof Error
          ? err.message
          : "Connection failed. Please try again in a moment.";
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.content) {
          return prev.slice(0, -1).concat({
            id: generateId(),
            role: "assistant",
            content: errText,
          });
        }
        return [...prev, { id: generateId(), role: "assistant", content: errText }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input;
    setInput("");
    sendToAI(text);
  };

  const handleQuickPrompt = (item: (typeof QUICK_PROMPTS)[number]) => {
    if (item.href) {
      setIsOpen(false);
      router.push(withDashboardPath(item.href));
      return;
    }
    if (item.query) {
      setIsOpen(true);
      sendToAI(item.query);
    }
  };

  if (HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  return (
    <>
      <motion.button
        aria-label="Open VibeCheck AI"
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        whileHover={{ scale: 1.1, rotate: 8 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-28 right-4 z-[100] flex h-14 w-14 items-center justify-center rounded-full shadow-2xl sm:right-6 sm:h-16 sm:w-16 lg:bottom-8",
          "bg-gradient-to-tr from-[#FFD700] via-[#FACC15] to-[#EAB308]",
          "text-black border-2 border-white/40",
          isOpen && "hidden"
        )}
      >
        <Sparkles size={28} className="animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            aria-label="VibeCheck AI Assistant"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed inset-x-3 bottom-28 z-[101] flex h-[min(620px,calc(100dvh-9rem))] flex-col overflow-hidden rounded-[28px] border-white/20 shadow-[0_32px_64px_rgba(0,0,0,0.35)] ring-1 ring-white/10 glass-panel sm:inset-x-auto sm:right-6 sm:w-[420px] lg:bottom-8"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 sm:h-12 sm:w-12">
                  <MessageCircle size={26} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-base tracking-tight text-text-main">VibeCheck AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        finance.loading ? "bg-yellow-400 animate-pulse" : "bg-green-500"
                      )}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      {finance.loading ? "Syncing data…" : "Live data synced"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={clearChat}
                  aria-label="Clear chat"
                  className="rounded-xl p-2 text-text-main/40 transition-all hover:bg-white/10 hover:text-danger"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="rounded-xl p-2 transition-all hover:bg-white/10"
                >
                  <ChevronDown size={24} className="text-text-main" />
                </button>
              </div>
            </div>

            <div className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto px-4 pt-3">
              {QUICK_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickPrompt(item)}
                  className="shrink-0 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide transition-colors hover:bg-primary/20 disabled:opacity-40"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div
              ref={scrollAreaRef}
              className="no-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto bg-black/10 p-4 sm:space-y-6 sm:p-5 dark:bg-black/20"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "max-w-[88%] whitespace-pre-wrap rounded-[22px] p-4 text-sm font-bold leading-relaxed shadow-xl",
                      msg.role === "user"
                        ? "bg-gradient-to-br from-primary to-vibe-purple text-white rounded-tr-none"
                        : "bg-white/5 border border-white/10 text-text-main rounded-tl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] mt-1 font-black opacity-30 uppercase px-2">
                    {msg.role === "user" ? "You" : "VibeCheck"}
                  </span>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex w-fit animate-pulse items-center gap-2 rounded-full border border-white/5 bg-white/5 p-3">
                  <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-bold uppercase opacity-50">Reading your money data…</span>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="shrink-0 border-t border-white/10 bg-white/5 p-4 backdrop-blur-2xl sm:p-5"
            >
              <div className="relative flex items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-label="Message VibeCheck"
                  placeholder="Ask about spending, goals, analytics..."
                  disabled={isLoading}
                  className="w-full rounded-[22px] border border-white/10 bg-black/40 py-4 pl-5 pr-14 text-sm font-bold text-white ring-primary/50 placeholder:text-white/30 focus:outline-none focus:ring-2 disabled:opacity-50"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2.5 rounded-2xl bg-primary p-2.5 text-white transition-all hover:scale-110 active:scale-90 disabled:opacity-20"
                >
                  <Send size={22} />
                </button>
              </div>
              <div className="pointer-events-none mt-3 flex justify-center gap-4 opacity-30">
                <div className="flex items-center gap-1">
                  <TrendingUp size={10} />
                  <span className="text-[8px] font-black uppercase">GPT-4o mini</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare size={10} />
                  <span className="text-[8px] font-black uppercase">Your data only</span>
                </div>
              </div>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
