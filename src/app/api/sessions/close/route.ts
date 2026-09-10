import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const result = dataStore.closeSessionAndMaterializeAbsence(sessionId);

    return NextResponse.json({
      success: true,
      message: "Session successfully closed and cohort absences materialized.",
      ...result,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to close session";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
