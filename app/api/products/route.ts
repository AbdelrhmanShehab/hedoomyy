/**
 * GET /api/products
 * Returns all active products using the Firestore REST API.
 * No Firebase client SDK = no channel/WebSocket connections.
 */
import { fetchActiveProducts, fetchCategories } from "@/lib/firestore-server";

export const revalidate = 60; // ISR: re-fetch at most once per minute

export async function GET() {
  try {
    const [products, categories] = await Promise.all([
      fetchActiveProducts(),
      fetchCategories(),
    ]);
    return Response.json({ products, categories });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return Response.json({ products: [], categories: [] }, { status: 500 });
  }
}
