import mongoose from "mongoose";
import WishlistItem, {
  type IWishlistItem,
  type WishlistPriority,
  type WishlistStatus,
} from "@/models/WishlistItem";

export type StoreWishlistItem = {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
};

function serialize(item: IWishlistItem): StoreWishlistItem {
  return {
    _id: String(item._id),
    name: item.name,
    categoryType: item.categoryType,
    amount: item.amount,
    monthlySave: item.monthlySave,
    savedSoFar: item.savedSoFar,
    targetMonth: item.targetMonth,
    genZComment: item.genZComment,
    priority: item.priority,
    status: item.status,
    purchaseUrl: item.purchaseUrl,
    notes: item.notes,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function fetchWishlistItems(
  userId: string,
  month?: string
): Promise<{ items: StoreWishlistItem[]; source: "mongodb" }> {
  const query: { userId: mongoose.Types.ObjectId; targetMonth?: string } = {
    userId: new mongoose.Types.ObjectId(userId),
  };
  if (month) query.targetMonth = month;

  const items = await WishlistItem.find(query).sort({ createdAt: -1 });
  return { items: items.map(serialize), source: "mongodb" };
}

export async function createWishlistItem(
  userId: string,
  input: Omit<StoreWishlistItem, "_id" | "createdAt" | "updatedAt">
): Promise<{ item: StoreWishlistItem; source: "mongodb" }> {
  const item = await WishlistItem.create({
    ...input,
    userId: new mongoose.Types.ObjectId(userId),
  });
  return { item: serialize(item), source: "mongodb" };
}

export async function patchWishlistItem(
  userId: string,
  id: string,
  patch: Partial<Omit<StoreWishlistItem, "_id" | "createdAt" | "updatedAt">>
): Promise<{ item: StoreWishlistItem | null; source: "mongodb" }> {
  if (!mongoose.isValidObjectId(id)) return { item: null, source: "mongodb" };
  const item = await WishlistItem.findOneAndUpdate(
    { _id: id, userId: new mongoose.Types.ObjectId(userId) },
    { $set: patch },
    { new: true, runValidators: true }
  );
  return { item: item ? serialize(item) : null, source: "mongodb" };
}

export async function removeWishlistItem(
  userId: string,
  id: string
): Promise<{ success: boolean; source: "mongodb" }> {
  if (!mongoose.isValidObjectId(id)) return { success: false, source: "mongodb" };
  const result = await WishlistItem.deleteOne({
    _id: id,
    userId: new mongoose.Types.ObjectId(userId),
  });
  return { success: result.deletedCount === 1, source: "mongodb" };
}
