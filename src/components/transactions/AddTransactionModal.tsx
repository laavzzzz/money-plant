"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AddTransactionModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        + Add Transaction
      </Button>

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-bold mb-4">
          Add Transaction 💸
        </h2>

        <div className="space-y-4">
          <Input label="Amount" placeholder="₹ 0.00" />
          <Input label="Category" placeholder="Food, Travel..." />
          <Input label="Note" placeholder="Optional note" />

          <Button>Add</Button>
        </div>
      </Modal>
    </>
  );
}