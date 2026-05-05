"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useTransactions } from "@/hooks/useTransactions";

/* 🧠 TYPES */
type FormState = {
  title: string;
  amount: string;
  category: string;
  type: "income" | "expense";
};

const initialForm: FormState = {
  title: "",
  amount: "",
  category: "",
  type: "expense",
};

export default function AddTransactionModal() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);

  const { addTransaction, adding } = useTransactions();

  /* 🔄 INPUT HANDLER */
  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* 🔁 RESET FORM */
  const resetForm = () => {
    setForm(initialForm);
    setError(null);
  };

  /* ❌ CLOSE MODAL */
  const handleClose = () => {
    if (adding) return; // prevent closing while submitting
    setOpen(false);
    resetForm();
  };

  /* 🚀 SUBMIT */
  const handleSubmit = async () => {
    if (adding) return; // prevent double submit

    try {
      setError(null);

      const { title, amount, category, type } = form;

      /* 🔐 VALIDATION */
      if (!title.trim() || !amount || !category.trim()) {
        setError("Please fill all required fields");
        return;
      }

      const parsedAmount = Number(amount);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError("Enter a valid amount");
        return;
      }

      /* 💾 SAVE */
      await addTransaction({
        title: title.trim(),
        amount: parsedAmount,
        category: category.trim(),
        type,
        date: new Date().toISOString(),
      });

      /* 🎉 SUCCESS */
      resetForm();
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  /* ⌨️ ENTER KEY SUPPORT */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* 🚀 OPEN BUTTON */}
      <Button onClick={() => setOpen(true)}>
        + Add Transaction
      </Button>

      {/* 📦 MODAL */}
      <Modal isOpen={open} onClose={handleClose}>
        <div className="space-y-5" onKeyDown={handleKeyDown}>
          <h2 className="text-lg font-bold">
            Add Transaction 💸
          </h2>

          {/* 📝 TITLE */}
          <Input
            label="Title"
            placeholder="e.g. Lunch"
            value={form.title}
            onChange={(e) =>
              handleChange("title", e.target.value)
            }
            autoFocus
          />

          {/* 💰 AMOUNT */}
          <Input
            label="Amount"
            placeholder="₹ 0.00"
            type="number"
            value={form.amount}
            onChange={(e) =>
              handleChange("amount", e.target.value)
            }
          />

          {/* 🏷 CATEGORY */}
          <Input
            label="Category"
            placeholder="Food, Travel..."
            value={form.category}
            onChange={(e) =>
              handleChange("category", e.target.value)
            }
          />

          {/* 🔄 TYPE SELECT */}
          <div>
            <p className="text-sm text-gray-500 mb-1">
              Type
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={adding}
                onClick={() => handleChange("type", "expense")}
                className={`flex-1 py-2 rounded-xl text-sm transition ${
                  form.type === "expense"
                    ? "bg-red-100 text-red-600 font-semibold"
                    : "bg-gray-100"
                }`}
              >
                Expense
              </button>

              <button
                type="button"
                disabled={adding}
                onClick={() => handleChange("type", "income")}
                className={`flex-1 py-2 rounded-xl text-sm transition ${
                  form.type === "income"
                    ? "bg-green-100 text-green-600 font-semibold"
                    : "bg-gray-100"
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* ❌ ERROR */}
          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          {/* 🚀 SUBMIT */}
          <Button
            onClick={handleSubmit}
            disabled={adding}
          >
            {adding ? "Adding..." : "Add Transaction"}
          </Button>
        </div>
      </Modal>
    </>
  );
}