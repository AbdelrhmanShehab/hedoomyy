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
    console.log("🛒 [API/Orders] New order request received");
    const body = await req.json();
    const { items, customer, delivery, payment } = body;

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

    const shipping = 50;
    const total = subtotal + shipping;

    // 3. Save Order
    console.log("💾 [API/Orders] saving order to Firestore...");
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
    console.log(`✅ [API/Orders] Order saved successfully. ID: ${orderRef.id}`);

    // 4. Send Emails (Non-blocking)
    const sendEmails = async () => {
      try {
        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_PASS;
        const adminEmail = process.env.ADMIN_EMAIL;

        if (!gmailUser || !gmailPass || !adminEmail) {
          console.warn("⚠️ [API/Orders] Email environment variables are missing. Skipping email notification.");
          return;
        }

        console.log("📧 [API/Orders] Initializing Nodemailer...");
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailUser,
            pass: gmailPass,
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
        console.log(`📧 [API/Orders] Sending admin email to ${adminEmail}...`);
        await transporter.sendMail({
          from: `"Hedoomyy" <${gmailUser}>`,
          to: adminEmail,
          subject: "🛒 New Order Received",
          text: emailText,
        });

        // Send to Customer
        if (customer.email) {
          console.log(`📧 [API/Orders] Sending customer email to ${customer.email}...`);
          await transporter.sendMail({
            from: `"Hedoomyy" <${gmailUser}>`,
            to: customer.email,
            subject: "Your Order Confirmation",
            text: `Thank you for your order!\n\n${emailText}`,
          });
        }
        console.log("✅ [API/Orders] All emails sent successfully.");
      } catch (emailError) {
        console.error("❌ [API/Orders] Email sending failed:", emailError);
        // We don't throw here to keep the main request successful
      }
    };

    // Trigger email process without awaiting it to speed up response
    sendEmails();

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
