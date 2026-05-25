import { NextResponse } from "next/server";
import { removeTransaction } from "@/lib/data/transactions";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { success } = await removeTransaction(id);

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("DELETE Transaction Error:", error);
    return NextResponse.json(
      { success: false, message: `Delete failed: ${message}` },
      { status: 500 }
    );
  }
}
