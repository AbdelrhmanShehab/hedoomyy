import { fetchProductsByField, fetchActiveProducts, fetchProductById, runBatchUpdate } from "../../../../lib/firestore-server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { offerId, type, targetId, discountPercentage } = body;

        if (!offerId || !type || discountPercentage === undefined) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        let products: any[] = [];

        if (type === "product") {
            const p = await fetchProductById(targetId);
            if (p) products = [p];
        } else if (type === "category") {
            products = await fetchProductsByField("category", targetId);
        } else {
            // all active products
            products = await fetchActiveProducts();
        }

        if (products.length === 0) {
            return Response.json({ success: true, updatedCount: 0 });
        }

        const updates = products.map((product) => {
            const currentPrice = product.price || 0;
            const originalPrice = product.originalPrice || currentPrice;
            const discountAmount = originalPrice * (discountPercentage / 100);
            const newPrice = Math.max(0, originalPrice - discountAmount);

            return {
                id: product.id,
                data: {
                    price: newPrice,
                    originalPrice: originalPrice,
                    offerId: offerId,
                    updatedAt: new Date().toISOString()
                }
            };
        });

        // Split into chunks of 500 (Firestore limit for batch)
        for (let i = 0; i < updates.length; i += 500) {
            await runBatchUpdate("products", updates.slice(i, i + 500));
        }

        return Response.json({ success: true, updatedCount: updates.length });
    } catch (error: any) {
        console.error("API /api/offers/apply error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
