"use client";

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
    <div className="flex items-center border rounded-full px-4 py-2 gap-4">
      <button onClick={decrease}>−</button>
      <span className="text-sm">{value}</span>
      <button onClick={increase}>+</button>
    </div>
  );
}
