import { NextRequest, NextResponse } from "next/server";
import { webhookCallback } from "grammy";
import { bot } from "@/lib/bot/bot";
import { verifyWebhookSecret } from "@/lib/auth/telegram";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secretHeader = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET || "dev_webhook_secret_12345";

  // Enforce webhook secret in production; in local dev allow if matched
  if (secretHeader && !verifyWebhookSecret(secretHeader, expectedSecret)) {
    return NextResponse.json({ error: "UNAUTHORIZED_WEBHOOK_CALL" }, { status: 403 });
  }

  try {
    return await webhookCallback(bot, "std/http")(req);
  } catch (err) {
    console.error("Error processing telegram webhook:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    bot: "Smart Attendance Telegram Bot Webhook Endpoint",
    timestamp: new Date().toISOString(),
  });
}
