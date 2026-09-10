import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { recordId, excuseReason, facultyId } = await req.json();

    if (!recordId || !excuseReason || !facultyId) {
      return NextResponse.json(
        { error: "recordId, excuseReason, and facultyId are required" },
        { status: 400 }
      );
    }

    if (excuseReason.trim().length < 5) {
      return NextResponse.json(
        { error: "A valid explanation (minimum 5 characters) must be documented." },
        { status: 400 }
      );
    }

    const updatedRecord = dataStore.reconcileExcuse(recordId, excuseReason, facultyId);

    return NextResponse.json({
      success: true,
      message: "Absence successfully updated to EXCUSED.",
      record: updatedRecord,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to excuse absence";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
