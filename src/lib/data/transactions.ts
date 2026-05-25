import { Transaction } from "@/models/Transaction";
import { tryMongoConnect } from "@/lib/data/mongo";
import {
  addLocalTransaction,
  deleteLocalTransaction,
  listLocalTransactions,
  type StoreTransaction,
} from "@/lib/data/local-store";

function serializeMongoDoc(doc: Record<string, unknown>): StoreTransaction {
  return {
    _id: String(doc._id),
    title: String(doc.title),
    amount: Number(doc.amount),
    type: doc.type as "income" | "expense",
    category: String(doc.category),
    date: doc.date ? new Date(doc.date as string).toISOString() : new Date().toISOString(),
    createdAt: doc.createdAt
      ? new Date(doc.createdAt as string).toISOString()
      : new Date().toISOString(),
    updatedAt: doc.updatedAt
      ? new Date(doc.updatedAt as string).toISOString()
      : new Date().toISOString(),
  };
}

export async function fetchAllTransactions(): Promise<{
  transactions: StoreTransaction[];
  source: "mongodb" | "local";
}> {
  const mongoOk = await tryMongoConnect();

  if (mongoOk) {
    try {
      const docs = await Transaction.find()
        .sort({ date: -1, createdAt: -1 })
        .lean();
      return {
        transactions: docs.map((d) => serializeMongoDoc(d as Record<string, unknown>)),
        source: "mongodb",
      };
    } catch (err) {
      console.error("Mongo fetch failed, falling back to local:", err);
    }
  }

  const local = await listLocalTransactions();
  return { transactions: local, source: "local" };
}

export async function createTransaction(input: {
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date?: string;
}): Promise<{ transaction: StoreTransaction; source: "mongodb" | "local" }> {
  const mongoOk = await tryMongoConnect();

  if (mongoOk) {
    try {
      const doc = await Transaction.create({
        title: input.title,
        amount: Number(input.amount),
        type: input.type,
        category: input.category,
        date: input.date ? new Date(input.date) : new Date(),
      });
      return {
        transaction: serializeMongoDoc(doc.toObject() as Record<string, unknown>),
        source: "mongodb",
      };
    } catch (err) {
      console.error("Mongo create failed, falling back to local:", err);
    }
  }

  const transaction = await addLocalTransaction({
    title: input.title,
    amount: Number(input.amount),
    type: input.type,
    category: input.category,
    date: input.date,
  });
  return { transaction, source: "local" };
}

export async function removeTransaction(
  id: string
): Promise<{ success: boolean; source: "mongodb" | "local" }> {
  const mongoOk = await tryMongoConnect();

  if (mongoOk) {
    try {
      const result = await Transaction.findByIdAndDelete(id);
      if (result) return { success: true, source: "mongodb" };
    } catch (err) {
      console.error("Mongo delete failed, falling back to local:", err);
    }
  }

  const success = await deleteLocalTransaction(id);
  return { success, source: "local" };
}
