import {
  addLocalWishlistItem,
  deleteLocalWishlistItem,
  listLocalWishlist,
  updateLocalWishlistItem,
  type StoreWishlistItem,
} from "@/lib/data/local-store";

export type { StoreWishlistItem };

export async function fetchWishlistItems(month?: string): Promise<{
  items: StoreWishlistItem[];
  source: "local";
}> {
  let items = await listLocalWishlist();
  if (month) {
    items = items.filter((i) => i.targetMonth === month);
  }
  return { items, source: "local" };
}

export async function createWishlistItem(input: {
  name: string;
  categoryType: string;
  amount: number;
  monthlySave: number;
  targetMonth: string;
  genZComment: string;
  savedSoFar?: number;
}): Promise<{ item: StoreWishlistItem; source: "local" }> {
  const item = await addLocalWishlistItem(input);
  return { item, source: "local" };
}

export async function patchWishlistItem(
  id: string,
  patch: Partial<{
    name: string;
    categoryType: string;
    amount: number;
    monthlySave: number;
    savedSoFar: number;
    targetMonth: string;
    genZComment: string;
  }>
): Promise<{ item: StoreWishlistItem | null; source: "local" }> {
  const item = await updateLocalWishlistItem(id, patch);
  return { item, source: "local" };
}

export async function removeWishlistItem(id: string): Promise<{
  success: boolean;
  source: "local";
}> {
  const success = await deleteLocalWishlistItem(id);
  return { success, source: "local" };
}
