/**
 * @file src/app/api/transactions/route.ts
 * @module TransactionsCollectionRoute
 * @description Enterprise REST API endpoint for fetching and creating financial transactions.
 * Replaces legacy file-system data stores with production-ready MongoDB integration.
 * Enforces strict NextAuth session validation, user-scoped data isolation, and robust payload sanitization.
 * 
 * @version 3.2.0
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { Transaction as TransactionModel } from "@/models/Transaction";

// Enforce dynamic rendering at request time (disables static build-time caching)
export const dynamic = "force-dynamic";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  source?: string;
}

interface TransactionPayload {
  title?: string;
  description?: string;
  amount: number | string;
  type: "income" | "expense";
  category: string;
  date?: string;
}

// ============================================================================
// GET HANDLER: FETCH ALL USER TRANSACTIONS
// ============================================================================

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    // 1. Authenticate Request
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access. Please log in." },
        { status: 401 }
      );
    }

    // 2. Establish Database Connection
    await dbConnect();

    // 3. Fetch Data with Strict User Isolation
    // Only retrieve transactions strictly belonging to the authenticated user ID
    const transactions = await TransactionModel.find({ userId: session.user.id })
      .sort({ date: -1 }) // Sort newest first
      .lean();

    // Normalize MongoDB _id to string id for frontend consumption
    const normalizedTransactions = transactions.map((tx: any) => ({
      id: String(tx._id),
      description: tx.description || tx.title || "Transaction",
      amount: Number(tx.amount),
      type: tx.type,
      category: tx.category || "General",
      date: tx.date ? new Date(tx.date).toISOString() : new Date().toISOString(),
    }));

    // 4. Return Authorized Payload
    return NextResponse.json(
      {
        success: true,
        data: normalizedTransactions,
        source: "mongodb",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown database error";
    console.error("[GET /api/transactions] Failure:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred while retrieving transactions.",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST HANDLER: CREATE NEW TRANSACTION
// ============================================================================

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // 1. Authenticate Request
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access. Please log in." },
        { status: 401 }
      );
    }

    // 2. Enforce Strict Content-Type Security
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, message: "Invalid Content-Type. Expected application/json." },
        { status: 415 }
      );
    }

    // 3. Parse Payload
    const body = (await req.json()) as Partial<TransactionPayload>;
    const { title, description, amount, type, category, date } = body;

    // Use either title or description, depending on what the client sends
    const finalDescription = title || description;

    // 4. Structural & Type Validation
    if (!finalDescription || amount === undefined || amount === null || !type || !category) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: description (or title), amount, type, and category are mandatory." },
        { status: 400 }
      );
    }

    if (!["income", "expense"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid transaction type. Must be strictly 'income' or 'expense'." },
        { status: 400 }
      );
    }

    // 5. Numeric Sanitization
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount. Must be a valid positive number greater than 0." },
        { status: 400 }
      );
    }

    // 6. Establish Database Connection
    await dbConnect();

    // 7. Secure Insertion logic
    // Bind the transaction directly to the authenticated session's user ID
    const newTransaction = await TransactionModel.create({
      userId: session.user.id,
      description: String(finalDescription).trim().substring(0, 100), // Enforce length limits
      amount: parsedAmount,
      type,
      category: String(category).trim().substring(0, 50),
      date: date ? new Date(date) : new Date(),
    });

    // Normalize for response payload
    const normalizedTransaction = {
      id: String(newTransaction._id),
      description: newTransaction.description,
      amount: newTransaction.amount,
      type: newTransaction.type,
      category: newTransaction.category,
      date: newTransaction.date.toISOString(),
    };

    // 8. Successful Creation Response
    return NextResponse.json(
      {
        success: true,
        data: normalizedTransaction,
        source: "mongodb",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown database error";
    console.error("[POST /api/transactions] Failure:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred while recording the transaction.",
      },
      { status: 500 }
    );
  }
}