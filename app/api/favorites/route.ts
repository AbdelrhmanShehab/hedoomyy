import { fetchProductsByIds } from "@/lib/firestore-server";

export async function POST(request: Request) {
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
  const ids = body?.productIds;
  if (!Array.isArray(ids) || ids.length > 500 || ids.some(id => typeof id !== "string" || !id || id.length > 1500 || /[/?#]/.test(id) || id === "." || id === "..")) {
    return Response.json({ error: "Invalid product IDs" }, { status: 400 });
  }
  try {
    const products = [];
    const unique = [...new Set<string>(ids)];
    for (let i = 0; i < unique.length; i += 20) products.push(...await fetchProductsByIds(unique.slice(i, i + 20)));
    return Response.json(products.filter(product => product.status === "active"), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Favorites unavailable" }, { status: 503 });
  }
}
