import { fetchProductsByField, runBatchUpdate } from "../../../../lib/firestore-server";
import { Product } from "@/data/product";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { offerId } = body;

        if (!offerId) {
            return Response.json({ error: "Missing offerId" }, { status: 400 });
        }

        const products = await fetchProductsByField("offerId", offerId) as Product[];

        if (products.length === 0) {
            return Response.json({ success: true, updatedCount: 0 });
        }

        const updates = products
            .filter(p => p.originalPrice !== undefined)
            .map((product) => ({
                id: product.id,
                data: {
                    price: product.originalPrice,
                    originalPrice: null, // Set to null to effectively "remove" it
                    offerId: null,
                    updatedAt: new Date().toISOString()
                }
            }));

        for (let i = 0; i < updates.length; i += 500) {
            await runBatchUpdate("products", updates.slice(i, i + 500));
        }

        return Response.json({ success: true, updatedCount: updates.length });
    } catch (error: any) {
        console.error("API /api/offers/remove error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
