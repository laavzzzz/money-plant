import mongoose, { Schema, models, model } from "mongoose";

export interface ITransaction extends mongoose.Document {
  userId?: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Set to false so local testing/mock users don't break your server
    },
    title: { 
      type: String, 
      required: [true, "Title is required"],
      trim: true 
    },
    amount: { 
      type: Number, 
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"]
    },
    type: {
      type: String,
      enum: {
        values: ["income", "expense"],
        message: "{VALUE} is not a valid transaction type"
      },
      required: true,
    },
    category: { 
      type: String, 
      required: [true, "Category is required"],
      trim: true
    },
    date: { 
      type: Date, 
      default: Date.now 
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexed tracking for fast query performance as your application database grows
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ date: -1 });

export const Transaction =
  models.Transaction || model<ITransaction>("Transaction", TransactionSchema);