import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, phoneNumber, telegramId, telegramUsername } = body;

    if (!studentId || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: "Student ID and Phone Number are required." },
        { status: 400 }
      );
    }

    const cleanId = String(studentId).trim().toUpperCase();
    const cleanPhone = String(phoneNumber).trim().replace(/[\s-]/g, "");
    const normalizedPhone = cleanPhone.startsWith("+")
      ? cleanPhone
      : cleanPhone.length > 8
      ? `+251${cleanPhone.replace(/^0/, "")}`
      : cleanPhone;

    // Look for matching student in Software Engineering whitelist
    const matchedStudent = dataStore.users.find((u) => {
      if (u.role !== "STUDENT") return false;

      const idMatch = u.studentId?.toUpperCase() === cleanId;
      const phoneMatch =
        u.phoneNumber.replace(/[\s+-]/g, "") === normalizedPhone.replace(/[\s+-]/g, "");

      return idMatch || phoneMatch;
    });

    if (!matchedStudent) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Student identity not found in the Department of Software Engineering whitelist. Please contact your department head to be registered.",
        },
        { status: 404 }
      );
    }

    // Bind Telegram credentials if provided
    if (telegramId) {
      matchedStudent.telegramId = String(telegramId);
    }
    if (telegramUsername) {
      matchedStudent.telegramUsername = String(telegramUsername);
    }

    return NextResponse.json({
      success: true,
      message: "Student identity verified and bound successfully.",
      student: {
        id: matchedStudent.id,
        fullName: matchedStudent.fullName,
        studentId: matchedStudent.studentId,
        phoneNumber: matchedStudent.phoneNumber,
        batchYear: matchedStudent.batchYear || 3,
        department: "Software Engineering",
        institution: "Injibara University",
        telegramId: matchedStudent.telegramId || null,
        isBound: true,
      },
    });
  } catch (err) {
    console.error("Error in student verify-identity:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

// GET endpoint to check existing binding by telegramId or studentId
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get("telegramId");
  const studentId = searchParams.get("studentId");

  if (!telegramId && !studentId) {
    return NextResponse.json(
      { success: false, error: "telegramId or studentId parameter required." },
      { status: 400 }
    );
  }

  const student = dataStore.users.find((u) => {
    if (u.role !== "STUDENT") return false;
    if (telegramId && u.telegramId === telegramId) return true;
    if (studentId && u.studentId?.toUpperCase() === studentId.toUpperCase()) return true;
    return false;
  });

  if (!student) {
    return NextResponse.json({ success: false, isBound: false }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    isBound: true,
    student: {
      id: student.id,
      fullName: student.fullName,
      studentId: student.studentId,
      phoneNumber: student.phoneNumber,
      batchYear: student.batchYear || 3,
      department: "Software Engineering",
      institution: "Injibara University",
      telegramId: student.telegramId,
    },
  });
}
