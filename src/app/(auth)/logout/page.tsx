"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, LogOut, CheckCircle2, ArrowRight } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear local authentication / session data
    if (typeof window !== "undefined") {
      localStorage.removeItem("attendance_user");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#2C221E] flex flex-col justify-between p-4 sm:p-6 selection:bg-[#B8860B]/20">
      <nav className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 border-b border-[#EADBCE]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FBF2DE] border border-[#B8860B]/30 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#B8860B]" />
          </div>
          <div>
            <span className="font-black text-sm text-[#2C221E] tracking-tight">
              Injibara University
            </span>
            <p className="text-[11px] text-[#706259] font-medium">
              Academic Attendance Integrity Portal
            </p>
          </div>
        </div>
      </nav>

      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="warm-card p-8 text-center space-y-5 shadow-xl border-[#EADBCE]">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F3EE] border border-[#C2E8CA] text-[#1E7E53] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-[#2C221E] tracking-tight">
              Successfully Signed Out
            </h1>
            <p className="text-xs text-[#706259] leading-relaxed">
              Your session has been securely closed. Thank you for protecting the integrity of Injibara University academic attendance records.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <Link
              href="/login"
              className="w-full py-3 px-4 btn-ochre text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              Sign In Again <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="block w-full py-2.5 px-4 bg-[#FFFFFF] hover:bg-[#F4EFE6] border border-[#EADBCE] text-[#706259] hover:text-[#2C221E] font-bold text-xs rounded-xl transition-all"
            >
              Return to University Gateway
            </Link>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-[#706259] py-4">
        Injibara University • Department of Software Engineering
      </footer>
    </div>
  );
}
