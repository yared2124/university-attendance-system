import { NextRequest, NextResponse } from "next/server";
import { generateBatchAttendanceExcel } from "@/lib/export/excel";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const batchYear = parseInt(searchParams.get("batchYear") || "3", 10);

  try {
    const buffer = generateBatchAttendanceExcel(batchYear);

    return new Response(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="Attendance_Year_${batchYear}_${new Date().toISOString().slice(0, 10)}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Failed to generate Excel report" }, { status: 500 });
  }
}
