import { fetchUserOrders, fetchOrderById, createOrder } from "@/lib/firestore-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  const id = req.nextUrl.searchParams.get("id");

  try {
    // Fetch a single order by document ID
    if (id) {
      const order = await fetchOrderById(id);
      if (order) {
        return NextResponse.json(order);
      }
      return NextResponse.json(null, { status: 404 });
    }

    // Fetch all orders for a user
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
    const order = await createOrder(body);

    return NextResponse.json(
      { success: true, orderId: order.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
