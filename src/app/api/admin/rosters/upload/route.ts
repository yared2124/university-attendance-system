import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";
import { Role } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { rows } = await req.json();

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: "Invalid payload: 'rows' array is required." },
        { status: 400 }
      );
    }

    let addedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    for (const [index, row] of rows.entries()) {
      if (!row.fullName || !row.phoneNumber) {
        errors.push(`Row ${index + 1}: Missing fullName or phoneNumber`);
        continue;
      }

      // Format E.164 phone
      let phone = String(row.phoneNumber).trim().replace(/\s+/g, "");
      if (!phone.startsWith("+")) {
        phone = "+" + phone;
      }

      const existingIndex = dataStore.users.findIndex(
        (u) => u.phoneNumber.replace(/[\s+-]/g, "") === phone.replace(/[\s+-]/g, "")
      );

      const parsedBatchYear = row.batchYear ? parseInt(row.batchYear, 10) : null;
      const role: Role = row.role === "INSTRUCTOR" ? "INSTRUCTOR" : "STUDENT";

      if (existingIndex >= 0) {
        // Update existing record details without unbinding telegramId
        dataStore.users[existingIndex].fullName = row.fullName;
        if (row.studentId) dataStore.users[existingIndex].studentId = row.studentId;
        if (parsedBatchYear) dataStore.users[existingIndex].batchYear = parsedBatchYear;
        updatedCount++;
      } else {
        // Add new whitelist anchor
        dataStore.users.push({
          id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          phoneNumber: phone,
          telegramId: null, // to be bound on first /start
          fullName: row.fullName,
          studentId: row.studentId || null,
          role,
          batchYear: parsedBatchYear,
          isActive: true,
        });
        addedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      addedCount,
      updatedCount,
      totalProcessed: rows.length,
      errors,
    });
  } catch (err) {
    console.error("Roster upload error:", err);
    return NextResponse.json({ error: "Failed to process roster upload." }, { status: 500 });
  }
}
