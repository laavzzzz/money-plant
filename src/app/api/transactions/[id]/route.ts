/**
 * @file src/app/api/transactions/[id]/route.ts
 * @module TransactionDynamicRoute
 * @description Enterprise REST API endpoint for managing individual transaction records.
 * Implements strict NextAuth session validation, MongoDB ObjectId validation, 
 * and user-scoped authorization to prevent cross-account data modification.
 * 
 * @version 3.1.0
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { Transaction as TransactionModel } from "@/models/Transaction";

// Enforce dynamic execution for API routes
export const dynamic = "force-dynamic";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DynamicRouteContext {
  params: Promise<{
    id: string;
  }>;
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * DELETE Handler
 * Deletes a specific transaction by ID, ensuring it belongs to the authenticated user.
 */
export async function DELETE(
  req: NextRequest,
  context: DynamicRouteContext
): Promise<NextResponse> {
  try {
    // 1. Authenticate Request
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Please log in." },
        { status: 401 }
      );
    }

    // 2. Await dynamic params (Next.js 15 requirement)
    const { id } = await context.params;

    // 3. Validate Payload ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid transaction ID format." },
        { status: 400 }
      );
    }

    // 4. Establish Database Connection
    await dbConnect();

    // 5. Execute User-Scoped Deletion
    // CRITICAL: We include userId in the query to guarantee a user cannot delete someone else's transaction
    const deletedTransaction = await TransactionModel.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    }).lean();

    // 6. Handle Not Found / Unauthorized modification
    if (!deletedTransaction) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Transaction not found or you do not have permission to delete it." 
        },
        { status: 404 }
      );
    }

    // 7. Successful Deletion Response
    return NextResponse.json(
      { 
        success: true, 
        message: "Transaction successfully deleted." 
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown database error";
    
    // Log internally but obscure specific database errors from the client
    console.error("[Transaction_DELETE_Error]:", errorMessage);

    return NextResponse.json(
      { 
        success: false, 
        error: "An internal server error occurred while attempting to delete the transaction." 
      },
      { status: 500 }
    );
  }
}