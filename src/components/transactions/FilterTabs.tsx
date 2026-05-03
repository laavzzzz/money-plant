"use client";

import { useState } from "react";

const filters = ["All", "Income", "Expense"];

export default function FilterTabs({
  onChange,
}: {
  onChange?: (value: string) => void;
}) {
  const [active, setActive] = useState("All");

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((item) => (
        <button
          key={item}
          onClick={() => {
            setActive(item);
            onChange?.(item);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition
            ${
              active === item
                ? "bg-yellow-400 text-white shadow"
                : "bg-white text-gray-500 border"
            }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}