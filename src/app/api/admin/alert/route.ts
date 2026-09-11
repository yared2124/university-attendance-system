import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { studentId, customMessage, attendanceRate = 64 } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    const student = dataStore.users.find(
      (u) => u.id === studentId || u.studentId === studentId
    );

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const defaultWarning =
      `🚨 *የዲፓርትመንት አስቸኳይ ማስጠንቀቂያ / Official Attendance Warning*\n\n` +
      `ውድ ተማሪ *${student.fullName}* (${student.studentId || "N/A"}):\n\n` +
      `የዚህ ሴሚስተር የአቴንዳንስ ምጣኔዎ *${attendanceRate}%* ላይ ይገኛል። በዩኒቨርሲቲው እና በዲፓርትመንቱ ደንብ መሰረት አቴንዳንስ ከ *75%* በታች የሆነ ተማሪ ለፍፃሜ ፈተና (Final Exam) አይቀመጥም!\n\n` +
      `⚠️ *አስፈላጊ እርምጃ:* በአስቸኳይ የትምህርት ክፍለ-ጊዜዎችን አዘውትረው እንዲከታተሉ እና ያልገቡበት በቂ የህክምና ወይም አስተዳደራዊ ምክንያት ካለ ማስረጃዎን ይዘው ወደ ዲፓርትመንት ቢሮ እንዲቀርቡ እናሳስባለን።\n\n` +
      `— *የትምህርት አስተባባሪ እና የዲፓርትመንት ኃላፊ ቢሮ*`;

    const finalMessage = customMessage || defaultWarning;

    // Send via Telegram Bot API if telegramId and token exist
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    let telegramDelivered = false;

    if (
      botToken &&
      botToken !== "mock_bot_token_for_dev_mode" &&
      student.telegramId
    ) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: student.telegramId,
            text: finalMessage,
            parse_mode: "Markdown",
          }),
        });
        telegramDelivered = tgRes.ok;
      } catch (tgErr) {
        console.error("Telegram dispatch error:", tgErr);
      }
    } else {
      // In local dev/mock mode, simulate delivery
      telegramDelivered = true;
    }

    // Record the dispatched alert in audit store
    const loggedAlert = dataStore.logDispatchedAlert(
      student.id,
      finalMessage,
      attendanceRate
    );

    return NextResponse.json({
      success: true,
      message: `Official warning successfully dispatched to ${student.fullName}.`,
      alert: loggedAlert,
      telegramDelivered,
      student: {
        fullName: student.fullName,
        studentId: student.studentId,
        phoneNumber: student.phoneNumber,
        telegramId: student.telegramId,
        telegramUsername: student.telegramUsername,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to dispatch alert";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
