"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Play,
  Clock,
  Users,
  QrCode,
  KeyRound,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function InstructorDashboard() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("course_1");
  const [sessionMode, setSessionMode] = useState<"DYNAMIC_QR" | "ROLLING_CODE">("DYNAMIC_QR");
  const [duration, setDuration] = useState(15);

  const assignedCourses = [
    {
      id: "course_1",
      code: "SEng3112",
      title: "Software Requirements Engineering",
      batch: "Year 3",
      studentsCount: 25,
      activeSessionId: "sess_active_1",
    },
    {
      id: "course_4",
      code: "SEng1101",
      title: "Introduction to Software Engineering",
      batch: "Year 1",
      studentsCount: 30,
      activeSessionId: null,
    },
  ];

  const handleLaunchSession = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/sessions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse,
          openedById: "inst_1",
          mode: sessionMode,
          durationMinutes: duration,
        }),
      });

      const data = await res.json();
      if (res.ok && data.session) {
        router.push(`/instructor/session/${data.session.id}`);
      }
    } catch (err) {
      console.error("Launch error:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#2C221E] p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EADBCE] pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FBF2DE] flex items-center justify-center shadow-sm border border-[#B8860B]/30">
            <GraduationCap className="w-7 h-7 text-[#B8860B]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#2C221E] font-ethiopic">
              የመምህራን መቆጣጠሪያ • Instructor Control Deck
            </h1>
            <p className="text-xs text-[#706259] font-medium mt-0.5 font-ethiopic">
              Dr. Yared Tadesse • የሶፍትዌር ኢንጂነሪንግ ዲፓርትመንት
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-[#FFFFFF] border border-[#EADBCE] hover:border-[#B8860B] text-[#2C221E] font-bold text-xs rounded-xl shadow-sm transition-all font-ethiopic"
          >
            🏛️ የዲፓርትመንት ኃላፊ ገጽ
          </Link>
          <Link
            href="/mini-app"
            className="px-4 py-2 btn-ochre text-xs font-bold rounded-xl shadow-sm transition-all font-ethiopic"
          >
            📱 የተማሪው ሚኒ አፕ
          </Link>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Cards Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-black text-[#706259] uppercase tracking-wider flex items-center gap-2 font-ethiopic">
            <BookOpen className="w-4 h-4 text-[#B8860B]" />
            የተመደቡ ኮርሶች • Assigned Courses (2025/2026 S1)
          </h2>

          <div className="space-y-4">
            {assignedCourses.map((c) => (
              <div
                key={c.id}
                className="warm-card p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#FBF2DE] text-[#B8860B] border border-[#B8860B]/30">
                        {c.code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#F4EFE6] text-[#706259] border border-[#EADBCE]">
                        {c.batch}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#2C221E]">{c.title}</h3>
                    <p className="text-xs text-[#706259] flex items-center gap-2 font-medium">
                      <Users className="w-3.5 h-3.5 text-[#B8860B]" />
                      {c.studentsCount} የተመዘገቡ ተማሪዎች (Enrolled)
                    </p>
                  </div>

                  {c.activeSessionId ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F3EE] text-[#1E7E53] border border-[#C2E8CA]">
                      <span className="w-2 h-2 rounded-full bg-[#1E7E53] animate-pulse" />
                      ክፍለ-ጊዜው ክፍት ነው (Active)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F4EFE6] text-[#706259] border border-[#EADBCE]">
                      ተዘግቷል (Idle)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-[#EADBCE]">
                  {c.activeSessionId ? (
                    <Link
                      href={`/instructor/session/${c.activeSessionId}`}
                      className="flex-1 py-3 px-4 bg-[#1E7E53] hover:bg-[#166542] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all font-ethiopic"
                    >
                      <Sparkles className="w-4 h-4" />
                      የፕሮጀክተር ማሳያውን ክፈት (Resume Presenter)
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedCourse(c.id);
                        handleLaunchSession();
                      }}
                      className="flex-1 py-3 px-4 btn-ochre text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all font-ethiopic"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      አዲስ ክፍለ-ጊዜ ጀምር (Start Attendance)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launch Panel */}
        <div className="warm-card p-6 space-y-5 h-fit border-t-4 border-[#B8860B]">
          <h2 className="text-sm font-bold text-[#2C221E] flex items-center gap-2 font-ethiopic">
            <Sparkles className="w-4 h-4 text-[#B8860B]" />
            የአቴንዳንስ ማስጀመሪያ ቅንብር
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#706259] font-ethiopic">የሚመዘገበው ኮርስ</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2.5 text-xs text-[#2C221E] font-medium focus:outline-none focus:border-[#B8860B] shadow-sm"
              >
                <option value="course_1">SEng3112 - Software Requirements (Year 3)</option>
                <option value="course_4">SEng1101 - Intro to Software Eng (Year 1)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#706259] font-ethiopic">የማረጋገጫ ዘዴ</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSessionMode("DYNAMIC_QR")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    sessionMode === "DYNAMIC_QR"
                      ? "bg-[#E8F3EE] border-[#1E7E53] text-[#1E7E53] shadow-sm"
                      : "bg-[#FFFFFF] border-[#EADBCE] text-[#706259]"
                  }`}
                >
                  <QrCode className="w-4 h-4 mb-1" />
                  <p className="text-xs font-bold font-ethiopic">Dynamic QR</p>
                  <p className="text-[10px] opacity-80">ለፕሮጀክተር ማሳያ</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSessionMode("ROLLING_CODE")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    sessionMode === "ROLLING_CODE"
                      ? "bg-[#FBF2DE] border-[#B8860B] text-[#B8860B] shadow-sm"
                      : "bg-[#FFFFFF] border-[#EADBCE] text-[#706259]"
                  }`}
                >
                  <KeyRound className="w-4 h-4 mb-1" />
                  <p className="text-xs font-bold font-ethiopic">Rolling Code</p>
                  <p className="text-[10px] opacity-80">መብራት ለጠፋበት ጊዜ</p>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#706259] font-ethiopic">
                የክፍለ-ጊዜ ቆይታ (Duration)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2.5 text-xs text-[#2C221E] font-medium focus:outline-none focus:border-[#B8860B] shadow-sm"
              >
                <option value={10}>10 ደቂቃ (ለመደበኛ መግቢያ)</option>
                <option value={15}>15 ደቂቃ (መደበኛ - Default)</option>
                <option value={20}>20 ደቂቃ (ለላብ ክፍለ-ጊዜ)</option>
              </select>
            </div>

            <button
              disabled={isCreating}
              onClick={handleLaunchSession}
              className="w-full py-3.5 px-4 btn-ochre text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 font-ethiopic"
            >
              <Play className="w-4 h-4 fill-current" />
              {isCreating ? "እየተከፈተ ነው..." : "ክፍለ-ጊዜውን ጀምር"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
