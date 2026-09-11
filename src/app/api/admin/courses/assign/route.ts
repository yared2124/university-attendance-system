import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";

export async function GET() {
  return NextResponse.json({
    courses: dataStore.courses,
    faculty: dataStore.users.filter((u) => u.role === "INSTRUCTOR" || u.role === "DEPT_HEAD"),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { courseId, instructorId, scheduleSlot } = await req.json();

    if (!courseId || !instructorId) {
      return NextResponse.json(
        { error: "courseId and instructorId are required." },
        { status: 400 }
      );
    }

    const updatedCourse = dataStore.assignInstructorToCourse(courseId, instructorId, scheduleSlot);

    return NextResponse.json({
      success: true,
      message: `Course ${updatedCourse.courseCode} assigned to instructor successfully.`,
      course: updatedCourse,
    });
  } catch (err: unknown) {
    console.error("Course assignment error:", err);
    return NextResponse.json(
      { error: "Internal error during course assignment." },
      { status: 500 }
    );
  }
}
