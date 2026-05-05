/* 🧠 TYPES */
type InsightInput = {
  income: number;
  expense: number;
};

/* 🎯 OUTPUT STRUCTURE (SCALABLE) */
type InsightResult = {
  message: string;
  tone: "good" | "warning" | "danger";
};

/* 🤖 AI INSIGHT GENERATOR */
export function generateAIInsight({
  income,
  expense,
}: InsightInput): InsightResult {
  try {
    /* 🛑 EDGE CASES */
    if (income <= 0 && expense <= 0) {
      return {
        message: "No activity yet… start your money journey 🌱",
        tone: "warning",
      };
    }

    if (income === 0 && expense > 0) {
      return {
        message: "💀 No income but spending?? We need to talk.",
        tone: "danger",
      };
    }

    const savings = income - expense;
    const ratio = income > 0 ? expense / income : 1;

    /* 🔥 LOGIC */
    if (ratio >= 1) {
      return {
        message:
          "🚨 You’re spending more than you earn. This is not sustainable.",
        tone: "danger",
      };
    }

    if (ratio > 0.8) {
      return {
        message:
          "Bro 😭 you're spending almost everything. Chill a bit.",
        tone: "danger",
      };
    }

    if (ratio > 0.6) {
      return {
        message:
          "Not bad… but you're cutting it close 👀 Try saving more.",
        tone: "warning",
      };
    }

    if (ratio < 0.3 && savings > 0) {
      return {
        message:
          "Damn 💅 you're saving like a pro. Wealth era unlocked ✨",
        tone: "good",
      };
    }

    return {
      message: "You’re doing okay 👍 but there's room to optimize.",
      tone: "warning",
    };
  } catch (error) {
    console.error("AI Insight Error:", error);

    return {
      message: "Something went wrong… but you're still doing great 😅",
      tone: "warning",
    };
  }
}