"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  GraduationCap,
  Users,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Save session locally for demo
        localStorage.setItem("attendance_user", JSON.stringify(data.user));
        router.push(data.redirectUrl || "/dashboard");
      } else {
        setErrorMsg(data.error || "Authentication failed. Please check your credentials.");
      }
    } catch {
      setErrorMsg("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (demoIdentifier: string, demoPass: string) => {
    setIdentifier(demoIdentifier);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#2C221E] flex flex-col justify-between selection:bg-[#B8860B]/20 p-4 sm:p-6">
      {/* Top Navbar */}
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

        <Link
          href="/"
          className="text-xs font-bold text-[#706259] hover:text-[#B8860B] transition-colors"
        >
          ← Back to Gateway
        </Link>
      </nav>

      {/* Main Login Card */}
      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="warm-card p-6 sm:p-8 space-y-6 shadow-xl border-[#EADBCE]">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FBF2DE] border border-[#B8860B]/30 flex items-center justify-center mx-auto text-[#B8860B] shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-[#2C221E] tracking-tight">
              Portal Sign In
            </h1>
            <p className="text-xs text-[#706259] max-w-xs mx-auto">
              Enter your Staff ID or Gmail credentials. System automatically routes your role.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#FAEAE9] border border-[#F8D7DA] text-[#B83833] text-xs font-semibold flex items-center gap-2.5 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#706259]">
                Staff ID or Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#706259] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. head@injibara.edu.et or STAFF/SE/001"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2C221E] placeholder-[#A6978A] focus:outline-none focus:border-[#B8860B] shadow-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#706259]">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#706259] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2C221E] placeholder-[#A6978A] focus:outline-none focus:border-[#B8860B] shadow-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 btn-ochre text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? "Authenticating..." : "Sign In to Portal"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Credentials for Review */}
          <div className="pt-4 border-t border-[#EADBCE] space-y-2">
            <p className="text-[11px] font-bold text-[#706259] uppercase tracking-wider text-center">
              Quick Test Credentials (Auto-Fill)
            </p>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleQuickDemo("head@injibara.edu.et", "Admin@2026")}
                className="p-2.5 rounded-xl border border-[#EADBCE] bg-[#FFFFFF] hover:border-[#B8860B] transition-all text-left space-y-0.5 group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2C221E] group-hover:text-[#B8860B]">
                  <Building2 className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span>Dept Head</span>
                </div>
                <p className="text-[10px] text-[#706259] font-mono truncate">head@injibara.edu.et</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("alazar.t@injibara.edu.et", "Instructor@2026")}
                className="p-2.5 rounded-xl border border-[#EADBCE] bg-[#FFFFFF] hover:border-[#B8860B] transition-all text-left space-y-0.5 group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2C221E] group-hover:text-[#B8860B]">
                  <GraduationCap className="w-3.5 h-3.5 text-[#1E7E53]" />
                  <span>Instructor</span>
                </div>
                <p className="text-[10px] text-[#706259] font-mono truncate">alazar.t@injibara.edu.et</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#706259] py-4">
        Injibara University • Department of Software Engineering
      </footer>
    </div>
  );
}
