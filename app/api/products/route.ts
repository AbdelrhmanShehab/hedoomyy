import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export async function GET() {
  const snapshot = await getDocs(collection(db, "products"));

  const products = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,

      // Normalize old + new DB fields
      title: data.title ?? data.name ?? "",
      description: data.description ?? "",
      category: data.category ?? "",
      price: data.price ?? 0,
      status: data.status ?? "active",
      isBestSeller: data.isBestSeller ?? false,

      images: data.images
        ? data.images
        : data.imageUrl
        ? [data.imageUrl]
        : [],

      variants: data.variants ?? [],

      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    };
  });

  return Response.json(products);
}
