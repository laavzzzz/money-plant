import { NextResponse } from "next/server";
import {
  createTransaction,
  fetchAllTransactions,
} from "@/lib/data/transactions";

// Enforce dynamic rendering at request time (disables build-time prerendering)
export const dynamic = "force-dynamic";

/**
 * Common response structures for consistency across consumer components
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  source?: string;
}

interface TransactionPayload {
  title: string;
  amount: number | string;
  type: "income" | "expense";
  category: string;
  date?: string;
}

/**
 * GET /api/transactions
 * Fetches all transactions from the underlying data source.
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const { transactions, source } = await fetchAllTransactions();

    return NextResponse.json(
      {
        success: true,
        data: transactions,
        source,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("[GET /api/transactions] Failure:", error);

    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch transactions: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions
 * Validates and stores a new financial transaction.
 */
export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
  try {
    // Ensure content type is application/json before parsing
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, message: "Invalid Content-Type. Expected application/json" },
        { status: 415 }
      );
    }

    const body = (await req.json()) as Partial<TransactionPayload>;
    const { title, amount, type, category, date } = body;

    // 1. Structural Validation (Strict type checking instead of loosely comparing values)
    if (
      title === undefined || 
      title === null || 
      amount === undefined || 
      amount === null || 
      !type || 
      !category
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: title, amount, type, and category are mandatory." },
        { status: 400 }
      );
    }

    // 2. Type Enforce Check
    if (!["income", "expense"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid transaction type. Must be either 'income' or 'expense'." },
        { status: 400 }
      );
    }

    // 3. Numeric Sanitation
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount. Must be a valid positive number." },
        { status: 400 }
      );
    }

    // Execute business logic mapping clean payloads
    const { transaction, source } = await createTransaction({
      title: String(title).trim(),
      amount: parsedAmount,
      type,
      category: String(category).trim(),
      date: date ? String(date) : new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        data: transaction,
        source,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("[POST /api/transactions] Failure:", error);

    return NextResponse.json(
      {
        success: false,
        message: `Failed to record transaction: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}