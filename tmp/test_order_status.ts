const BASE_URL = "http://localhost:3000";

async function testStatusUpdate() {
  console.log("🚀 Starting Order Status Update Test...");

  // 1. Create a dummy order
  console.log("\n1. Creating dummy order...");
  const createResponse = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "test-user-id",
      items: [
        {
          productId: "test-product-id", // Note: This might fail if the product doesn't exist in Firestore
          variantId: "test-variant-id",
          title: "Test Product",
          price: 100,
          qty: 1,
          image: "https://via.placeholder.com/150",
          color: "Black",
          size: "L"
        }
      ],
      customer: {
        email: "test-customer@example.com",
        phone: "0123456789"
      },
      delivery: {
        firstName: "Test",
        lastName: "Customer",
        address: "123 Test St",
        phone: "0123456789",
        city: "Cairo",
        apartment: "1A"
      },
      payment: "cod"
    })
  });

  const createData = await createResponse.json();
  if (!createResponse.ok) {
    console.error("❌ Failed to create order:", createData);
    // If it failed because of stock validation (product not found), 
    // we can still test the PATCH if we have an existing order ID.
    console.log("Attempting to test PATCH with a placeholder ID if creation failed...");
  } else {
    console.log("✅ Order created ID:", createData.orderId);
  }

  const orderId = createData.orderId || "PLEASE_PROVIDE_AN_EXISTING_ORDER_ID";

  // 2. Test status updates
  const statuses = ["confirmed", "shipped", "delivered"];

  for (const status of statuses) {
    console.log(`\n2. Updating status to: ${status}...`);
    const patchResponse = await fetch(`${BASE_URL}/api/orders`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status })
    });

    const patchData = await patchResponse.json();
    if (patchResponse.ok) {
      console.log(`✅ Status updated to ${status}:`, patchData.message);
    } else {
      console.error(`❌ Failed to update status to ${status}:`, patchData.error);
    }
  }

  console.log("\n🏁 Test finished.");
}

testStatusUpdate().catch(console.error);
