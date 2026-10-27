/**
 * GET /api/products
 * Returns all active products using the Firestore REST API.
 * No Firebase client SDK = no channel/WebSocket connections.
 */
import { fetchActiveProducts, fetchCategories } from "@/lib/firestore-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [productsResult, categoriesResult] = await Promise.allSettled([
      fetchActiveProducts(true),
      fetchCategories(true),
    ]);
    if (productsResult.status === "rejected") throw productsResult.reason;
    const products = productsResult.value;
    const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
    return Response.json({ products, categories }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return Response.json({ products: [], categories: [] }, { status: 500 });
  }
}
