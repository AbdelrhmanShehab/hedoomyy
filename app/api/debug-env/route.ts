import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    GMAIL_USER: process.env.GMAIL_USER ? "✅ Present" : "❌ Missing",
    GMAIL_PASS: process.env.GMAIL_PASS ? "✅ Present" : "❌ Missing",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ? "✅ Present" : "❌ Missing",
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "Using default: https://hedoomyy.com"
  });
}
