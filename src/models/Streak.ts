import mongoose, { Schema, models, model } from "mongoose";

const StreakSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
});

export const Streak =
  models.Streak || model("Streak", StreakSchema);