import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId") || "stu_301";

  const courses = dataStore.getCourseAttendanceForStudent(studentId);
  const student = dataStore.users.find((u) => u.id === studentId || u.studentId === studentId);

  return NextResponse.json({
    student: {
      fullName: student?.fullName || "Abebe Kebede",
      studentId: student?.studentId || "UGR/1401/14",
      batchYear: student?.batchYear || 3,
      department: student?.department || "Department of Software Engineering",
      institution: "Injibara University",
    },
    courses,
    overallRate: courses.length > 0 ? Math.round(courses.reduce((acc, c) => acc + c.attendanceRate, 0) / courses.length) : 92,
  });
}
