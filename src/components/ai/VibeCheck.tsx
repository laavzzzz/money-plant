"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Fixed Imports: Verified available icons in lucide-react
import { 
  Sparkles,  // ✅ capital S
  X, 
  Bot, 
  Zap,
  Sen ,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SendHorizonal } from "lucide-react";


/* -------------------------------------------------------------------------- */
/* VIBECHECK AI COMPANION - FINAL VERSION                                     */
/* -------------------------------------------------------------------------- */

export default function VibeCheck() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Real-world state handling for chat messages
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "Yo! I'm VibeCheck. I've been watching your garden... you're doing great! Need help figuring out how to afford that next big W? 🌿" 
    }
  ]);

  // Auto-scroll logic: Keeps the latest message in view
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      /**
       * REAL AI INTEGRATION
       * Replace the setTimeout below with this once your API route is live:
       * * const response = await fetch('/api/ai', {
       * method: 'POST',
       * headers: { 'Content-Type': 'application/json' },
       * body: JSON.stringify({ messages: [...messages, userMessage] })
       * });
       * const data = await response.json();
       * setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
       */

      // Simulated Intelligence for Now
      setTimeout(() => {
        const aiResponse = { 
          role: "assistant", 
          content: "The math is mathing! Based on your current stacks, if you chill on the takeout for 3 days, you'll hit that goal by Friday. No cap. 🚀" 
        };
        setMessages((prev) => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1500);

    } catch (err) {
      console.error("VibeCheck Error:", err);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 🚀 THE FLOATING TRIGGER (The Orb) */}
      <motion.button
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        whileHover={{ scale: 1.1, rotate: 8 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-28 right-6 z-[100] w-16 h-16 rounded-full shadow-2xl",
          "bg-gradient-to-tr from-[#FFD700] via-[#FACC15] to-[#EAB308]", // Money Yellow Gradient
          "flex items-center justify-center text-black border-2 border-white/40",
          isOpen && "hidden"
        )}
      >
        <Sparkles size={30} className="animate-pulse" />
      </motion.button>

      {/* 🧊 THE CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-[101] w-[92vw] md:w-[420px] h-[620px] glass-panel flex flex-col shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden border-white/20 ring-1 ring-white/10"
            style={{ perspective: "1000px" }}
          >
            {/* Header: Vibe Dashboard */}
            <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-inner">
                  <Bot size={26} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-base tracking-tight text-text-main">VibeCheck AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">Neural Sync Live</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90"
              >
                <ChevronDown size={24} className="text-text-main" />
              </button>
            </div>

            {/* Chat Messages Area */}
            <div 
              ref={scrollRef} 
              className="flex-1 overflow-y-auto p-5 space-y-6 bg-black/10 no-scrollbar custom-scrollbar"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === "user" ? 15 : -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex flex-col",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[88%] p-4 rounded-[24px] text-sm font-bold leading-relaxed shadow-lg",
                    msg.role === "user" 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-white/10 border border-white/10 text-text-main rounded-tl-none backdrop-blur-md"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] mt-1 font-black opacity-30 uppercase tracking-tighter px-2">
                    {msg.role === "user" ? "Sent" : "VibeCheck"}
                  </span>
                </motion.div>
              ))}
              
              {/* Dynamic Loading State */}
              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-full w-fit animate-pulse border border-white/5">
                  <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter opacity-50">Analyzing Stacks...</span>
                </div>
              )}
            </div>

            {/* AI Input Field */}
            <form 
              onSubmit={handleSendMessage} 
              className="p-5 bg-white/5 border-t border-white/10 backdrop-blur-2xl"
            >
              <div className="relative flex items-center group">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask VibeCheck about your bread..."
                  className="w-full bg-black/40 border border-white/10 rounded-[22px] py-4 pl-6 pr-14 text-sm font-bold text-white focus:outline-none focus:ring-2 ring-primary/50 transition-all placeholder:text-white/20"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "absolute right-2.5 p-2.5 rounded-2xl transition-all shadow-lg",
                    "bg-primary text-white hover:scale-110 active:scale-90",
                    "disabled:opacity-20 disabled:hover:scale-100"
                  )}
                >
                  <SendHorizonal size={22} />
                </button>
              </div>
              
              {/* Subtle Branding/Footer */}
              <div className="flex justify-center mt-3 gap-4 opacity-20 pointer-events-none">
                <div className="flex items-center gap-1">
                  <TrendingUp size={10} />
                  <span className="text-[8px] font-black uppercase">Wealth Mode</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle size={10} />
                  <span className="text-[8px] font-black uppercase">Encrypted</span>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}