import { db } from "../../../../lib/firestore-server-sdk";
import { collection, getDocs, query, where, writeBatch } from "firebase/firestore";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { offerId, type, targetId, discountPercentage } = body;

        if (!offerId || !type || discountPercentage === undefined) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        let q;
        const productsRef = collection(db, "products");

        if (type === "product") {
            q = query(productsRef, where("__name__", "==", targetId));
        } else if (type === "category") {
            q = query(productsRef, where("category", "==", targetId));
        } else {
            // all active products
            q = query(productsRef, where("status", "==", "active"));
        }

        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        let updatedCount = 0;

        snapshot.docs.forEach((productDoc) => {
            const data = productDoc.data();

            const currentPrice = data.price || 0;
            // If it already has an originalPrice from a previous offer, keep that one
            const originalPrice = data.originalPrice || currentPrice;

            const discountAmount = originalPrice * (discountPercentage / 100);
            const newPrice = Math.max(0, originalPrice - discountAmount);

            batch.update(productDoc.ref, {
                price: newPrice,
                originalPrice: originalPrice,
                offerId: offerId,
                updatedAt: new Date().toISOString()
            });

            updatedCount++;
        });

        await batch.commit();

        return Response.json({ success: true, updatedCount });
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
