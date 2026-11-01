import type { CartItem } from "@/data/cart";

export function addCartItem(items: CartItem[], item: CartItem) {
  if (!Number.isSafeInteger(item.qty) || item.qty <= 0) return items;
  const existing = items.find(i => i.productId === item.productId && i.variantId === item.variantId);
  const limit = item.stock === undefined ? Infinity : Math.max(0, item.stock);
  const qty = Math.min((existing?.qty || 0) + item.qty, limit);
  if (qty <= (existing?.qty || 0)) return items;
  return existing ? items.map(i => i === existing ? { ...i, qty, stock: item.stock ?? i.stock } : i) : [...items, { ...item, qty }];
}
