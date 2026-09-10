import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";
import { getSessionActiveTokens } from "@/lib/redis/token-service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const session = dataStore.sessions.find((s) => s.id === sessionId);
  if (!session) {
    return NextResponse.json({ error: "SESSION_NOT_FOUND" }, { status: 404 });
  }

  const course = dataStore.courses.find((c) => c.id === session.courseId);

  const tokens = await getSessionActiveTokens(
    session.id,
    course?.courseCode || "COURSE",
    course?.title || "Attendance"
  );

  // Return active session stats and tokens
  const checkedInStudents = dataStore.records
    .filter((r) => r.sessionId === session.id && r.status === "PRESENT")
    .map((r) => {
      const student = dataStore.users.find((u) => u.id === r.studentId);
      return {
        id: r.id,
        studentId: student?.studentId,
        fullName: student?.fullName,
        markedAt: r.markedAt,
      };
    });

  const totalCohort = dataStore.users.filter(
    (u) => u.role === "STUDENT" && u.batchYear === course?.batchYear && u.isActive
  ).length;

  return NextResponse.json({
    sessionId: session.id,
    isClosed: session.isClosed,
    courseCode: course?.courseCode,
    courseTitle: course?.title,
    batchYear: course?.batchYear,
    qrSeed: tokens.qrSeed,
    qrExpiresInSeconds: tokens.qrExpiresInSeconds,
    rollingCode: tokens.rollingCode,
    codeExpiresInSeconds: tokens.codeExpiresInSeconds,
    checkedInCount: checkedInStudents.length,
    totalCohort,
    recentCheckIns: checkedInStudents.slice(-10).reverse(),
  });
}
