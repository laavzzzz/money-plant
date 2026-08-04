"use client";

import React, { useRef, useEffect, useMemo, useState, useCallback } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FinancialContext {
  savings: number;
  income: number;
  expenses: number;
  streak: number;
  recentTransactionsCount: number;
}

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type UseChatOptions = {
  api: string;
  body: {
    context: FinancialContext;
  };
  onError?: (err: Error) => void;
};

const createMessageId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

function useChat(options: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastPromptRef = React.useRef<string | null>(null);

  const submitMessage = useCallback(
    async (prompt: string) => {
      const trimmedPrompt = prompt.trim();
      if (!trimmedPrompt || isLoading) {
        return;
      }

      const userMessage: Message = {
        id: createMessageId(),
        role: "user",
        content: trimmedPrompt,
      };

      setMessages((current) => [...current, userMessage]);
      setInput("");
      setError(null);
      setIsLoading(true);
      lastPromptRef.current = trimmedPrompt;

      try {
        const response = await fetch(options.api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...options.body, prompt: trimmedPrompt }),
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const result = await response.json();
        const assistantContent =
          typeof result?.answer === "string"
            ? result.answer
            : typeof result?.message === "string"
            ? result.message
            : JSON.stringify(result);

        setMessages((current) => [
          ...current,
          { id: createMessageId(), role: "assistant", content: assistantContent },
        ]);
      } catch (err) {
        const errorObject = err instanceof Error ? err : new Error("Unknown error");
        setError(errorObject);
        options.onError?.(errorObject);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, options]
  );

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await submitMessage(input);
    },
    [input, submitMessage]
  );

  const reload = useCallback(() => {
    if (!lastPromptRef.current) {
      return;
    }
    void submitMessage(lastPromptRef.current);
  }, [submitMessage]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    setInput,
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_INPUT_CHARS = 1000;
const VIBECHECK_ENDPOINT = "/api/vibecheck";

// Mock financial context payload - Replace with dynamic user context hooks or state
const DEFAULT_FINANCIAL_CONTEXT: FinancialContext = {
  savings: 4250,
  income: 6000,
  expenses: 1750,
  streak: 12,
  recentTransactionsCount: 14,
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Renders an empty placeholder state when no messages are present.
 */
const EmptyState: React.FC<{ onSuggestedPrompt: (prompt: string) => void }> = React.memo(
  ({ onSuggestedPrompt }) => {
    const suggestions = [
      "Did I flex too hard on impulsive spend this week? 💸",
      "Calculate my aura points based on my current streak 🪴",
      "Am I dodging the Fanum tax with my savings? 🔒",
    ];

    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center py-12 px-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 shadow-sm border border-emerald-200">
          <span className="text-3xl" role="img" aria-label="Money Plant">
            🪴
          </span>
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          VibeCheck AI Workspace
        </h2>
        <p className="text-sm text-zinc-600 max-w-sm mt-1 mb-6">
          Your culture-savvy financial companion. Ask about your portfolio, spending habits, or savings streak.
        </p>

        <div className="w-full max-w-sm space-y-2">
          {suggestions.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSuggestedPrompt(prompt)}
              className="w-full text-left text-xs font-medium text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100/80 border border-emerald-200/80 p-3 rounded-xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

/**
 * Individual message bubble displaying avatar, timestamp, and content.
 */
const MessageItem: React.FC<{ message: Message }> = React.memo(({ message }) => {
  const isUser = message.role === "user";

  return (
    <article
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-start w-full`}
      aria-label={`${isUser ? "User message" : "VibeCheck AI message"}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
          isUser
            ? "bg-emerald-600 text-white border-emerald-700"
            : "bg-white text-emerald-700 border-emerald-200 shadow-sm"
        }`}
      >
        {isUser ? "YOU" : "🪴"}
      </div>

      <div
        className={`flex flex-col max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-emerald-600 text-white rounded-tr-none"
            : "bg-white text-zinc-800 border border-zinc-200/80 rounded-tl-none"
        }`}
      >
        <span className="text-[10px] font-semibold tracking-wider uppercase opacity-75 mb-1">
          {isUser ? "You" : "VibeCheck"}
        </span>
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      </div>
    </article>
  );
});

MessageItem.displayName = "MessageItem";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AIChat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic payload options passed to Vercel AI SDK useChat
  const chatOptions = useMemo(
    () => ({
      api: VIBECHECK_ENDPOINT,
      body: {
        context: DEFAULT_FINANCIAL_CONTEXT,
      },
      onError: (err: Error) => {
        console.error("[VIBECHECK_UI_ERROR] Connection failure:", err);
      },
    }),
    []
  );

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    setInput,
  } = useChat(chatOptions);

  // Auto-scroll anchor logic for live stream updates
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Handle preset click injection
  const handleSuggestedPrompt = useCallback(
    (promptText: string) => {
      setInput(promptText);
      inputRef.current?.focus();
    },
    [setInput]
  );

  const isInputValid = input.trim().length > 0 && input.length <= MAX_INPUT_CHARS;

  return (
    <main className="flex flex-col h-screen max-w-2xl mx-auto px-4 py-6 bg-gradient-to-b from-zinc-50 to-emerald-50/30 font-sans">
      {/* HEADER BAR */}
      <header className="flex items-center justify-between pb-4 border-b border-zinc-200/80 mb-4 bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-xl border border-emerald-500/20">
            🪴
          </div>
          <div>
            <h1 className="text-base font-bold text-zinc-900 leading-tight">VibeCheck AI</h1>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Context Hydrated
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-zinc-500">
          <span className="font-semibold text-zinc-700">Streak:</span> {DEFAULT_FINANCIAL_CONTEXT.streak} 🔥
        </div>
      </header>

      {/* MESSAGES FEED CONTAINER */}
      <section
        tabIndex={0}
        aria-label="Chat Message History"
        className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-zinc-200"
      >
        {messages.length === 0 ? (
          <EmptyState onSuggestedPrompt={handleSuggestedPrompt} />
        ) : (
          messages.map((m: any) => <MessageItem key={m.id} message={m} />)
        )}

        {/* LOADING INDICATOR STREAMING STATE */}
        {isLoading && (
          <div className="flex gap-3 items-center w-full my-2">
            <div className="w-8 h-8 rounded-full bg-white border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-700 shadow-sm">
              🪴
            </div>
            <div className="flex items-center gap-1 bg-white border border-zinc-200/80 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        {/* ERROR RECOVERY BANNER */}
        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-2"
          >
            <span>🚨 VibeCheck staggered for a sec. Please try again.</span>
            <button
              type="button"
              onClick={() => reload()}
              className="px-3 py-1 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </section>

      {/* INPUT FORM */}
      <footer className="pt-4 border-t border-zinc-200/80 mt-2">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              className="w-full p-3.5 pr-12 text-sm text-zinc-900 bg-white border border-zinc-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 placeholder:text-zinc-400 transition"
              value={input}
              placeholder="Ask VibeCheck about your spending..."
              onChange={handleInputChange}
              maxLength={MAX_INPUT_CHARS}
              disabled={isLoading}
              aria-label="Message input field"
            />
            <span
              className={`absolute right-3 bottom-1 text-[10px] ${
                input.length >= MAX_INPUT_CHARS ? "text-red-500 font-bold" : "text-zinc-400"
              }`}
            >
              {input.length}/{MAX_INPUT_CHARS}
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isInputValid}
            className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
            aria-label="Send message"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Send"
            )}
          </button>
        </form>
      </footer>
    </main>
  );
}