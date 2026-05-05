import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Transaction } from "@/models/Transaction";

/* 📥 GET — Fetch all transactions */
export async function GET() {
  try {
    await dbConnect();

    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, transactions },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET Transactions Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

/* 📤 POST — Add new transaction */
export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const { title, amount, type, category } = body;

    /* 🔐 Validation */
    if (!title || !amount || !type || !category) {
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

    /* 💾 Create transaction */
    const newTransaction = await Transaction.create({
      title,
      amount,
      type,
      category,
      date: new Date(),
    });

    return NextResponse.json(
      { success: true, transaction: newTransaction },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Transaction Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to add transaction" },
      { status: 500 }
    );
  }
}