import mongoose, { Schema, models, model } from "mongoose";

const LeaderboardSchema = new Schema(
  {
    userId: { type: String, required: true },

    score: { type: Number, default: 0 },

    savings: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },

    rank: { type: Number },
  },
  { timestamps: true }
);

export const Leaderboard =
  models.Leaderboard || model("Leaderboard", LeaderboardSchema);