"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  User,
  GraduationCap,
  Calendar,
  Layers,
  ChevronRight,
  Settings,
  BookOpen,
  FileText,
  Info,
  Eye,
  X,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import confetti from "canvas-confetti";

// Extend Window interface for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        HapticFeedback?: {
          notificationOccurred: (type: "error" | "success" | "warning") => void;
          impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
        };
        close?: () => void;
        expand?: () => void;
      };
    };
  }
}

interface CourseAttendanceStanding {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  attendanceRate: number;
  isGoodStanding: boolean;
  statusLabel: string;
}

export default function StudentMiniApp() {
  const [activeTab, setActiveTab] = useState<"qr" | "passcode">("qr");
  const [passcode, setPasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  // Course Breakdown Modal State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseStandings, setCourseStandings] = useState<CourseAttendanceStanding[]>([]);
  const [overallRate, setOverallRate] = useState(91);

  const [studentInfo] = useState({
    fullName: "Abebe Kebede",
    studentId: "UGR/1401/14",
    batchYear: 3,
    department: "Department of Software Engineering",
    institution: "Injibara University",
    phone: "+251922110001",
  });

  const simulatedSessionId = "sess_active_1";

  // Fetch course attendance breakdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`/api/student/courses?studentId=${studentInfo.studentId}`);
        const data = await res.json();
        if (res.ok && data.courses) {
          setCourseStandings(data.courses);
          setOverallRate(data.overallRate || 91);
        }
      } catch (err) {
        console.error("Course fetch error:", err);
      }
    };
    fetchCourses();
  }, [studentInfo.studentId]);

  const triggerHaptic = (type: "success" | "error" | "light") => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
      if (type === "success" || type === "error") {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    }
  };

  const handleKeypadPress = (char: string) => {
    triggerHaptic("light");
    if (passcode.length < 6) {
      const nextCode = passcode + char;
      setPasscode(nextCode);
      if (nextCode.length === 6) {
        submitPasscode(nextCode);
      }
    }
  };

  const handleBackspace = () => {
    triggerHaptic("light");
    setPasscode((prev) => prev.slice(0, -1));
  };

  const submitPasscode = async (codeToSubmit: string) => {
    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const formattedCode = `${codeToSubmit.slice(0, 3)}-${codeToSubmit.slice(3)}`;
      const res = await fetch("/api/sessions/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: simulatedSessionId,
          tokenType: "ROLLING_CODE",
          payload: formattedCode,
          studentIdOverride: "stu_301",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        triggerHaptic("success");
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setSubmissionResult({
          success: true,
          message: "Attendance Confirmed Successfully!",
          details: `SEng3112 • ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        });
        setPasscode("");
      } else {
        triggerHaptic("error");
        setSubmissionResult({
          success: false,
          message: data.message || "Invalid or expired passcode",
        });
      }
    } catch {
      triggerHaptic("error");
      setSubmissionResult({
        success: false,
        message: "Network error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateScan = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const streamRes = await fetch(`/api/sessions/${simulatedSessionId}/stream`);
      const streamData = await streamRes.json();
      const seed = streamData.qrSeed || "a9f8b2c4e1d034ab";

      const res = await fetch("/api/sessions/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: simulatedSessionId,
          tokenType: "DYNAMIC_QR",
          payload: seed,
          nonce: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          studentIdOverride: "stu_301",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        triggerHaptic("success");
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setSubmissionResult({
          success: true,
          message: "QR Code Token Verified Successfully!",
          details: `SEng3112 • ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        });
      } else {
        triggerHaptic("error");
        setSubmissionResult({
          success: false,
          message: data.message || "Dynamic QR token expired. Scan the newest token on the screen.",
        });
      }
    } catch {
      triggerHaptic("error");
      setSubmissionResult({
        success: false,
        message: "Connection error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen max-w-md mx-auto px-5 py-6 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#FBF2DE] text-[#B8860B] border border-[#B8860B]/30">
                {studentInfo.institution}
              </span>
              <span className="text-[11px] text-[#706259] font-medium">Student Portal</span>
            </div>
            <h1 className="text-2xl font-black text-[#2C221E] tracking-tight">
              Attendance Verification
            </h1>
            <p className="text-xs text-[#706259] font-medium">
              {studentInfo.department} • Year {studentInfo.batchYear}
            </p>
          </div>

          {/* Student Profile Avatar Badge */}
          <div className="w-11 h-11 rounded-2xl bg-[#FBF2DE] border border-[#B8860B]/30 flex items-center justify-center text-[#B8860B] shadow-sm font-bold text-xs">
            AK
          </div>
        </div>

        {/* Bound Student Identity Card */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EADBCE] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#2C221E]">{studentInfo.fullName}</span>
            <span className="font-mono text-[11px] font-bold text-[#B8860B] bg-[#FBF2DE] px-2 py-0.5 rounded-md border border-[#B8860B]/30">
              {studentInfo.studentId}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#706259]">
            <span className="font-mono">{studentInfo.phone}</span>
            <span className="text-[#1E7E53] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E7E53]" /> Bound Telegram Identity
            </span>
          </div>
        </div>

        {/* Status Alert Banner */}
        {submissionResult && (
          <div
            className={`p-4 rounded-2xl border transition-all animate-in fade-in-50 ${
              submissionResult.success
                ? "bg-[#EBF7EE] border-[#C2E8CA] text-[#1B5E20]"
                : "bg-[#FDF2F2] border-[#F8D7DA] text-[#721C24]"
            }`}
          >
            <div className="flex items-start gap-3">
              {submissionResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#C62828] shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-bold">{submissionResult.message}</p>
                {submissionResult.details && (
                  <p className="text-xs opacity-80 mt-0.5 font-medium">
                    {submissionResult.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3 Main Action Cards */}
        <div className="space-y-3">
          {/* Card 1: Scan Projector QR */}
          <div
            onClick={() => setActiveTab("qr")}
            className={`warm-card p-4 flex items-center justify-between cursor-pointer border transition-all ${
              activeTab === "qr" ? "border-[#B8860B] ring-2 ring-[#B8860B]/20" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-[#E8F3EE] text-[#1E7E53] flex items-center justify-center shrink-0 p-3">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-[#2C221E]">
                  Scan Projector Dynamic QR
                </h3>
                <p className="text-xs text-[#706259] font-medium">
                  Point camera at dynamic 15-second visual token
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#8C7A6F] shrink-0 ml-2" />
          </div>

          {/* Card 2: 6-Digit Rolling Code */}
          <div
            onClick={() => setActiveTab("passcode")}
            className={`warm-card p-4 flex items-center justify-between cursor-pointer border transition-all ${
              activeTab === "passcode" ? "border-[#B8860B] ring-2 ring-[#B8860B]/20" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-[#FBF2DE] text-[#B8860B] flex items-center justify-center shrink-0 p-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-[#2C221E]">
                  6-Digit Rolling Code
                </h3>
                <p className="text-xs text-[#706259] font-medium">
                  Power outage fallback mode (cycles every 20s)
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#8C7A6F] shrink-0 ml-2" />
          </div>

          {/* Card 3: Attendance History & Health (Click opens Course Breakdown Modal) */}
          <div
            onClick={() => setIsCourseModalOpen(true)}
            className="warm-card p-4 flex items-center justify-between cursor-pointer hover:border-[#B8860B] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-[#FAEAE9] text-[#B83833] flex items-center justify-center shrink-0 p-3">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-[#2C221E]">
                    Course Attendance Standing
                  </h3>
                  <span className="text-[10px] font-bold text-[#B8860B] bg-[#FBF2DE] px-1.5 py-0.2 rounded border border-[#B8860B]/30">
                    Click Details
                  </span>
                </div>
                <p className="text-xs text-[#706259] font-medium">
                  Overall: <span className="font-bold text-[#1E7E53]">{overallRate}%</span> • Tap to view all courses
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#8C7A6F] shrink-0 ml-2" />
          </div>
        </div>

        {/* Selected Mode Interactive Panel */}
        {activeTab === "qr" && (
          <div className="warm-card p-5 space-y-4 text-center border-t-2 border-[#B8860B]">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#2C221E] uppercase tracking-wider">
                Align Camera with Projector Screen
              </h4>
              <p className="text-xs text-[#706259]">
                Anti-proxy time-decaying visual cryptographic handshake
              </p>
            </div>

            {/* Viewfinder box */}
            <div className="relative aspect-square max-w-[200px] mx-auto rounded-3xl bg-[#F4EFE6] border-2 border-dashed border-[#B8860B]/40 p-4 flex flex-col items-center justify-center shadow-inner">
              <QrCode className="w-16 h-16 text-[#B8860B] animate-pulse" />
              <p className="text-[10px] font-bold text-[#706259] mt-2">
                Ready to capture token
              </p>
            </div>

            <button
              disabled={isSubmitting}
              onClick={handleSimulateScan}
              className="w-full py-3.5 px-4 btn-ochre text-xs font-bold rounded-2xl shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Cryptographically Verifying...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Scan Dynamic Token Now
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === "passcode" && (
          <div className="warm-card p-5 space-y-4 text-center border-t-2 border-[#B8860B]">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#2C221E] uppercase tracking-wider">
                Enter 6-Digit In-Class Rolling Code
              </h4>
              <p className="text-xs text-[#706259]">
                Displayed on the instructor device screen (rotates every 20s)
              </p>
            </div>

            {/* Code Slots (XXX-XXX) */}
            <div className="flex items-center justify-center gap-1.5 py-1">
              {[0, 1, 2].map((idx) => (
                <div
                  key={`slot1_${idx}`}
                  className={`w-10 h-12 rounded-xl flex items-center justify-center text-lg font-black transition-all border ${
                    passcode[idx]
                      ? "bg-[#FBF2DE] border-[#B8860B] text-[#B8860B]"
                      : "bg-[#F4EFE6] border-[#E5DCD0] text-[#A6978A]"
                  }`}
                >
                  {passcode[idx] || "•"}
                </div>
              ))}
              <span className="text-[#A6978A] font-bold text-lg">-</span>
              {[3, 4, 5].map((idx) => (
                <div
                  key={`slot2_${idx}`}
                  className={`w-10 h-12 rounded-xl flex items-center justify-center text-lg font-black transition-all border ${
                    passcode[idx]
                      ? "bg-[#FBF2DE] border-[#B8860B] text-[#B8860B]"
                      : "bg-[#F4EFE6] border-[#E5DCD0] text-[#A6978A]"
                  }`}
                >
                  {passcode[idx] || "•"}
                </div>
              ))}
            </div>

            {/* Tactile Keypad */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {["2", "3", "4", "5", "6", "7", "8", "9", "A", "K", "M", "P"].map((char) => (
                <button
                  key={char}
                  onClick={() => handleKeypadPress(char)}
                  className="py-2.5 bg-[#FFFFFF] hover:bg-[#FBF2DE] active:bg-[#B8860B] active:text-white rounded-xl text-sm font-bold text-[#2C221E] border border-[#EADBCE] shadow-sm transition-colors"
                >
                  {char}
                </button>
              ))}
              <button
                onClick={() => handleKeypadPress("X")}
                className="py-2.5 bg-[#FFFFFF] hover:bg-[#FBF2DE] active:bg-[#B8860B] active:text-white rounded-xl text-sm font-bold text-[#2C221E] border border-[#EADBCE]"
              >
                X
              </button>
              <button
                onClick={() => handleKeypadPress("Y")}
                className="py-2.5 bg-[#FFFFFF] hover:bg-[#FBF2DE] active:bg-[#B8860B] active:text-white rounded-xl text-sm font-bold text-[#2C221E] border border-[#EADBCE]"
              >
                Y
              </button>
              <button
                onClick={handleBackspace}
                className="py-2.5 bg-[#FAEAE9] hover:bg-[#F8D7DA] active:bg-[#B83833] active:text-white rounded-xl text-xs font-bold text-[#B83833] border border-[#F8D7DA] transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Bottom Parchment Notice */}
        <div className="p-4 rounded-2xl bg-[#EFE9DF] border border-[#E2D8CA] text-xs text-[#52443B] space-y-1">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">
              This session is cryptographically bound to your single verified Telegram device. Proxy check-in and remote attendance sharing are prohibited by university policy.
            </p>
          </div>
        </div>
      </div>

      {/* COURSE-BY-COURSE ATTENDANCE MODAL */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 bg-[#2C221E]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-50">
          <div className="bg-[#FFFFFF] border border-[#EADBCE] rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#2C221E] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#B8860B]" />
                  Curriculum Attendance Breakdown
                </h3>
                <p className="text-xs text-[#706259]">
                  Year {studentInfo.batchYear} • Semester 1 Course Standings
                </p>
              </div>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1 rounded-xl text-[#706259] hover:text-[#2C221E] hover:bg-[#F4EFE6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Courses List */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {courseStandings.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#706259]">
                  Loading course breakdown...
                </div>
              ) : (
                courseStandings.map((c) => (
                  <div
                    key={c.courseId}
                    className="p-3.5 rounded-2xl border border-[#EADBCE] bg-[#F9F6F0] space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-[#B8860B] bg-[#FBF2DE] px-2 py-0.5 rounded-md border border-[#B8860B]/30">
                          {c.courseCode}
                        </span>
                        <h4 className="text-xs font-bold text-[#2C221E] mt-1">
                          {c.courseTitle}
                        </h4>
                      </div>
                      <span
                        className={`text-sm font-black ${
                          c.isGoodStanding ? "text-[#1E7E53]" : "text-[#B83833]"
                        }`}
                      >
                        {c.attendanceRate}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-[#EADBCE]/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          c.isGoodStanding ? "bg-[#1E7E53]" : "bg-[#B83833]"
                        }`}
                        style={{ width: `${c.attendanceRate}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#706259]">Status Standing:</span>
                      {c.isGoodStanding ? (
                        <span className="font-bold text-[#1E7E53] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Good Standing
                        </span>
                      ) : (
                        <span className="font-bold text-[#B83833] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Low - Action Needed
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-[#EADBCE] flex items-center justify-between text-xs">
              <span className="font-bold text-[#706259]">Cumulative Standing:</span>
              <span className="font-black text-[#1E7E53]">{overallRate}% Overall</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="pt-6 pb-2 text-center text-xs text-[#8C7A6F] font-medium">
        Injibara University • Department of Software Engineering
      </footer>
    </main>
  );
}
