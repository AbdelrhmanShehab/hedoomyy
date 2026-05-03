import { fetchCities } from "@/lib/firestore-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cities = await fetchCities();
    return NextResponse.json(cities);
  } catch (error) {
    console.error("GET /api/cities error:", error);
    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
  }
}
