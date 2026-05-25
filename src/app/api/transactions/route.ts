import { NextResponse } from "next/server";
import {
  createTransaction,
  fetchAllTransactions,
} from "@/lib/data/transactions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { transactions, source } = await fetchAllTransactions();
    return NextResponse.json(
      { success: true, transactions, source },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET Transactions Error:", error);
    return NextResponse.json(
      { success: false, message: `Fetch failed: ${message}` },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, amount, type, category, date } = body;

    if (title === undefined || amount === undefined || !type || !category) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["income", "expense"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid transaction type" },
        { status: 400 }
      );
    }

    const { transaction, source } = await createTransaction({
      title,
      amount: Number(amount),
      type,
      category,
      date,
    });

    return NextResponse.json(
      { success: true, transaction, source },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("POST Transaction Error:", error);
    return NextResponse.json(
      { success: false, message: `Add failed: ${message}` },
      { status: 500 }
    );
  }
}
