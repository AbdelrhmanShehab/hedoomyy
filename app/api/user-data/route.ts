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

    if (!data.firstName || !data.firstName.trim() || !data.lastName || !data.lastName.trim()) {
      return Response.json({ error: "First and last name are required" }, { status: 400 });
    }

    if (data.phone && !/^01[0-9]{9}$/.test(data.phone)) {
      return Response.json({ error: "Invalid Egyptian phone number format" }, { status: 400 });
    }

    if (data.secondPhone && !/^01[0-9]{9}$/.test(data.secondPhone)) {
      return Response.json({ error: "Invalid Egyptian second phone number format" }, { status: 400 });
    }

    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (data.address && data.address.trim().length < 10) {
      return Response.json({ error: "Address must be at least 10 characters long" }, { status: 400 });
    }

    // Use REST API PATCH — equivalent to setDoc with merge:false on known fields
    await upsertDocument("users", uid, data);

    return Response.json({ success: true });
  } catch (error) {
    console.error("POST /api/user-data error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
