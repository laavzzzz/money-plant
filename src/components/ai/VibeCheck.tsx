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

const QUICK_PROMPTS: Array<{
  label: string;
  query?: string;
  href?: string;
}> = [
  { label: "My spending", query: "Break down my spending by category and tell me my biggest vibe killer." },
  { label: "Safe to spend", query: "How much can I safely spend right now based on my income and expenses?" },
  { label: "My profile", query: "Summarize my profile stats, aura, rank, and plant stage." },
  { label: "Add expense", href: "/transactions" },
  { label: "Garden", href: "/garden" },
  { label: "Wishlist", href: "/wishlist" },
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
          "Yo! I'm VibeCheck — your MoneyPlant AI. I don't see any transactions yet. Head to History (/transactions) to log income or spending, then ask me anything about your bread! 🌿",
      };
    }
    return {
      id: "initial",
      role: "assistant",
      content: `Hey ${finance.profile.name.split(" ")[0]}! I'm synced with your garden — ₹${finance.savings.toLocaleString("en-IN")} net, ${finance.plantStage.name}, ${finance.streak}-day streak. Ask about spending, your profile, or where to go in the app! 🌿`,
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
    return () => window.removeEventListener("vibecheck:open", onOpen);
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
        let errMsg = "VibeCheck couldn't reach the AI. Try again? 🔌";
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
        err instanceof Error ? err.message : "Connection failed. Try again! 🔌";
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
      router.push(item.href);
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
          "fixed bottom-28 right-6 z-[100] w-16 h-16 rounded-full shadow-2xl",
          "bg-gradient-to-tr from-[#FFD700] via-[#FACC15] to-[#EAB308]",
          "flex items-center justify-center text-black border-2 border-white/40",
          isOpen && "hidden"
        )}
      >
        <Sparkles size={30} className="animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            aria-label="VibeCheck AI Assistant"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-[101] w-[92vw] md:w-[420px] h-[620px] glass-panel flex flex-col shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden border-white/20 ring-1 ring-white/10"
          >
            <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <MessageCircle size={26} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-base tracking-tight text-text-main">VibeCheck AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        finance.loading ? "bg-yellow-400 animate-pulse" : "bg-green-500"
                      )}
                    />
                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">
                      {finance.loading ? "Syncing data…" : "Live data synced"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  aria-label="Clear chat"
                  className="p-2 hover:bg-white/10 rounded-xl transition-all text-text-main/40 hover:text-vibe-pink"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="p-2 hover:bg-white/10 rounded-xl transition-all"
                >
                  <ChevronDown size={24} className="text-text-main" />
                </button>
              </div>
            </div>

            <div className="px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
              {QUICK_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickPrompt(item)}
                  className="shrink-0 text-[10px] font-black uppercase tracking-wide px-3 py-1.5 rounded-full bg-white/10 border border-white/10 hover:bg-primary/20 transition-colors disabled:opacity-40"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div
              ref={scrollAreaRef}
              className="flex-1 overflow-y-auto p-5 space-y-6 bg-black/20 no-scrollbar min-h-0"
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
                      "max-w-[88%] p-4 rounded-[22px] text-sm font-bold leading-relaxed shadow-xl whitespace-pre-wrap",
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
                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-full w-fit animate-pulse border border-white/5">
                  <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-bold uppercase opacity-50">Reading your stacks…</span>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-5 bg-white/5 border-t border-white/10 backdrop-blur-2xl shrink-0"
            >
              <div className="relative flex items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-label="Message VibeCheck"
                  placeholder="Ask about spending, profile, or where to go…"
                  disabled={isLoading}
                  className="w-full bg-black/40 border border-white/10 rounded-[22px] py-4 pl-6 pr-14 text-sm font-bold text-white focus:outline-none focus:ring-2 ring-primary/50 disabled:opacity-50 placeholder:text-white/20"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2.5 p-2.5 rounded-2xl bg-primary text-white hover:scale-110 active:scale-90 disabled:opacity-20 transition-all"
                >
                  <Send size={22} />
                </button>
              </div>
              <div className="flex justify-center mt-3 gap-4 opacity-20 pointer-events-none">
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
