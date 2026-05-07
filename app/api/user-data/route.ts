import { fetchUserById, upsertDocument } from "@/lib/firestore-server";
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

    // Use REST API PATCH — equivalent to setDoc with merge:false on known fields
    await upsertDocument("users", uid, data);

    return Response.json({ success: true });
  } catch (error) {
    console.error("POST /api/user-data error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
