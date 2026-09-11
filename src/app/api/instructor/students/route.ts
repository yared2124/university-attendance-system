import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const batchYear = Number(searchParams.get("batchYear") || 1);
  const courseId = searchParams.get("courseId");

  const students = dataStore.users.filter(
    (u) => u.role === "STUDENT" && u.batchYear === batchYear && u.isActive
  );

  // Calculate realistic course attendance rates for each student
  const studentsWithRate = students.map((s, idx) => {
    // Generate deterministic demo rate per student
    let baseRate = 86;
    if (idx === 1) baseRate = 68; // Warning < 80%
    if (idx === 2) baseRate = 74; // Warning < 80%
    if (idx === 3) baseRate = 95;
    if (idx === 0) baseRate = 92;

    return {
      id: s.id,
      fullName: s.fullName,
      studentId: s.studentId,
      phoneNumber: s.phoneNumber,
      batchYear: s.batchYear,
      attendanceRate: baseRate,
      status: baseRate >= 80 ? "GOOD_STANDING" : "LOW_ATTENDANCE",
    };
  });

  return NextResponse.json({
    students: studentsWithRate,
    totalEnrolled: students.length,
    warningCount: studentsWithRate.filter((s) => s.attendanceRate < 80).length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { fullName, studentId, phoneNumber, batchYear, courseId } = await req.json();

    if (!fullName || !studentId || !phoneNumber || !batchYear) {
      return NextResponse.json(
        { error: "Full name, student ID, phone number and batch year are required." },
        { status: 400 }
      );
    }

    const student = dataStore.registerStudentByInstructor({
      fullName,
      studentId,
      phoneNumber,
      batchYear: Number(batchYear),
      courseId,
    });

    return NextResponse.json({
      success: true,
      message: `Student ${fullName} successfully enrolled in Year ${batchYear} roster.`,
      student,
    });
  } catch (err: unknown) {
    console.error("Instructor student registration error:", err);
    return NextResponse.json(
      { error: "Failed to register student." },
      { status: 500 }
    );
  }
}
