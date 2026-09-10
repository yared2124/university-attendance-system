import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Validate authorization header for cron job
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "dev_cron_secret";

  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${cronSecret}`
  ) {
    return NextResponse.json({ error: "UNAUTHORIZED_CRON" }, { status: 401 });
  }

  const batchKPIs = dataStore.getBatchKPIs();
  const activeSessionsCount = dataStore.sessions.filter((s) => !s.isClosed).length;
  const deptHeadUser = dataStore.users.find((u) => u.role === "DEPT_HEAD");

  // Format executive briefing in Markdown
  const reportLines = [
    `📊 *Department of Software Engineering - Friday Executive Digest*`,
    `📅 *Generated:* ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })} at 18:00 EAT`,
    `----------------------------------------`,
    `📈 *Academic Cohort Attendance Summary:*`,
  ];

  let totalAtRisk = 0;
  for (const kpi of batchKPIs) {
    totalAtRisk += kpi.atRiskCount;
    const emoji = kpi.overallAttendanceRate >= 85 ? "🟢" : kpi.overallAttendanceRate >= 75 ? "🟡" : "🔴";
    reportLines.push(
      `${emoji} *${kpi.name}:* ${kpi.overallAttendanceRate}% | At-Risk: ${kpi.atRiskCount} | Students: ${kpi.totalStudents}`
    );
  }

  reportLines.push(`----------------------------------------`);
  reportLines.push(`⚠️ *Total At-Risk Students (<75%):* ${totalAtRisk}`);
  reportLines.push(`🏫 *Active Sessions Currently Open:* ${activeSessionsCount}`);
  reportLines.push(`\n🔗 View full interactive analytics at your Admin Dashboard.`);

  const digestMessage = reportLines.join("\n");

  // In production, send via Telegram Bot API to DEPT_HEAD_TELEGRAM_ID
  const deptHeadChatId = process.env.DEPT_HEAD_TELEGRAM_ID || deptHeadUser?.telegramId;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  let telegramDispatched = false;
  if (botToken && deptHeadChatId && botToken !== "mock_bot_token_for_dev_mode") {
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: deptHeadChatId,
          text: digestMessage,
          parse_mode: "Markdown",
        }),
      });
      telegramDispatched = true;
    } catch (err) {
      console.error("Failed to send Telegram digest:", err);
    }
  }

  return NextResponse.json({
    success: true,
    telegramDispatched,
    deptHeadChatId,
    summary: {
      totalAtRisk,
      batchKPIs,
    },
    digestPreview: digestMessage,
  });
}
