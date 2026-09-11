import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";
import { AttendanceStatus } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, studentId, instructorId = "inst_1", reason, status = "PRESENT" } =
      await req.json();

    if (!sessionId || !studentId) {
      return NextResponse.json(
        { error: "sessionId and studentId are required" },
        { status: 400 }
      );
    }

    const session = dataStore.sessions.find((s) => s.id === sessionId);
    if (!session || session.isClosed) {
      return NextResponse.json(
        { error: "Attendance session is closed or invalid." },
        { status: 410 }
      );
    }

    const student = dataStore.users.find((u) => u.id === studentId || u.studentId === studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found in whitelist." }, { status: 404 });
    }

    const record = dataStore.manualMarkStudent(
      sessionId,
      student.id,
      instructorId,
      reason || "Manual in-class instructor check-in (no smartphone / offline)",
      status as AttendanceStatus
    );

    return NextResponse.json({
      success: true,
      message: `${student.fullName} has been manually marked as ${status}.`,
      record,
      student: {
        id: student.id,
        studentId: student.studentId,
        fullName: student.fullName,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to record manual attendance";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
