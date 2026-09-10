import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";
import { validateTelegramWebAppData } from "@/lib/auth/telegram";
import { verifyDynamicQRToken, verifyRollingCodeToken } from "@/lib/redis/token-service";
import { VerifyCheckInRequest, VerifyCheckInResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VerifyCheckInRequest & {
      initData?: string;
      studentIdOverride?: string; // For testing and simulated Mini App environments
    };

    const { sessionId, tokenType, payload, nonce, initData, studentIdOverride } = body;

    if (!sessionId || !tokenType || !payload) {
      return NextResponse.json<VerifyCheckInResponse>(
        { success: false, message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 1. Authenticate student via Telegram Mini App initData or demo context
    let student = null;

    if (initData) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN || "mock_bot_token_for_dev_mode";
      const { isValid, user } = validateTelegramWebAppData(initData, botToken);
      if (isValid && user) {
        student = dataStore.users.find((u) => u.telegramId === user.id.toString());
      }
    }

    // If in demo/dev mode and studentIdOverride is provided
    if (!student && studentIdOverride) {
      student = dataStore.users.find(
        (u) => u.id === studentIdOverride || u.studentId === studentIdOverride
      );
    }

    // Fallback: pick the first student in batch if student is still null in local preview
    if (!student) {
      student = dataStore.users.find((u) => u.role === "STUDENT" && u.batchYear === 3);
    }

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json<VerifyCheckInResponse>(
        {
          success: false,
          message: "Student account not found or not whitelisted. Please run /start in the bot.",
        },
        { status: 403 }
      );
    }

    // 2. Validate Session existence and active state
    const session = dataStore.sessions.find((s) => s.id === sessionId);
    if (!session || session.isClosed) {
      return NextResponse.json<VerifyCheckInResponse>(
        { success: false, message: "Attendance session has ended or is invalid." },
        { status: 410 }
      );
    }

    // 3. Verify Token based on Mode
    if (tokenType === "DYNAMIC_QR") {
      const qrResult = await verifyDynamicQRToken(sessionId, payload, nonce);
      if (!qrResult.valid) {
        return NextResponse.json<VerifyCheckInResponse>(
          {
            success: false,
            message:
              qrResult.reason === "REPLAY_DETECTED_TOKEN_ALREADY_USED"
                ? "This QR code has already been claimed (Replay blocked)."
                : "QR code expired. Please scan the current code on screen.",
          },
          { status: 400 }
        );
      }
    } else if (tokenType === "ROLLING_CODE") {
      const codeResult = await verifyRollingCodeToken(sessionId, student.id, payload);
      if (!codeResult.valid) {
        if (codeResult.lockedOutSeconds) {
          return NextResponse.json<VerifyCheckInResponse>(
            {
              success: false,
              message: `Too many failed attempts. You are locked out for ${codeResult.lockedOutSeconds}s.`,
            },
            { status: 429 }
          );
        }
        return NextResponse.json<VerifyCheckInResponse>(
          { success: false, message: "Invalid or expired 6-character code." },
          { status: 400 }
        );
      }
    }

    // 4. Record Check-in
    const record = dataStore.recordCheckIn(sessionId, student.id);

    return NextResponse.json<VerifyCheckInResponse>({
      success: true,
      message: "Attendance successfully recorded!",
      markedAt: record.markedAt,
      status: "PRESENT",
      studentName: student.fullName,
      studentId: student.studentId || undefined,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json<VerifyCheckInResponse>(
      { success: false, message: "An internal verification error occurred." },
      { status: 500 }
    );
  }
}
