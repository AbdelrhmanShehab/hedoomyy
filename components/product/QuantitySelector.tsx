"use client";

import { useState } from "react";

export default function QuantitySelector() {
  const [qty, setQty] = useState(1);

  return (
    <div className="flex items-center border rounded-full px-4 py-2 gap-4">
      <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
      <span className="text-sm">{qty}</span>
      <button onClick={() => setQty(qty + 1)}>+</button>
    </div>
  );
}
