import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },

    totalIncome: { type: Number, default: 0 },
    totalExpense: { type: Number, default: 0 },

    streak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User =
  models.User || model("User", UserSchema);