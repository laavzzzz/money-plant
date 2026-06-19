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
  Maximize2,
  Minimize2,
  AlertCircle,
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
  isError?: boolean;
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
    const userName = finance?.profile?.name ? finance.profile.name.split(" ")[0] : "Legend";
    const totalSavings = finance?.savings ? finance.savings.toLocaleString("en-IN") : "0";
    const currentStreak = finance?.streak ?? 0;

    if (!finance || finance.transactionCount === 0) {
      return {
        id: "initial",
        role: "assistant",
        content:
          "Yo! I'm VibeCheck AI, your core financial companion. 🌿 Your transaction index is currently clean. Open the Transactions module to log some data, then let me run an analytics audit on your spend aura.",
      };
    }
    return {
      id: "initial",
      role: "assistant",
      content: `Yo ${userName}! VibeCheck AI is synced. You're holding **₹${totalSavings}** in net savings with a steady **${currentStreak}-day streak**. Let's review your spending landscape or hit a specific target. What's the play?`,
    };
  }, [finance]);

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);

  // Synchronize initial greeting when contextual engine hydrates state
  useEffect(() => {
    setMessages((prev) =>
      prev.length === 1 && prev[0].id === "initial" ? [initialMessage] : prev
    );
  }, [initialMessage]);

  const clearChat = () => {
    if (window.confirm("Purge conversation context? Let's refresh the system dynamics! 🧹")) {
      if (isLoading) abortControllerRef.current?.abort();
      setMessages([initialMessage]);
    }
  };

  // Lock scroll execution parameters securely to message updates
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Abort lingering API configurations cleanly on component destruction
  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  // Window Custom Event Hooks and Hotkeys Mapping Engine (Ctrl + K or Cmd + K)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleToggle = () => setIsOpen((prev) => !prev);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        handleToggle();
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
  }, []);

  const sendToAI = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: generateId(), role: "user", content: text.trim() };
    const historyForApi = [...messages, userMessage]
      .filter((m) => m.id !== "initial" && !m.isError)
      .map(m => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      // 🔌 Connected to your high-performance vibecheck route
      const response = await fetch("/api/vibecheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForApi,
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

      if (!response.ok) {
        let errMsg = "VibeCheck backend sync interrupted. Re-evaluating network parameters.";
        try {
          const errData = await response.json();
          errMsg = errData.message ?? errData.error ?? errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      // Initialize Chunk Stream Engine Reader
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) throw new Error("Null data stream pipe initialized.");

      const assistantId = generateId();
      // Inject empty assistant node waiting to receive incoming string fragments
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      let streamingAccumulator = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        streamingAccumulator += decoder.decode(value, { stream: true });
        
        // Push incoming token strings instantly to state for immediate rendering
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: streamingAccumulator } : msg
          )
        );
      }
      
      // Flush residual decoder state
      decoder.decode(new Uint8Array(), { stream: false });

    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      const errText = err instanceof Error ? err.message : "Network protocol collision. Check pipeline connection.";
      
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.content) {
          return prev.slice(0, -1).concat({
            id: generateId(),
            role: "assistant",
            content: errText,
            isError: true,
          });
        }
        return [...prev, { id: generateId(), role: "assistant", content: errText, isError: true }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input;
    if (!text.trim()) return;
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

  // Premium Micro-parser mapping custom Markdown strings into clean React Nodes
  const formatMessageContent = (content: string) => {
    return content.split("\n").map((line, lineIndex) => {
      let elements: React.ReactNode[] = [];
      const boldCodeRegex = /(\*\*.*?\*\*|`.*?`)/g;
      
      if (boldCodeRegex.test(line)) {
        const parts = line.split(boldCodeRegex);
        elements = parts.map((part, index) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={index} className="font-extrabold text-white underline decoration-yellow-400/40 decoration-2">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code key={index} className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-xs text-yellow-300 border border-white/5">
                {part.slice(1, -1)}
              </code>
            );
          }
          return part;
        });
      } else {
        elements = [line];
      }
      
      return (
        <p key={lineIndex} className={cn("min-h-[1.2rem] text-zinc-200", lineIndex > 0 && "mt-2")}>
          {elements}
        </p>
      );
    });
  };

  if (HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  return (
    <>
      {/* Absolute floating action button trigger */}
      <motion.button
        aria-label="Open VibeCheck AI Terminal"
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

      {/* Main Intelligent Deck */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
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
            className="fixed inset-x-3 bottom-28 z-[101] flex flex-col overflow-hidden rounded-[32px] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.5)] ring-1 ring-white/10 glass-panel sm:inset-x-auto sm:right-6 lg:bottom-8 bg-[#0C0C0E]/90 backdrop-blur-3xl"
          >
            {/* Header Control Container */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:px-5 sm:py-4">
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
              
              {/* Window Layout Modifiers */}
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => setIsExpanded((prev) => !prev)}
                  aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
                  className="hidden sm:flex rounded-xl p-2 text-white/40 transition-all hover:bg-white/10 hover:text-white"
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  onClick={clearChat}
                  aria-label="Clear context session history"
                  className="rounded-xl p-2 text-white/40 transition-all hover:bg-white/10 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close terminal view"
                  className="rounded-xl p-2 transition-all hover:bg-white/10 text-white/60 hover:text-white"
                >
                  <ChevronDown size={22} />
                </button>
              </div>
            </div>

            {/* Horizontal Command List Matrix */}
            <div className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto px-4 pt-3.5 pb-1">
              {QUICK_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickPrompt(item)}
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all duration-200 hover:bg-yellow-400 hover:text-black hover:border-transparent disabled:opacity-40 shadow-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Message Thread Scrollport */}
            <div
              ref={scrollAreaRef}
              className="no-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto bg-black/20 p-4 sm:space-y-6 sm:p-5"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  layout="position"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "max-w-[88%] rounded-[24px] px-4 py-3.5 text-sm font-medium leading-relaxed shadow-xl border transition-all duration-300",
                      msg.role === "user"
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-black font-semibold border-white/20 rounded-tr-none shadow-yellow-400/10"
                        : msg.isError 
                        ? "bg-red-500/10 border-red-500/20 text-red-400 rounded-tl-none flex items-start gap-2"
                        : "bg-white/[0.03] border-white/10 text-white/90 rounded-tl-none"
                    )}
                  >
                    {msg.isError && <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                    <div>
                      {msg.role === "assistant" ? formatMessageContent(msg.content) : msg.content}
                    </div>
                  </div>
                  <span className="text-[8px] mt-1.5 font-black tracking-widest opacity-40 uppercase px-2">
                    {msg.role === "user" ? "Client Device" : msg.isError ? "System Pipeline Error" : "VibeCheck Matrix"}
                  </span>
                </motion.div>
              ))}
              
              {/* Dynamic Engine Diagnostics Loader */}
              {isLoading && messages[messages.length - 1]?.content === "" && (
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
              )}
            </div>

            {/* Data Submission Command Deck */}
            <form
              onSubmit={handleSendMessage}
              className="shrink-0 border-t border-white/10 bg-[#0C0C0E]/95 p-4 backdrop-blur-2xl sm:p-5"
            >
              <div className="relative flex items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-label="Direct text prompt transmission stream input"
                  placeholder="Query cash trends, goal forecasting, safety values..."
                  disabled={isLoading}
                  className="w-full rounded-[24px] border border-white/10 bg-white/5 py-4 pl-5 pr-14 text-sm font-semibold text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent disabled:opacity-50 transition-all duration-300"
                />
                <button
                  type="submit"
                  aria-label="Transmit prompt data to AI"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2.5 rounded-2xl bg-yellow-400 p-2.5 text-black transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-10 disabled:hover:scale-100"
                >
                  <Send size={18} className="stroke-[2.5]" />
                </button>
              </div>
              
              {/* Terminal System Footer Metadata */}
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
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}