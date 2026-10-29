import { adminDb, requestIdentity } from "@/lib/firebase-admin";
import { createCheckout } from "@/lib/checkoutService";
import { CheckoutError } from "@/lib/checkoutValidation";
import { sendOrderConfirmationEmail } from "@/lib/email-service";
import { fetchUserOrders, fetchOrderById } from "@/lib/firestore-server";
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
    const identity = await requestIdentity(req);
    const body = await req.json();
    const result = await createCheckout(adminDb(), body, req.headers.get('Idempotency-Key') || '', identity);
    if (!result.duplicate) {
      try { await sendOrderConfirmationEmail(result.order); } catch { console.error('Order confirmation email failed'); }
    }
    return NextResponse.json({ success: true, orderId: result.orderId, duplicate: result.duplicate }, { status: result.duplicate ? 200 : 201 });
  } catch (error: unknown) {
    const failure = error as { status?: number; message?: string; fields?: Record<string, string> };
    return NextResponse.json({ error: error instanceof CheckoutError || failure.status === 401 ? failure.message : 'Could not place your order. Please retry using the same checkout reference.', fields: failure.fields || {} }, { status: failure.status || 500 });
  }
}
