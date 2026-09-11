import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";
import { SessionMode } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, openedById, mode = "DYNAMIC_QR", durationMinutes = 15 } = body;

    if (!courseId || !openedById) {
      return NextResponse.json({ error: "courseId and openedById are required" }, { status: 400 });
    }

    const course = dataStore.courses.find((c) => c.id === courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const newSession = {
      id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      courseId,
      openedById,
      mode: mode as SessionMode,
      semester: course.semester,
      isClosed: false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString(),
    };

    dataStore.sessions.unshift(newSession);

    return NextResponse.json({
      success: true,
      session: newSession,
      course,
    });
  } catch (err) {
    console.error("Session creation error:", err);
    return NextResponse.json({ error: "Failed to initialize session" }, { status: 500 });
  }
}
