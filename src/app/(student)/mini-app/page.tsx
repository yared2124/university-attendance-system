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

export default function StudentMiniApp() {
  const [language, setLanguage] = useState<"am" | "en">("am");
  const [activeTab, setActiveTab] = useState<"qr" | "passcode">("qr");
  const [passcode, setPasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const [studentInfo, setStudentInfo] = useState({
    fullName: "አበበ ከበደ",
    studentId: "UGR/1401/14",
    batchYear: 3,
    department: "የሶፍትዌር ኢንጂነሪንግ ዲፓርትመንት",
    phone: "+251922110001",
  });

  const simulatedSessionId = "sess_active_1";

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
          message: language === "am" ? "አቴንዳንስዎ በተሳካ ሁኔታ ተመዝግቧል!" : "Attendance Successfully Confirmed!",
          details: `SEng3112 • ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        });
        setPasscode("");
      } else {
        triggerHaptic("error");
        setSubmissionResult({
          success: false,
          message: data.message || (language === "am" ? "የተሳሳተ ወይም ያለፈበት ኮድ ነው" : "Invalid or expired passcode"),
        });
      }
    } catch {
      triggerHaptic("error");
      setSubmissionResult({
        success: false,
        message: language === "am" ? "የኔትወርክ ስህተት። እባክዎ በድጋሚ ይሞክሩ።" : "Network error. Please try again.",
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
          message: language === "am" ? "የ QR ኮድ ማረጋገጫው ተሳክቷል!" : "QR Code Verified Successfully!",
          details: `SEng3112 • ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        });
      } else {
        triggerHaptic("error");
        setSubmissionResult({
          success: false,
          message: data.message || (language === "am" ? "የ QR ኮዱ ጊዜው አልፎበታል" : "QR Token Expired"),
        });
      }
    } catch {
      triggerHaptic("error");
      setSubmissionResult({
        success: false,
        message: language === "am" ? "የግንኙነት ስህተት አጋጥሟል" : "Connection Error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen max-w-md mx-auto px-5 py-6 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Top Header matching reference image exactly */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#2C221E] tracking-tight font-ethiopic">
              {language === "am" ? "የአቴንዳንስ መከታተያ" : "Attendance Tracker"}
            </h1>
            <p className="text-xs text-[#706259] font-medium font-ethiopic">
              {language === "am" ? "ለሶፍትዌር ኢንጂነሪንግ ዲፓርትመንት ተማሪዎች" : "Department of Software Engineering"}
            </p>
          </div>

          {/* Settings Circle Button matching reference */}
          <div className="w-12 h-12 rounded-full bg-[#E5DCD0] flex items-center justify-center text-[#5A4B41] shadow-sm">
            <Settings className="w-5 h-5" />
          </div>
        </div>

        {/* Language Switcher Pill matching reference */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-bold text-[#2C221E] font-ethiopic">
            {language === "am" ? "ቋንቋ" : "Language"}
          </span>

          <div className="flex items-center bg-[#ECE4D8] rounded-xl p-1 gap-1">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                language === "en"
                  ? "bg-[#B8860B] text-white shadow-sm"
                  : "text-[#706259] hover:text-[#2C221E]"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("am")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all font-ethiopic ${
                language === "am"
                  ? "bg-[#B8860B] text-white shadow-sm"
                  : "text-[#706259] hover:text-[#2C221E]"
              }`}
            >
              አማ
            </button>
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
                <p className="text-sm font-bold font-ethiopic">{submissionResult.message}</p>
                {submissionResult.details && (
                  <p className="text-xs opacity-80 mt-0.5 font-medium">
                    {submissionResult.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3 Main Action Cards matching reference screenshot */}
        <div className="space-y-3.5">
          {/* Card 1: Scan Projector QR */}
          <div
            onClick={() => setActiveTab("qr")}
            className={`warm-card p-4 flex items-center justify-between cursor-pointer border ${
              activeTab === "qr" ? "border-[#B8860B] ring-2 ring-[#B8860B]/20" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Green Icon Box like reference */}
              <div className="w-14 h-14 rounded-2xl bg-[#E8F3EE] text-[#1E7E53] flex items-center justify-center shrink-0">
                <QrCode className="w-7 h-7" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-[#2C221E] font-ethiopic">
                  {language === "am" ? "የፕሮጀክተር QR ስካን" : "Scan Projector QR"}
                </h3>
                <p className="text-xs text-[#706259] font-medium font-ethiopic">
                  {language === "am" ? "በየ 15 ሰከንዱ የሚቀያየረውን ኮድ በካሜራ ስካን ያድርጉ" : "Dynamic time-decaying 15s visual token"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#8C7A6F] shrink-0 ml-2" />
          </div>

          {/* Card 2: 6-Digit Rolling Code */}
          <div
            onClick={() => setActiveTab("passcode")}
            className={`warm-card p-4 flex items-center justify-between cursor-pointer border ${
              activeTab === "passcode" ? "border-[#B8860B] ring-2 ring-[#B8860B]/20" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Golden Icon Box like reference */}
              <div className="w-14 h-14 rounded-2xl bg-[#FBF2DE] text-[#B8860B] flex items-center justify-center shrink-0">
                <KeyRound className="w-7 h-7" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-[#2C221E] font-ethiopic">
                  {language === "am" ? "ባለ 6-ፊደል Rolling Code" : "6-Digit Rolling Code"}
                </h3>
                <p className="text-xs text-[#706259] font-medium font-ethiopic">
                  {language === "am" ? "መብራት ሲጠፋ በመምህሩ ስልክ የሚታየውን ኮድ ያስገቡ" : "Power outage fallback mode (cycles every 20s)"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#8C7A6F] shrink-0 ml-2" />
          </div>

          {/* Card 3: Attendance History & Health */}
          <div className="warm-card p-4 flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-4">
              {/* Crimson/Red Icon Box like reference */}
              <div className="w-14 h-14 rounded-2xl bg-[#FAEAE9] text-[#B83833] flex items-center justify-center shrink-0">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-[#2C221E] font-ethiopic">
                  {language === "am" ? "የተቀመጡ ሪፖርቶችና ጤንነት" : "Attendance Health & History"}
                </h3>
                <p className="text-xs text-[#706259] font-medium font-ethiopic">
                  {language === "am" ? "የዚህ ሴሚስተር አጠቃላይ ምጣኔ: 92% (በጥሩ ደረጃ)" : "Semester Rate: 92% (Good Standing)"}
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
              <h4 className="text-xs font-bold text-[#2C221E] uppercase tracking-wider font-ethiopic">
                {language === "am" ? "ካሜራውን ወደ ፕሮጀክተሩ ያነጣጥሩ" : "Point Camera at Projector"}
              </h4>
              <p className="text-xs text-[#706259] font-ethiopic">
                {language === "am" ? "ፎቶ አንስቶ ለሌላ ሰው መላክ ፈጽሞ አይሰራም" : "Time-decaying anti-proxy token"}
              </p>
            </div>

            {/* Viewfinder box with soft parchment feel */}
            <div className="relative aspect-square max-w-[210px] mx-auto rounded-3xl bg-[#F4EFE6] border-2 border-dashed border-[#B8860B]/40 p-4 flex flex-col items-center justify-center shadow-inner">
              <QrCode className="w-16 h-16 text-[#B8860B] animate-pulse" />
              <p className="text-[10px] font-bold text-[#706259] mt-2 font-ethiopic">
                {language === "am" ? "ማረጋገጫ ለመቀበል ዝግጁ ነው" : "Ready to capture token"}
              </p>
            </div>

            <button
              disabled={isSubmitting}
              onClick={handleSimulateScan}
              className="w-full py-3.5 px-4 btn-ochre text-xs font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 font-ethiopic"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {language === "am" ? "እያረጋገጠ ነው..." : "Cryptographically Verifying..."}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {language === "am" ? "አሁን ስካን አድርግ" : "Scan Dynamic Token Now"}
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === "passcode" && (
          <div className="warm-card p-5 space-y-4 text-center border-t-2 border-[#B8860B]">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#2C221E] uppercase tracking-wider font-ethiopic">
                {language === "am" ? "የክፍሉን ባለ 6-ፊደል ኮድ ያስገቡ" : "Enter 6-Digit Rolling Code"}
              </h4>
              <p className="text-xs text-[#706259] font-ethiopic">
                {language === "am" ? "በየ 20 ሰከንዱ በመምህሩ ስልክ ይቀያየራል" : "Instructor classroom code (cycles every 20s)"}
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
                {language === "am" ? "አጥፋ" : "Clear"}
              </button>
            </div>
          </div>
        )}

        {/* Bottom Eye Icon matching reference screenshot */}
        <div className="flex items-center justify-center py-1">
          <div className="w-10 h-10 rounded-full bg-[#FBF2DE] text-[#B8860B] border border-[#EADBCE] flex items-center justify-center shadow-sm">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        {/* Bottom Parchment Info Box matching reference */}
        <div className="p-4 rounded-2xl bg-[#EFE9DF] border border-[#E2D8CA] text-xs text-[#52443B] space-y-1">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed font-ethiopic">
              {language === "am"
                ? "ይህ መተግበሪያ ከቴሌግራም መለያዎ ጋር በቋሚነት የተቆራኘ ነው። አቴንዳንስዎ በዲፓርትመንቱ ቋሚ ሪከርድነት በቀጥታ ይመዘገባል!"
                : "This app is cryptographically bound to your single Telegram account. Proxy attendance is strictly prohibited."}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-6 pb-2 text-center text-xs text-[#8C7A6F] font-ethiopic font-medium">
        {language === "am" ? "አዲስ አበባ ዩኒቨርሲቲ • የሶፍትዌር ኢንጂነሪንግ ዲፓርትመንት" : "Addis Ababa University • Department of Software Engineering"}
      </footer>
    </main>
  );
}
