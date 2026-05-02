import { db } from "../../../../lib/firestore-server-sdk";
import { collection, getDocs, query, where, writeBatch, deleteField } from "firebase/firestore";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { offerId } = body;

        if (!offerId) {
            return Response.json({ error: "Missing offerId" }, { status: 400 });
        }

        const q = query(collection(db, "products"), where("offerId", "==", offerId));
        const snapshot = await getDocs(q);

        const batch = writeBatch(db);
        let updatedCount = 0;

        snapshot.docs.forEach((productDoc) => {
            const data = productDoc.data();

            if (data.originalPrice !== undefined) {
                batch.update(productDoc.ref, {
                    price: data.originalPrice,
                    originalPrice: deleteField(),
                    offerId: deleteField(),
                    updatedAt: new Date().toISOString()
                });
                updatedCount++;
            }
        });

        await batch.commit();

        return Response.json({ success: true, updatedCount });
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
