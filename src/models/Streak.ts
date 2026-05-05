import mongoose, { Schema, models, model } from "mongoose";

/* 🧠 INTERFACE (TYPE SAFETY) */
export interface IStreak {
  userId: mongoose.Types.ObjectId;

  currentStreak: number;
  longestStreak: number;

  lastActiveDate: string | null; // YYYY-MM-DD

  createdAt?: Date;
  updatedAt?: Date;
}

/* 🧱 SCHEMA */
const StreakSchema = new Schema<IStreak>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    currentStreak: {
      type: Number,
      default: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
    },

    lastActiveDate: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // ✅ adds createdAt, updatedAt
  }
);

/* ⚡ INDEXES (PERFORMANCE) */
StreakSchema.index({ userId: 1 });

/* 🚀 STATIC METHOD: UPDATE STREAK */
StreakSchema.statics.updateStreak = async function (userId: string) {
  const today = new Date().toISOString().split("T")[0];

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  let streak = await this.findOne({ userId });

  /* 🆕 CREATE NEW */
  if (!streak) {
    return await this.create({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
    });
  }

  /* 🛑 ALREADY UPDATED TODAY */
  if (streak.lastActiveDate === today) {
    return streak;
  }

  /* 🔥 CONTINUE STREAK */
  if (streak.lastActiveDate === yesterday) {
    streak.currentStreak += 1;
  } else {
    /* 🔁 RESET */
    streak.currentStreak = 1;
  }

  /* 🏆 UPDATE LONGEST */
  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  streak.lastActiveDate = today;

  await streak.save();

  return streak;
};

/* 🚀 MODEL EXPORT */
export const Streak =
  models.Streak || model<IStreak>("Streak", StreakSchema);