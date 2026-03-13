import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass) {
    return NextResponse.json({
      success: false,
      error: "Missing GMAIL_USER or GMAIL_PASS environment variables."
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  try {
    console.log("🛠️ [TestConnection] Verifying SMTP connection...");
    await transporter.verify();
    return NextResponse.json({
      success: true,
      message: "✅ SMTP Connection verified! Nodemailer is ready to send emails.",
      details: {
        user: gmailUser,
        service: "gmail"
      }
    });
  } catch (error: any) {
    console.error("❌ [TestConnection] Verification failed:", error.message);
    
    let advice = "Check your credentials.";
    if (error.message.includes("Invalid login") || error.message.includes("535")) {
      advice = "Invalid login. If you have 2FA enabled, you MUST use an 'App Password' from Google, not your regular password.";
    } else if (error.message.includes("ETIMEDOUT")) {
      advice = "Connection timed out. This might be a firewall or network issue.";
    }

    return NextResponse.json({
      success: false,
      error: error.message,
      advice: advice,
      code: error.code,
      command: error.command
    });
  }
}
