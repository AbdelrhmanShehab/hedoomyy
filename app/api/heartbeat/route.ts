import { upsertDocument } from "@/lib/firestore-server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, path, email, uid } = await req.json();

    if (!sessionId) {
      return Response.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Use REST API to track presence
    await upsertDocument("activePresence", sessionId, {
      lastActive: new Date(),
      path,
      email: email || "Anonymous",
      uid: uid || null,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("API /api/heartbeat error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
