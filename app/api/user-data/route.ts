import { fetchUserById } from "@/lib/firestore-server";
import { db } from "@/lib/firestore-server-sdk";
import { doc, setDoc } from "firebase/firestore";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) {
    return Response.json({ error: "UID is required" }, { status: 400 });
  }

  try {
    const userData = await fetchUserById(uid);
    return Response.json(userData);
  } catch (error) {
    console.error("GET /api/user-data error:", error);
    return Response.json(null, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid, ...data } = await req.json();

    if (!uid) {
      return Response.json({ error: "UID is required" }, { status: 400 });
    }

    // Server-side write
    await setDoc(doc(db, "users", uid), data, { merge: true });

    return Response.json({ success: true });
  } catch (error) {
    console.error("POST /api/user-data error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
