import { db } from "@/lib/firestore-server-sdk";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, path, email, uid } = await req.json();

    if (!sessionId) {
      return Response.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const ref = doc(db, "activePresence", sessionId);
    await setDoc(ref, {
      lastActive: serverTimestamp(),
      path,
      email: email || "Anonymous",
      uid: uid || null,
    }, { merge: true });

    return Response.json({ success: true });
  } catch (error) {
    console.error("API /api/heartbeat error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
