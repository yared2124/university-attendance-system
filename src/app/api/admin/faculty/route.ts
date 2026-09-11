import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";

export async function GET() {
  const facultyList = dataStore.users.filter((u) => u.role === "INSTRUCTOR" || u.role === "DEPT_HEAD");
  return NextResponse.json({ faculty: facultyList, invitations: dataStore.gmailLogs });
}

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phoneNumber, staffId, department, temporaryPassword } = await req.json();

    if (!fullName || !email || !phoneNumber || !staffId) {
      return NextResponse.json(
        { error: "Full Name, Email, Phone Number, and Staff ID are required." },
        { status: 400 }
      );
    }

    const { faculty, invitation } = dataStore.registerFacultyMember({
      fullName,
      email,
      phoneNumber,
      staffId,
      department: department || "Software Engineering",
      temporaryPassword,
    });

    return NextResponse.json({
      success: true,
      message: `Faculty member ${fullName} successfully registered and Gmail invitation dispatched.`,
      faculty,
      invitation,
    });
  } catch (err: unknown) {
    console.error("Faculty registration error:", err);
    return NextResponse.json(
      { error: "Internal server error during faculty registration." },
      { status: 500 }
    );
  }
}
