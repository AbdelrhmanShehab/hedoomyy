import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  setDoc,
  increment,
} from "firebase/firestore";
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from "@/lib/email-service";

export async function POST(req: Request) {
  try {
    console.log("🛒 [API/Orders] New order request received");
    const body = await req.json();
    const { userId, items, customer, delivery, payment, depositType, depositAmount, paymentPhotoUrl } = body;

    // 1. Validation
    if (!items || items.length === 0) {
      console.warn("⚠️ [API/Orders] No items provided in request");
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    let subtotal = 0;

    // 2. Stock Validation + Reduction
    console.log("📦 [API/Orders] Validating stock for items:", items.length);
    for (const item of items) {
      const productRef = doc(db, "products", item.productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        console.error(`❌ [API/Orders] Product not found: ${item.productId}`);
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      const product = productSnap.data();
      const variant = product.variants.find(
        (v: any) => v.id === item.variantId
      );

      if (!variant) {
        console.error(`❌ [API/Orders] Variant not found: ${item.variantId} for product ${item.productId}`);
        return NextResponse.json(
          { error: "Variant not found" },
          { status: 404 }
        );
      }

      if (variant.stock < item.qty) {
        console.warn(`⚠️ [API/Orders] Insufficient stock for ${product.title}`);
        return NextResponse.json(
          { error: `Not enough stock for ${product.title}` },
          { status: 400 }
        );
      }

      // Reduce stock
      variant.stock -= item.qty;
      subtotal += item.price * item.qty;

      await updateDoc(productRef, {
        variants: product.variants,
        totalStock: product.variants.reduce(
          (sum: number, v: any) => sum + v.stock,
          0
        ),
      });
    }

    // Fetch shipping fee from cities collection
    console.log(`🚚 [API/Orders] Fetching shipping fee for city: ${delivery.city}`);
    const cityRef = doc(db, "cities", delivery.city);
    const citySnap = await getDoc(cityRef);
    const shipping = citySnap.exists() ? (citySnap.data().fee || 0) : 50; 

    const total = subtotal + shipping;

    // 3. Save Order
    console.log("💾 [API/Orders] saving order to Firestore...");
    const orderData = {
      userId,
      items,
      customer,
      delivery,
      payment: {
        method: payment,
        paid: false,
        ...(depositType && { depositType }),
        ...(depositAmount && { depositAmount }),
        ...(paymentPhotoUrl && { paymentPhotoUrl }),
      },
      totals: {
        subtotal,
        shipping,
        total,
      },
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const orderRef = await addDoc(collection(db, "orders"), orderData);
    console.log(`✅ [API/Orders] Order saved successfully. ID: ${orderRef.id}`);

    // Track purchases + revenue per product (fire-and-forget)
    for (const item of items) {
      const statsRef = doc(db, "productStats", item.productId);
      setDoc(
        statsRef,
        {
          purchases: increment(item.qty),
          revenue: increment(item.price * item.qty),
        },
        { merge: true }
      ).catch(() => { });

      // Mark lead as converted if it exists
      if (customer?.email) {
        const leadId = `${customer.email}_${item.productId}`;
        const leadRef = doc(db, "leads", leadId);
        updateDoc(leadRef, {
          status: "converted",
          updatedAt: serverTimestamp()
        }).catch(() => { }); // Ignore if lead doesn't exist
      }
    }

    // 4. Send Emails (Non-blocking)
    console.log(`📧 [API/Orders] Triggering confirmation emails for order: ${orderRef.id}`);
    sendOrderConfirmationEmail({ id: orderRef.id, ...orderData }).catch(err => {
        console.error("❌ [API/Orders] Failed to trigger confirmation emails:", err);
    });

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
    });
  } catch (error: any) {
    console.error("❌ [API/Orders] Critical server error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { orderId, status } = await req.json();
    console.log(`🔄 [API/Orders] PATCH requested for Order: ${orderId}, Status: ${status}`);

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing orderId or status" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      console.warn(`⚠️ [API/Orders] Order not found: ${orderId}`);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    console.log(`🔄 [API/Orders] Updating Firestore for Order: ${orderId}`);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    // Trigger status update email (Non-blocking)
    const updatedOrder = { id: orderSnap.id, ...orderSnap.data(), status };
    console.log(`📧 [API/Orders] Triggering status update email for Order: ${orderId}`);
    sendOrderStatusUpdateEmail(updatedOrder).catch(err => {
        console.error(`❌ [API/Orders] Failed to trigger status update email for ${orderId}:`, err);
    });

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
    });
  } catch (error: any) {
    console.error("❌ [API/Orders] PATCH error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
