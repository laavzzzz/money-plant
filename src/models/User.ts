import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    phone: { type: String },
    location: { type: String },
    accountType: { type: String, default: "Standard Saver" },
    bio: { type: String, default: "Building better money habits one plant at a time." },
    totalSaved: { type: Number, default: 0 },
    monthlyAverage: { type: Number, default: 0 },
    goalCompletion: { type: String, default: "0 / 0" },

    totalIncome: { type: Number, default: 0 },
    totalExpense: { type: Number, default: 0 },

    streak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User =
  models.User || model("User", UserSchema);