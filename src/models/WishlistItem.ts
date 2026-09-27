import mongoose, { Document, Schema, model, models } from "mongoose";

export type WishlistPriority = "low" | "medium" | "high";
export type WishlistStatus = "planned" | "saving" | "ready" | "purchased";

export interface IWishlistItem extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  categoryType: string;
  amount: number;
  monthlySave: number;
  savedSoFar: number;
  targetMonth: string;
  genZComment: string;
  priority: WishlistPriority;
  status: WishlistStatus;
  purchaseUrl: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistItemSchema = new Schema<IWishlistItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    categoryType: { type: String, required: true, trim: true, maxlength: 50 },
    amount: { type: Number, required: true, min: 0 },
    monthlySave: { type: Number, default: 0, min: 0 },
    savedSoFar: { type: Number, default: 0, min: 0 },
    targetMonth: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    genZComment: { type: String, default: "", maxlength: 500 },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: {
      type: String,
      enum: ["planned", "saving", "ready", "purchased"],
      default: "planned",
    },
    purchaseUrl: { type: String, default: "", maxlength: 1000 },
    notes: { type: String, default: "", maxlength: 1000 },
  },
  { timestamps: true }
);

WishlistItemSchema.index({ userId: 1, targetMonth: 1, createdAt: -1 });

export const WishlistItem =
  models.WishlistItem ||
  model<IWishlistItem>("WishlistItem", WishlistItemSchema);

export default WishlistItem;
