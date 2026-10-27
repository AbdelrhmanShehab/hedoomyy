import type { Product } from "@/data/product";
import type { CartItem } from "@/data/cart";

const normalize = (color: string) => color.trim().toLowerCase();

export function colorMockup(product: Product, color: string): string | undefined {
  return product.colorMockups?.find(mockup => normalize(mockup.color) === normalize(color))?.image?.trim() || undefined;
}

export function stylingColors(product: Product): string[] {
  return [...new Set(product.variants.filter(v => v.stock > 0 && colorMockup(product, v.color)).map(v => v.color))];
}

export function stylingCartItem(product: Product, color: string, variantId: string): CartItem | null {
  const variant = product.variants.find(v => v.id === variantId && normalize(v.color) === normalize(color) && v.stock > 0);
  const image = colorMockup(product, color);
  if (!variant || !image || product.status !== "active") return null;
  return { productId: product.id, variantId: variant.id, title: product.title, price: product.price, image, color: variant.color, size: variant.size, qty: 1, stock: variant.stock };
}
