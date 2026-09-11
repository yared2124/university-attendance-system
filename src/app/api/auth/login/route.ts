import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Staff ID / Email and password are required" },
        { status: 400 }
      );
    }

    const user = dataStore.authenticateUser(identifier, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your Staff ID / Email and password." },
        { status: 401 }
      );
    }

    // Role-based target redirection URL
    let redirectUrl = "/";
    if (user.role === "DEPT_HEAD") {
      redirectUrl = "/dashboard";
    } else if (user.role === "INSTRUCTOR") {
      redirectUrl = "/instructor";
    } else {
      redirectUrl = "/mini-app";
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        department: user.department || "Software Engineering",
        staffId: user.staffId,
        email: user.email,
      },
      redirectUrl,
    });
  } catch (err: unknown) {
    console.error("Auth error:", err);
    return NextResponse.json(
      { error: "Internal authentication error" },
      { status: 500 }
    );
  }
}
