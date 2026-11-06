import { upsertDocument } from "@/lib/firestore-server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, path, email, uid } = await req.json();

    if (typeof sessionId !== "string" || !/^[a-zA-Z0-9_-]{6,128}$/.test(sessionId)) {
      return Response.json({ error: "Invalid sessionId" }, { status: 400 });
    }

    // Use REST API to track presence
    await upsertDocument("activePresence", sessionId, {
      lastActive: new Date(),
      sessionId,
      path: typeof path === "string" ? path.split("?")[0].slice(0, 500) : "/",
      email: typeof email === "string" ? email.slice(0, 254) : "Anonymous",
      uid: typeof uid === "string" ? uid.slice(0, 128) : null,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("API /api/heartbeat error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
