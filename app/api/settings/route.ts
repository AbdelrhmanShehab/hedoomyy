import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { fetchWebsiteSettings } from "../../../lib/firestore-server";

export async function GET() {
  try {
    const settings = await fetchWebsiteSettings();
    return NextResponse.json({ isActive: settings.isActive ?? true });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ isActive: true, error: error.message }, { status: 500 });
  }
}
