import { fetchUserOrders } from "@/lib/firestore-server";
import { db } from "@/lib/firestore-server-sdk";
import { doc, getDoc } from "firebase/firestore";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  const id = req.nextUrl.searchParams.get("id");

  try {
    // If id is provided, fetch a single order
    if (id) {
      const snap = await getDoc(doc(db, "orders", id));
      if (snap.exists()) {
        return Response.json({ id: snap.id, ...snap.data() });
      }
      return Response.json(null, { status: 404 });
    }

    // If uid is provided, fetch user orders
    if (uid) {
      const orders = await fetchUserOrders(uid);
      return Response.json(orders);
    }

    return Response.json({ error: "UID or ID is required" }, { status: 400 });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return Response.json([], { status: 500 });
  }
}
