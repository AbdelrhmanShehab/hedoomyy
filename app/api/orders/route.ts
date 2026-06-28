import { fetchUserOrders, fetchOrderById, createOrderSecure, fetchProductById, fetchLastOrderByEmail } from "@/lib/firestore-server";
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
    const orderData = await req.json();
    const items = orderData.items || [];
    
    if (items.length === 0) {
      return NextResponse.json({ error: "Order must contain items" }, { status: 400 });
    }

    let calculatedSubtotal = 0;
    const productUpdates: { id: string, data: Record<string, any> }[] = [];

    // 1. Validate items and calculate server-side totals
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (!Number.isInteger(item.qty) || item.qty <= 0) {
         return NextResponse.json({ error: `Invalid quantity for ${item.title}` }, { status: 400 });
      }

      const product = await fetchProductById(item.productId);
      if (!product) {
         return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
      }

      const variants = product.variants || [];
      const variantIndex = variants.findIndex((v: any) => v.id === item.variantId);
      
      if (variantIndex === -1) {
         return NextResponse.json({ error: `Variant ${item.variantId} not found in product` }, { status: 400 });
      }

      const variant = variants[variantIndex];
      if ((variant.stock || 0) < item.qty) {
         return NextResponse.json({ error: `Insufficient stock for ${item.title}` }, { status: 400 });
      }

      // Deduct stock for the update payload
      variants[variantIndex].stock -= item.qty;
      product.totalStock = (product.totalStock || 0) - item.qty;

      productUpdates.push({
         id: item.productId,
         data: {
             variants,
             totalStock: product.totalStock
         }
      });

      // Recalculate price and update item cost safely
      item.cost = Number(product.cost) || 0;
      item.price = Number(product.price) || 0;
      calculatedSubtotal += item.price * item.qty;
    }

    // 2. Validate Financial Totals
    const clientTotals = orderData.totals || {};
    const clientShipping = Number(clientTotals.shipping) || 0;
    const clientDiscount = Number(clientTotals.discount) || 0;

    if (clientShipping < 0) {
      return NextResponse.json({ error: "Shipping fee cannot be negative" }, { status: 400 });
    }

    if (clientDiscount < 0 || clientDiscount > calculatedSubtotal) {
      return NextResponse.json({ error: "Invalid discount amount" }, { status: 400 });
    }

    const expectedTotal = calculatedSubtotal + clientShipping - clientDiscount;
    if (expectedTotal < 0) {
      return NextResponse.json({ error: "Order total cannot be negative" }, { status: 400 });
    }

    const clientTotal = Number(clientTotals.total) || 0;

    if (Math.abs(expectedTotal - clientTotal) > 0.01) {
      return NextResponse.json({ error: `Total mismatch. Expected: ${expectedTotal}` }, { status: 400 });
    }

    // 3. Duplicate Order Prevention
    if (orderData.contact?.email) {
      const lastOrder = await fetchLastOrderByEmail(orderData.contact.email);
      if (lastOrder) {
        const timeDiff = Date.now() - new Date(lastOrder.createdAt).getTime();
        if (timeDiff < 60000 && lastOrder.totals?.total === expectedTotal) {
          return NextResponse.json({ error: "Duplicate order submission detected. Please wait." }, { status: 400 });
        }
      }
    }

    orderData.totals = {
      subtotal: calculatedSubtotal,
      shipping: clientShipping,
      discount: clientDiscount,
      total: expectedTotal
    };

    // Validate delivery and contact info
    if (!orderData.contact?.email || !orderData.delivery?.address) {
       return NextResponse.json({ error: "Missing required contact or delivery info" }, { status: 400 });
    }

    const order = await createOrderSecure(orderData, productUpdates);

    return NextResponse.json(
      { success: true, orderId: order.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
