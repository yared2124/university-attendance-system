"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import confetti from "canvas-confetti";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        HapticFeedback?: {
          impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
          notificationOccurred: (type: "error" | "success" | "warning") => void;
        };
        themeParams?: Record<string, string>;
      };
    };
  }
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

  // Student Profile state
  const [studentInfo, setStudentInfo] = useState({
    fullName: "Abebe Kebede",
    studentId: "UGR/1401/14",
    batchYear: 3,
    department: "Software Engineering",
    isHardwareLocked: true,
  });

  const [simulatedSessionId, setSimulatedSessionId] = useState("sess_active_1");
  const [mockSeedInput, setMockSeedInput] = useState("");

  // Initialize Telegram WebApp
  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();

      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (tgUser) {
        setStudentInfo((prev) => ({
          ...prev,
          fullName: `${tgUser.first_name} ${tgUser.last_name || ""}`.trim(),
        }));
      }
    }
  }, []);

  // Trigger haptic feedback if available in Telegram
  const triggerHaptic = (type: "success" | "error" | "light") => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
      if (type === "success" || type === "error") {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    }
  };

  // Handle Passcode input
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

  // Submit Rolling Passcode
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
          initData: window.Telegram?.WebApp?.initData || "",
          studentIdOverride: "stu_301",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        triggerHaptic("success");
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setSubmissionResult({
          success: true,
          message: "Attendance Confirmed!",
          details: `Recorded at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`,
        });
        setPasscode("");
      } else {
        triggerHaptic("error");
        setSubmissionResult({
          success: false,
          message: data.message || "Invalid or expired passcode.",
        });
      }
    } catch {
      triggerHaptic("error");
      setSubmissionResult({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Dynamic QR Scan
  const submitQRCheckIn = async (seed: string) => {
    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const res = await fetch("/api/sessions/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: simulatedSessionId,
          tokenType: "DYNAMIC_QR",
          payload: seed,
          nonce: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          initData: window.Telegram?.WebApp?.initData || "",
          studentIdOverride: "stu_301",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        triggerHaptic("success");
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setSubmissionResult({
          success: true,
          message: "QR Code Verified Successfully!",
          details: `Marked PRESENT in SEng3112 at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        });
      } else {
        triggerHaptic("error");
        setSubmissionResult({
          success: false,
          message: data.message || "QR Code expired or already scanned.",
        });
      }
    } catch {
      triggerHaptic("error");
      setSubmissionResult({
        success: false,
        message: "Failed to connect to verification server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick simulated scan helper for desktop testing
  const handleSimulateScan = async () => {
    // Fetch current active seed from session stream
    try {
      const res = await fetch(`/api/sessions/${simulatedSessionId}/stream`);
      const data = await res.json();
      if (data.qrSeed) {
        submitQRCheckIn(data.qrSeed);
      } else {
        submitQRCheckIn(mockSeedInput || "a9f8b2c4e1d034ab");
      }
    } catch {
      submitQRCheckIn(mockSeedInput || "a9f8b2c4e1d034ab");
    }
  };

  return (
    <main className="min-h-screen max-w-md mx-auto p-4 flex flex-col justify-between pb-8">
      {/* Top Navigation & Student Header */}
      <div className="space-y-4">
        <header className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                {studentInfo.fullName}
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                {studentInfo.studentId} • Year {studentInfo.batchYear} SE
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Device Locked
          </span>
        </header>

        {/* Verification Mode Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("qr");
              setSubmissionResult(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "qr"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <QrCode className="w-4 h-4" />
            Scan Projector QR
          </button>
          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("passcode");
              setSubmissionResult(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "passcode"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            6-Digit Rolling Code
          </button>
        </div>

        {/* Status Alert Banner */}
        {submissionResult && (
          <div
            className={`p-4 rounded-2xl border transition-all animate-in fade-in-50 slide-in-from-top-2 ${
              submissionResult.success
                ? "bg-emerald-950/50 border-emerald-500/30 text-emerald-300"
                : "bg-rose-950/50 border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-start gap-3">
              {submissionResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-semibold">{submissionResult.message}</p>
                {submissionResult.details && (
                  <p className="text-xs text-slate-300/80 mt-0.5 font-medium">
                    {submissionResult.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: DYNAMIC QR SCANNER VIEW */}
        {activeTab === "qr" && (
          <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-sm font-bold text-slate-200">Point Camera at Projector</h2>
              <p className="text-xs text-slate-400">
                The QR code rotates every 15s to eliminate proxy screenshots.
              </p>
            </div>

            {/* Scanner Viewfinder Box */}
            <div className="relative aspect-square max-w-[260px] mx-auto rounded-3xl bg-slate-950 border-2 border-dashed border-blue-500/40 p-3 overflow-hidden flex flex-col items-center justify-center shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-blue-500/10 pointer-events-none" />

              {/* Laser Animation Bar */}
              <div className="absolute left-3 right-3 h-0.5 bg-sky-400 shadow-[0_0_12px_#38bdf8] animate-scanner-laser pointer-events-none" />

              {/* Viewfinder Corner Accents */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-sky-400 rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-sky-400 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-sky-400 rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-sky-400 rounded-br-lg" />

              <div className="text-center space-y-2 z-10">
                <QrCode className="w-16 h-16 text-blue-400/80 mx-auto animate-pulse" />
                <p className="text-[11px] font-semibold text-slate-400">
                  Ready to Capture Dynamic Token
                </p>
              </div>
            </div>

            {/* In-App One-Click Scan Simulator (Desktop/Preview Compatible) */}
            <div className="space-y-2 pt-1">
              <button
                disabled={isSubmitting}
                onClick={handleSimulateScan}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 active:scale-[0.98] text-white font-semibold text-xs rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Cryptographically Verifying...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-sky-200" />
                    Scan Dynamic Token Now
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-slate-500">
                Secured by Upstash Redis volatile nonces & Telegram Hardware Binding
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: ROLLING PASSCODE (CLASSROOM OUTAGE MODE) */}
        {activeTab === "passcode" && (
          <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-sm font-bold text-slate-200">
                Enter Active 6-Digit Passcode
              </h2>
              <p className="text-xs text-slate-400">
                Displayed on the instructor&apos;s phone during classroom outages.
              </p>
            </div>

            {/* Passcode Slot Display (XXX-XXX format) */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[0, 1, 2].map((idx) => (
                <div
                  key={`slot1_${idx}`}
                  className={`w-11 h-13 rounded-xl flex items-center justify-center text-lg font-black tracking-wider transition-all border ${
                    passcode[idx]
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-sm shadow-blue-500/30"
                      : "bg-slate-900 border-slate-800 text-slate-600"
                  }`}
                >
                  {passcode[idx] || "•"}
                </div>
              ))}
              <span className="text-slate-600 font-bold text-lg">-</span>
              {[3, 4, 5].map((idx) => (
                <div
                  key={`slot2_${idx}`}
                  className={`w-11 h-13 rounded-xl flex items-center justify-center text-lg font-black tracking-wider transition-all border ${
                    passcode[idx]
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-sm shadow-blue-500/30"
                      : "bg-slate-900 border-slate-800 text-slate-600"
                  }`}
                >
                  {passcode[idx] || "•"}
                </div>
              ))}
            </div>

            {/* Tactile Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {["2", "3", "4", "5", "6", "7", "8", "9", "A", "K", "M", "P"].map((char) => (
                <button
                  key={char}
                  onClick={() => handleKeypadPress(char)}
                  className="py-3 bg-slate-900/90 hover:bg-slate-800 active:bg-blue-600 active:text-white rounded-xl text-sm font-bold text-slate-200 border border-slate-800 transition-colors shadow-sm"
                >
                  {char}
                </button>
              ))}
              <button
                onClick={() => handleKeypadPress("X")}
                className="py-3 bg-slate-900/90 hover:bg-slate-800 active:bg-blue-600 active:text-white rounded-xl text-sm font-bold text-slate-200 border border-slate-800"
              >
                X
              </button>
              <button
                onClick={() => handleKeypadPress("Y")}
                className="py-3 bg-slate-900/90 hover:bg-slate-800 active:bg-blue-600 active:text-white rounded-xl text-sm font-bold text-slate-200 border border-slate-800"
              >
                Y
              </button>
              <button
                onClick={handleBackspace}
                className="py-3 bg-rose-950/40 hover:bg-rose-900/50 active:bg-rose-600 rounded-xl text-xs font-bold text-rose-400 border border-rose-900/40 transition-colors flex items-center justify-center"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Cycles every 20 seconds
              </span>
              <span className="text-rose-400">Max 3 attempts</span>
            </div>
          </div>
        )}

        {/* Student Attendance Stats Card */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Semester Attendance Health</span>
            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              92% (Healthy)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 rounded-full w-[92%]" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-800/60">
              <p className="text-[10px] text-slate-400 font-medium">Present</p>
              <p className="text-sm font-bold text-emerald-400">12</p>
            </div>
            <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-800/60">
              <p className="text-[10px] text-slate-400 font-medium">Absent</p>
              <p className="text-sm font-bold text-rose-400">1</p>
            </div>
            <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-800/60">
              <p className="text-[10px] text-slate-400 font-medium">Excused</p>
              <p className="text-sm font-bold text-amber-400">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Department Brand */}
      <footer className="pt-4 text-center">
        <p className="text-[11px] text-slate-500 font-medium">
          AAU Department of Software Engineering • Telegram TMA v2.0
        </p>
      </footer>
    </main>
  );
}
