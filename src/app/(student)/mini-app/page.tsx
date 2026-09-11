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
  User,
  GraduationCap,
  Calendar,
  Layers,
  ChevronRight,
  FileText,
  X,
  Camera,
  RotateCcw,
  Smartphone,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            id?: number;
            first_name?: string;
            username?: string;
          };
        };
        showScanQrPopup?: (
          params: { text?: string },
          callback: (text: string) => boolean | void
        ) => void;
        closeScanQrPopup?: () => void;
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

interface StudentProfile {
  id: string;
  fullName: string;
  studentId: string;
  phoneNumber: string;
  batchYear: number;
  department: string;
  institution: string;
  isBound?: boolean;
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
  // Verification / Binding State
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [studentInfo, setStudentInfo] = useState<StudentProfile | null>(null);

  // First-time Form Input State
  const [inputId, setInputId] = useState("");
  const [inputPhone, setInputPhone] = useState("+2519");
  const [isVerifyingIdentity, setIsVerifyingIdentity] = useState(false);
  const [identityError, setIdentityError] = useState<string | null>(null);

  // Active Attendance Mode (Defaults to Camera QR Scanner once verified!)
  const [activeTab, setActiveTab] = useState<"qr" | "passcode">("qr");
  const [passcode, setPasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  // Camera Live Scanner State
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Course Breakdown Modal State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseStandings, setCourseStandings] = useState<CourseAttendanceStanding[]>([]);
  const [overallRate, setOverallRate] = useState(91);

  const simulatedSessionId = "sess_active_1";

  // Check persistent binding on initial load
  useEffect(() => {
    // Expand Telegram WebApp if inside Telegram
    if (typeof window !== "undefined" && window.Telegram?.WebApp?.expand) {
      window.Telegram.WebApp.expand();
    }

    // Check localStorage for persisted binding
    const stored = localStorage.getItem("injibara_student_bound");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setStudentInfo(parsed);
        setIsVerified(true);
        return;
      } catch {
        localStorage.removeItem("injibara_student_bound");
      }
    }

    // Default fallback to unverified state (prompts for ID & phone)
    setIsVerified(false);
  }, []);

  // Fetch course attendance standing once verified
  useEffect(() => {
    if (!studentInfo?.studentId) return;

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
  }, [studentInfo?.studentId]);

  const triggerHaptic = (type: "success" | "error" | "light") => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
      if (type === "success" || type === "error") {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    }
  };

  // First-time verification submit handler
  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputId.trim() || !inputPhone.trim()) return;

    setIsVerifyingIdentity(true);
    setIdentityError(null);

    try {
      const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

      const res = await fetch("/api/student/verify-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: inputId.trim(),
          phoneNumber: inputPhone.trim(),
          telegramId: telegramUser?.id?.toString() || null,
          telegramUsername: telegramUser?.username || null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.student) {
        triggerHaptic("success");
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        // Persist permanently so the student never has to enter this again
        localStorage.setItem("injibara_student_bound", JSON.stringify(data.student));
        setStudentInfo(data.student);
        setIsVerified(true);
      } else {
        triggerHaptic("error");
        setIdentityError(
          data.error ||
            "Student identity not found in Department of Software Engineering whitelist. Please check your ID and phone number."
        );
      }
    } catch {
      triggerHaptic("error");
      setIdentityError("Network error occurred during identity verification.");
    } finally {
      setIsVerifyingIdentity(false);
    }
  };

  // Unbind / Switch student account (for testing or device reset)
  const handleUnbindStudent = () => {
    if (confirm("Reset device binding? You will need to re-verify with your Student ID.")) {
      localStorage.removeItem("injibara_student_bound");
      setStudentInfo(null);
      setIsVerified(false);
      setSubmissionResult(null);
      stopLiveCamera();
    }
  };

  // Quick fill helper for demonstration
  const handleQuickFill = (id: string, phone: string) => {
    setInputId(id);
    setInputPhone(phone);
  };

  // 6-Digit Keypad handlers
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
          studentIdOverride: studentInfo?.id || "stu_301",
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

  // Start live device camera scanner
  const startLiveCamera = async () => {
    // If inside Telegram WebApp, try native QR scanner popup first
    if (window.Telegram?.WebApp?.showScanQrPopup) {
      window.Telegram.WebApp.showScanQrPopup(
        { text: "Point camera at the Instructor Screen QR code" },
        (qrText) => {
          if (qrText) {
            handleVerifyQRToken(qrText);
            if (window.Telegram?.WebApp?.closeScanQrPopup) {
              window.Telegram.WebApp.closeScanQrPopup();
            }
            return true;
          }
          return false;
        }
      );
      return;
    }

    // Fallback: in-browser camera stream
    try {
      setIsLiveCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera access failed, falling back to simulated scan:", err);
      handleSimulateScan();
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  // Verify QR token string
  const handleVerifyQRToken = async (tokenPayload: string) => {
    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const res = await fetch("/api/sessions/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: simulatedSessionId,
          tokenType: "DYNAMIC_QR",
          payload: tokenPayload,
          nonce: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          studentIdOverride: studentInfo?.id || "stu_301",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        triggerHaptic("success");
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setSubmissionResult({
          success: true,
          message: "Attendance Confirmed Successfully!",
          details: `SEng3112 • ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        });
        stopLiveCamera();
      } else {
        triggerHaptic("error");
        setSubmissionResult({
          success: false,
          message: data.message || "Dynamic QR expired. Scan the newest token on the screen.",
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

  // Instant Simulate Scan (reads newest live stream seed from active session)
  const handleSimulateScan = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const streamRes = await fetch(`/api/sessions/${simulatedSessionId}/stream`);
      const streamData = await streamRes.json();
      const seed = streamData.qrSeed || "a9f8b2c4e1d034ab";
      await handleVerifyQRToken(seed);
    } catch {
      triggerHaptic("error");
      setSubmissionResult({
        success: false,
        message: "Connection error occurred during verification.",
      });
      setIsSubmitting(false);
    }
  };

  // Initial loading spinner while checking storage
  if (isVerified === null) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-3 border-[#B8860B] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#706259]">Connecting to Telegram Student Portal...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 1: FIRST-TIME STUDENT BINDING (የመጀመሪያ ጊዜ ሲገቡ የሚሞላ)
  // -------------------------------------------------------------
  if (!isVerified) {
    return (
      <main className="min-h-screen max-w-md mx-auto px-5 py-8 flex flex-col justify-between bg-[#F9F6F0] text-[#2C221E]">
        <div className="space-y-6">
          {/* Institutional Header */}
          <div className="text-center space-y-2 pt-2">
            <div className="w-16 h-16 rounded-3xl bg-[#FBF2DE] border border-[#B8860B]/30 text-[#B8860B] flex items-center justify-center mx-auto shadow-sm">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FBF2DE] text-[#B8860B] border border-[#B8860B]/30">
                Injibara University
              </span>
              <h1 className="text-xl font-black text-[#2C221E] tracking-tight mt-1.5">
                Department of Software Engineering
              </h1>
              <p className="text-xs text-[#706259] font-medium">
                Telegram Student Identity & Device Verification
              </p>
            </div>
          </div>

          {/* First-Time Instruction Card */}
          <div className="warm-card p-5 space-y-4 border-t-4 border-[#B8860B]">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-[#2C221E] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#B8860B]" />
                One-Time Student Account Verification
              </h2>
              <p className="text-xs text-[#706259] leading-relaxed">
                Enter your <strong>Student ID</strong> and registered <strong>Phone Number</strong> once. After verification, this Telegram account will be permanently bound to your academic profile.
              </p>
            </div>

            {identityError && (
              <div className="p-3.5 rounded-xl bg-[#FAEAE9] border border-[#F8D7DA] text-[#B83833] text-xs font-semibold flex items-start gap-2 animate-in fade-in-50">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{identityError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyIdentity} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#706259]">Student ID (የተማሪ መታወቂያ)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UGR/1401/14"
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3.5 py-2.5 text-xs text-[#2C221E] font-mono uppercase focus:outline-none focus:border-[#B8860B] shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#706259]">Telegram-Linked Phone (ስልክ ቁጥር)</label>
                <input
                  type="text"
                  required
                  placeholder="+251911000001"
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3.5 py-2.5 text-xs text-[#2C221E] font-mono focus:outline-none focus:border-[#B8860B] shadow-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifyingIdentity}
                className="w-full py-3 btn-ochre text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {isVerifyingIdentity ? "Verifying with Registry..." : "Verify & Bind Telegram Account"}
              </button>
            </form>

            {/* Quick-Fill Whitelisted Demo Students */}
            <div className="pt-2 border-t border-[#EADBCE] space-y-1.5">
              <span className="text-[11px] font-bold text-[#706259]">Quick Fill Demo Student:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: "Abebe", id: "UGR/1401/14", phone: "+251922110001" },
                  { name: "Chaltu", id: "UGR/1402/14", phone: "+251922110002" },
                  { name: "Dawit", id: "UGR/1403/14", phone: "+251922110003" },
                ].map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleQuickFill(demo.id, demo.phone)}
                    className="px-2.5 py-1 text-[11px] bg-[#FBF2DE] hover:bg-[#B8860B] hover:text-white text-[#B8860B] font-bold rounded-lg border border-[#B8860B]/30 transition-colors"
                  >
                    {demo.name} ({demo.id})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-center text-[#706259] py-4">
          Injibara University • Department of Software Engineering
        </p>
      </main>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: VERIFIED ATTENDANCE DECK (አንዴ ከበራ በቋሚነት ፎቶ/ስካነር የሚያነሳ)
  // -------------------------------------------------------------
  return (
    <main className="min-h-screen max-w-md mx-auto px-5 py-6 flex flex-col justify-between bg-[#F9F6F0] text-[#2C221E]">
      <div className="space-y-5">
        {/* Verified Student Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#FBF2DE] text-[#B8860B] border border-[#B8860B]/30">
                Injibara University
              </span>
              <span className="text-[11px] text-[#706259] font-medium">Software Engineering</span>
            </div>
            <h1 className="text-xl font-black text-[#2C221E] tracking-tight">
              Class Attendance Scanner
            </h1>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-[#FBF2DE] border border-[#B8860B]/30 text-[#B8860B] flex items-center justify-center font-bold text-xs shadow-xs">
            {studentInfo?.fullName ? studentInfo.fullName[0] : "S"}
          </div>
        </div>

        {/* Bound Student Identity Card (Permanent) */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EADBCE] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#2C221E]">{studentInfo?.fullName}</span>
              <span className="text-[10px] font-bold bg-[#E8F3EE] text-[#1E7E53] px-2 py-0.5 rounded-md border border-[#C2E8CA]">
                Verified
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold text-[#B8860B] bg-[#FBF2DE] px-2 py-0.5 rounded-md border border-[#B8860B]/30">
              {studentInfo?.studentId}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#706259]">
            <span className="font-mono">{studentInfo?.phoneNumber} • Year {studentInfo?.batchYear}</span>
            <button
              onClick={handleUnbindStudent}
              className="text-[10px] text-[#706259] hover:text-[#B83833] underline"
              title="Reset binding if needed"
            >
              Switch Account
            </button>
          </div>
        </div>

        {/* Status Confirmation Banner */}
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

        {/* PRIMARY CAMERA SCANNER VIEW (ፎቶ እንዲያነሳ የሚመጣው) */}
        {activeTab === "qr" && (
          <div className="warm-card p-5 space-y-4 text-center border-t-4 border-[#B8860B]">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-[#2C221E] flex items-center justify-center gap-2">
                <Camera className="w-4 h-4 text-[#B8860B]" />
                Scan Instructor Screen QR Code
              </h3>
              <p className="text-xs text-[#706259]">
                Point camera directly at the dynamic QR code projected in class
              </p>
            </div>

            {/* Live Camera Viewport or Scanner Target */}
            <div className="relative w-full aspect-square max-w-[260px] mx-auto rounded-3xl bg-[#2C221E] overflow-hidden flex items-center justify-center border-2 border-[#B8860B]/50 shadow-inner">
              {isLiveCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#FBF2DE]/10 text-[#B8860B] border border-[#B8860B]/40 flex items-center justify-center mx-auto animate-pulse">
                    <QrCode className="w-7 h-7" />
                  </div>
                  <p className="text-xs text-[#F4EFE6] font-medium leading-relaxed">
                    Camera viewfinder ready. Tap below to scan the active projector screen.
                  </p>
                </div>
              )}

              {/* Scanning Crosshair Overlay */}
              <div className="absolute inset-4 border border-[#B8860B]/40 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-full h-0.5 bg-[#B8860B] shadow-[0_0_10px_#B8860B] animate-pulse" />
              </div>
            </div>

            {/* Camera Controls */}
            <div className="space-y-2 pt-1">
              <button
                onClick={startLiveCamera}
                disabled={isSubmitting}
                className="w-full py-3 btn-ochre text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                {isLiveCameraActive ? "Scanning..." : "Open Camera Scanner (ፎቶ አንሳ)"}
              </button>

              {/* Instant Test QR Scan for rapid verification */}
              <button
                onClick={handleSimulateScan}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#FFFFFF] hover:bg-[#FBF2DE] border border-[#EADBCE] text-[#706259] hover:text-[#2C221E] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>Instant Scan Active Token (Simulate)</span>
              </button>
            </div>
          </div>
        )}

        {/* FALLBACK MODE: 6-DIGIT ROLLING CODE */}
        {activeTab === "passcode" && (
          <div className="warm-card p-5 space-y-4 border-t-4 border-[#B8860B]">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-[#2C221E] flex items-center justify-center gap-2">
                <KeyRound className="w-4 h-4 text-[#B8860B]" />
                Enter 6-Digit Rolling Code
              </h3>
              <p className="text-xs text-[#706259]">
                Use during projector or power outages (cycles every 20s)
              </p>
            </div>

            {/* 6-Digit Input Boxes */}
            <div className="flex justify-center gap-2 py-2">
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const char = passcode[index] || "";
                return (
                  <div
                    key={index}
                    className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-black font-mono transition-all ${
                      char
                        ? "border-[#B8860B] bg-[#FBF2DE] text-[#B8860B]"
                        : "border-[#EADBCE] bg-[#FFFFFF] text-[#2C221E]"
                    }`}
                  >
                    {char || "•"}
                  </div>
                );
              })}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-1 max-w-[280px] mx-auto">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map(
                (key, i) => {
                  if (key === "") return <div key={i} />;
                  if (key === "del") {
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={handleBackspace}
                        className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#EADBCE] hover:bg-[#F9F6F0] text-[#706259] font-bold text-xs flex items-center justify-center shadow-xs active:scale-95 transition-all"
                      >
                        Delete
                      </button>
                    );
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleKeypadPress(key)}
                      className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#EADBCE] hover:bg-[#FBF2DE] text-[#2C221E] font-black text-sm shadow-xs active:scale-95 transition-all"
                    >
                      {key}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* Switch Between Camera QR & Rolling Code */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setActiveTab("qr");
              stopLiveCamera();
            }}
            className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === "qr"
                ? "bg-[#B8860B] text-white shadow-xs"
                : "bg-[#FFFFFF] border-[#EADBCE] text-[#706259] hover:bg-[#FBF2DE]"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera QR Scanner</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("passcode");
              stopLiveCamera();
            }}
            className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === "passcode"
                ? "bg-[#B8860B] text-white shadow-xs"
                : "bg-[#FFFFFF] border-[#EADBCE] text-[#706259] hover:bg-[#FBF2DE]"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>6-Digit Code</span>
          </button>
        </div>

        {/* Course Attendance Standing Card */}
        <div
          onClick={() => setIsCourseModalOpen(true)}
          className="warm-card p-4 flex items-center justify-between cursor-pointer hover:border-[#B8860B] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FBF2DE] text-[#B8860B] border border-[#B8860B]/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-[#2C221E]">
                Course Attendance Breakdown
              </h4>
              <p className="text-[11px] text-[#706259]">
                Overall Standing: <strong className="text-[#1E7E53]">{overallRate}% Good Standing</strong>
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#706259]" />
        </div>
      </div>

      {/* Course Standing Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 bg-[#2C221E]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-50">
          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EADBCE] shadow-2xl max-w-sm w-full space-y-4">
            <div className="flex items-start justify-between border-b border-[#EADBCE] pb-3">
              <div>
                <h3 className="text-sm font-black text-[#2C221E]">
                  Course Attendance Standing
                </h3>
                <p className="text-xs text-[#706259]">
                  {studentInfo?.fullName} • Year {studentInfo?.batchYear}
                </p>
              </div>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1 rounded-xl text-[#706259] hover:bg-[#F4EFE6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {courseStandings.map((c) => (
                <div
                  key={c.courseId}
                  className="p-3 rounded-2xl bg-[#F9F6F0] border border-[#EADBCE] space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2C221E]">{c.courseCode}</span>
                    <span
                      className={`font-mono font-black ${
                        c.isGoodStanding ? "text-[#1E7E53]" : "text-[#B83833]"
                      }`}
                    >
                      {c.attendanceRate}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#706259] truncate">{c.courseTitle}</p>
                  <div className="w-full h-1.5 bg-[#EADBCE] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        c.isGoodStanding ? "bg-[#1E7E53]" : "bg-[#B83833]"
                      }`}
                      style={{ width: `${c.attendanceRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsCourseModalOpen(false)}
              className="w-full py-2.5 btn-ochre text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <p className="text-[11px] text-center text-[#706259] py-3">
        Injibara University • Department of Software Engineering
      </p>
    </main>
  );
}
