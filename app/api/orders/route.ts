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
  setDoc,
  increment,
} from "firebase/firestore";

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
    const shipping = citySnap.exists() ? (citySnap.data().fee || 0) : 50; // Fallback to 50 if city not found

    const total = subtotal + shipping;

    // 3. Save Order
    console.log("💾 [API/Orders] saving order to Firestore...");
    const orderRef = await addDoc(collection(db, "orders"), {
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
    });
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
    }
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

        // 📧 Professional HTML Email Template
        const generateHTML = (isCustomer = false) => `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
                .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #a855f7; }
                .header h1 { color: #a855f7; margin: 0; }
                .order-summary { margin: 20px 0; background: #f9f9f9; padding: 15px; border-radius: 8px; }
                .item { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dotted #ccc; }
                .total { font-size: 1.2em; font-weight: bold; color: #a855f7; text-align: right; margin-top: 15px; }
                .details { margin-top: 20px; font-size: 0.9em; }
                .footer { text-align: center; margin-top: 30px; font-size: 0.8em; color: #777; }
                .btn { display: inline-block; padding: 10px 20px; background: #a855f7; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Hedoomyy Store</h1>
                  <p>${isCustomer ? 'Thank you for your order!' : '🎉 New Order Received'}</p>
                </div>
                
                <div class="order-summary">
                  <h3>Order ID: #${orderRef.id.slice(0, 8).toUpperCase()}</h3>
                  ${items.map((i: any) => `
                    <div class="item">
                      <span>${i.title} (${i.color} / ${i.size}) x${i.qty}</span>
                      <span>${i.price * i.qty} EGP</span>
                    </div>
                  `).join('')}
                  <div class="total">Total: ${total} EGP</div>
                </div>

                <div class="details">
                  <p><strong>Customer:</strong> ${delivery.firstName} ${delivery.lastName}</p>
                  <p><strong>Phone:</strong> ${delivery.phone}</p>
                  <p><strong>Address:</strong> ${delivery.city}, ${delivery.address}, Apt ${delivery.apartment}</p>
                  <p><strong>Payment Method:</strong> ${payment.toUpperCase()}</p>
                  ${paymentPhotoUrl ? `<p><strong>Payment Proof:</strong> <a href="${paymentPhotoUrl}">View Here</a></p>` : ''}
                </div>

                ${isCustomer ? `
                  <div style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://hedoomyy.com'}/account" class="btn">View My Orders</a>
                  </div>
                ` : ''}

                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Hedoomyy Store. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `;

        // Send to Admin
        console.log(`📧 [API/Orders] Sending admin email to ${adminEmail}...`);
        await transporter.sendMail({
          from: `"Hedoomyy Admin" <${gmailUser}>`,
          to: adminEmail,
          subject: `🛒 New Order #${orderRef.id.slice(0, 6).toUpperCase()}`,
          html: generateHTML(false),
          text: `New order from ${delivery.firstName}. Total: ${total} EGP.`,
        });

        // Send to Customer
        if (customer.email) {
          console.log(`📧 [API/Orders] Sending customer email to ${customer.email}...`);
          await transporter.sendMail({
            from: `"Hedoomyy Store" <${gmailUser}>`,
            to: customer.email,
            subject: "Your Order Confirmation - Hedoomyy",
            html: generateHTML(true),
            text: `Thank you for your order, ${delivery.firstName}! Your order ID is ${orderRef.id}.`,
          });
        }
        console.log("✅ [API/Orders] All emails sent successfully.");
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
