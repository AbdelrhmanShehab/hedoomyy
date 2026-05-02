"use client";

import { Minus, Plus } from "lucide-react";

type Props = {
  value: number;
  onChange: (val: number) => void;
  max?: number;
};

export default function QuantitySelector({
  value,
  onChange,
  max = 99,
}: Props) {
  const increase = () => {
    if (value < max) onChange(value + 1);
  };

  const decrease = () => {
    if (value > 1) onChange(value - 1);
  };

  return (
    <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 gap-6 min-w-[120px] justify-between">
      <button
        onClick={decrease}
        suppressHydrationWarning
        className="text-gray-500 hover:text-black transition-colors cursor-pointer"
      >
        <Minus size={18} />
      </button>
      <span className="text-lg font-medium w-4 text-center">{value}</span>
      <button
        onClick={increase}
        suppressHydrationWarning
        className="text-gray-500 hover:text-black transition-colors cursor-pointer"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
