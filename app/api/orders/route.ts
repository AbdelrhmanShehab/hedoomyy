import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, customer, delivery, payment } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    let subtotal = 0;

    // 🔥 STOCK VALIDATION + REDUCTION
    for (const item of items) {
      const productRef = doc(db, "products", item.productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
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
        return NextResponse.json(
          { error: "Variant not found" },
          { status: 404 }
        );
      }

      if (variant.stock < item.qty) {
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

    const shipping = 50;
    const total = subtotal + shipping;

    // ✅ Save order
    const orderRef = await addDoc(collection(db, "orders"), {
      items,
      customer,
      delivery,
      payment: {
        method: payment,
        paid: false,
      },
      totals: {
        subtotal,
        shipping,
        total,
      },
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 📧 SEND EMAILS
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const orderDetails = items
      .map(
        (i: any) =>
          `• ${i.title} (${i.color} / ${i.size}) x${i.qty}`
      )
      .join("\n");

    const emailText = `
New Order Received

Order ID: ${orderRef.id}

Customer: ${delivery.firstName} ${delivery.lastName}
Phone: ${delivery.phone}

Items:
${orderDetails}

Total: ${total} EGP
Payment: ${payment}
`;

    // Send to Admin
    await transporter.sendMail({
      from: `"Hedoomyy" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "🛒 New Order Received",
      text: emailText,
    });

    // Send to Customer
    await transporter.sendMail({
      from: `"Hedoomyy" <${process.env.GMAIL_USER}>`,
      to: customer.email,
      subject: "Your Order Confirmation",
      text: `Thank you for your order!\n\n${emailText}`,
    });

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
