import { fetchUserOrders } from "@/lib/firestore-server";
import { db } from "@/lib/firestore-server-sdk";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  const id = req.nextUrl.searchParams.get("id");

  try {
    // If id is provided, fetch a single order
    if (id) {
      const snap = await getDoc(doc(db, "orders", id));
      if (snap.exists()) {
        return NextResponse.json({ id: snap.id, ...snap.data() });
      }
      return NextResponse.json(null, { status: 404 });
    }

    // If uid is provided, fetch user orders
    if (uid) {
      const orders = await fetchUserOrders(uid);
      return NextResponse.json(orders);
    }

    return NextResponse.json({ error: "UID or ID is required" }, { status: 400 });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Add server-side metadata
    const orderData = {
      ...body,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "orders"), orderData);

    return NextResponse.json({ 
      success: true, 
      orderId: docRef.id 
    }, { status: 201 });

  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
