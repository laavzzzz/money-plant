import mongoose, { Schema, models, model } from "mongoose";

const TransactionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true },
    amount: { type: Number, required: true },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    category: { type: String, required: true },

    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Transaction =
  models.Transaction || model("Transaction", TransactionSchema);