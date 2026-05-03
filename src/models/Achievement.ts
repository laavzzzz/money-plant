import mongoose, { Schema, models, model } from "mongoose";

const AchievementSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  badge: { type: String },
  achievedAt: { type: Date, default: Date.now },
});

export const Achievement =
  models.Achievement || model("Achievement", AchievementSchema);