import { NextResponse } from "next/server";
import { createWishlistItem, fetchWishlistItems } from "@/lib/data/wishlist";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") ?? undefined;
    const { items, source } = await fetchWishlistItems(month ?? undefined);
    return NextResponse.json({ success: true, items, source });
  } catch (error) {
    console.error("GET Wishlist Error:", error);
    return NextResponse.json(
      { success: false, message: "Could not load wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      categoryType,
      amount,
      monthlySave,
      targetMonth,
      genZComment,
      savedSoFar,
      priority,
      status,
      purchaseUrl,
      notes,
    } = body;

    if (!name?.trim() || !categoryType || amount === undefined || !targetMonth) {
      return NextResponse.json(
        { success: false, message: "name, categoryType, amount, and targetMonth are required" },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    const parsedMonthly = Number(monthlySave ?? 0);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "amount must be a positive number" },
        { status: 400 }
      );
    }

    const { item, source } = await createWishlistItem({
      name: String(name).trim(),
      categoryType: String(categoryType),
      amount: parsedAmount,
      monthlySave: Math.max(0, parsedMonthly),
      targetMonth: String(targetMonth),
      genZComment: String(genZComment ?? "").trim(),
      savedSoFar: Number(savedSoFar ?? 0),
      priority: ["low", "medium", "high"].includes(priority) ? priority : "medium",
      status: ["planned", "saving", "ready", "purchased"].includes(status)
        ? status
        : "planned",
      purchaseUrl: String(purchaseUrl ?? "").trim(),
      notes: String(notes ?? "").trim(),
    });

    return NextResponse.json({ success: true, item, source }, { status: 201 });
  } catch (error) {
    console.error("POST Wishlist Error:", error);
    return NextResponse.json(
      { success: false, message: "Could not add wishlist item" },
      { status: 500 }
    );
  }
}
