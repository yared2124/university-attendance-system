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
  Calendar,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CourseItem {
  id: string;
  code: string;
  title: string;
  batchYear: number;
  studentsCount: number;
  activeSessionId: string | null;
  scheduleSlot: string;
}

export default function InstructorDashboard() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  // Batch Filter & Course Selection
  const [selectedBatchYear, setSelectedBatchYear] = useState<number>(3);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("course_1");
  const [sessionType, setSessionType] = useState<"Morning Lecture" | "Afternoon Lab" | "Make-up Class">("Morning Lecture");
  const [sessionMode, setSessionMode] = useState<"DYNAMIC_QR" | "ROLLING_CODE">("DYNAMIC_QR");
  const [duration, setDuration] = useState<number>(15);

  const assignedCourses: CourseItem[] = [
    {
      id: "course_1",
      code: "SEng3112",
      title: "Software Requirements Engineering",
      batchYear: 3,
      studentsCount: 28,
      activeSessionId: "sess_active_1",
      scheduleSlot: "Mon/Wed 08:30 - 10:00",
    },
    {
      id: "course_2",
      code: "SEng3122",
      title: "Software Architecture & Design",
      batchYear: 3,
      studentsCount: 28,
      activeSessionId: null,
      scheduleSlot: "Tue/Thu 10:30 - 12:00",
    },
    {
      id: "course_4",
      code: "SEng1101",
      title: "Introduction to Computing & Software",
      batchYear: 1,
      studentsCount: 35,
      activeSessionId: null,
      scheduleSlot: "Mon/Wed 14:00 - 15:30",
    },
    {
      id: "course_5",
      code: "SEng2104",
      title: "Data Structures & Algorithms",
      batchYear: 2,
      studentsCount: 32,
      activeSessionId: null,
      scheduleSlot: "Tue/Thu 08:30 - 10:00",
    },
    {
      id: "course_6",
      code: "SEng4105",
      title: "Software Quality Assurance & Testing",
      batchYear: 4,
      studentsCount: 30,
      activeSessionId: null,
      scheduleSlot: "Fri 09:00 - 12:00",
    },
    {
      id: "course_7",
      code: "SEng5102",
      title: "Senior Capstone Project II",
      batchYear: 5,
      studentsCount: 24,
      activeSessionId: null,
      scheduleSlot: "Wed 14:00 - 17:00",
    },
  ];

  // Filter courses by chosen batch
  const batchCourses = assignedCourses.filter((c) => c.batchYear === selectedBatchYear);

  // Handle batch change
  const handleBatchChange = (batchYear: number) => {
    setSelectedBatchYear(batchYear);
    const matching = assignedCourses.filter((c) => c.batchYear === batchYear);
    if (matching.length > 0) {
      setSelectedCourseId(matching[0].id);
    }
  };

  const handleLaunchSession = async (overrideCourseId?: string) => {
    const courseToLaunch = overrideCourseId || selectedCourseId;
    setIsCreating(true);
    try {
      const res = await fetch("/api/sessions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: courseToLaunch,
          openedById: "inst_1",
          mode: sessionMode,
          durationMinutes: duration,
          sessionType,
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
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#FBF2DE] text-[#B8860B] border border-[#B8860B]/30">
                Injibara University
              </span>
              <span className="text-xs text-[#706259] font-medium">
                Faculty Portal
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#2C221E]">
              Instructor Control Deck
            </h1>
            <p className="text-xs text-[#706259] font-medium mt-0.5">
              Dr. Yared Tadesse • Department of Software Engineering (Semester 1)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-[#FFFFFF] border border-[#EADBCE] hover:border-[#B8860B] text-[#2C221E] font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            🏛️ Department Head Portal
          </Link>
          <Link
            href="/mini-app"
            className="px-4 py-2 btn-ochre text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            📱 Student Mini App
          </Link>
        </div>
      </header>

      {/* Batch Selector Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-[#706259] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#B8860B]" />
            Select Teaching Cohort / Batch Year
          </label>
          <span className="text-xs text-[#706259] font-medium">
            2025/2026 Academic Calendar
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { year: 1, label: "Year 1", sub: "Freshman", count: 1 },
            { year: 2, label: "Year 2", sub: "Sophomore", count: 1 },
            { year: 3, label: "Year 3", sub: "Junior", count: 2 },
            { year: 4, label: "Year 4", sub: "Senior", count: 1 },
            { year: 5, label: "Year 5", sub: "Finalist", count: 1 },
          ].map((b) => (
            <button
              key={b.year}
              type="button"
              onClick={() => handleBatchChange(b.year)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                selectedBatchYear === b.year
                  ? "bg-[#FFFFFF] border-[#B8860B] ring-2 ring-[#B8860B]/30 shadow-md"
                  : "bg-[#FFFFFF] border-[#EADBCE] hover:border-[#B8860B] shadow-sm text-[#706259]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-black ${selectedBatchYear === b.year ? "text-[#B8860B]" : "text-[#2C221E]"}`}>
                  {b.label}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-[#F4EFE6] text-[#706259]">
                  {b.count} {b.count === 1 ? "Course" : "Courses"}
                </span>
              </div>
              <p className="text-[11px] text-[#706259] font-medium mt-0.5">{b.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Cards Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-[#706259] uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#B8860B]" />
              Assigned Courses for Year {selectedBatchYear} ({batchCourses.length})
            </h2>
            <span className="text-xs text-[#706259]">
              Click card to start attendance
            </span>
          </div>

          <div className="space-y-4">
            {batchCourses.map((c) => (
              <div
                key={c.id}
                className={`warm-card p-6 space-y-4 transition-all ${
                  selectedCourseId === c.id ? "ring-2 ring-[#B8860B]/30 border-[#B8860B]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#FBF2DE] text-[#B8860B] border border-[#B8860B]/30 font-mono">
                        {c.code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#F4EFE6] text-[#706259] border border-[#EADBCE]">
                        Year {c.batchYear} Batch
                      </span>
                      <span className="text-xs text-[#706259] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#B8860B]" />
                        {c.scheduleSlot}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#2C221E]">{c.title}</h3>
                    <p className="text-xs text-[#706259] flex items-center gap-2 font-medium">
                      <Users className="w-3.5 h-3.5 text-[#B8860B]" />
                      {c.studentsCount} Whitelisted Students Enrolled
                    </p>
                  </div>

                  {c.activeSessionId ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F3EE] text-[#1E7E53] border border-[#C2E8CA] shrink-0">
                      <span className="w-2 h-2 rounded-full bg-[#1E7E53] animate-pulse" />
                      Session Live
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F4EFE6] text-[#706259] border border-[#EADBCE] shrink-0">
                      Idle
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-[#EADBCE]">
                  {c.activeSessionId ? (
                    <Link
                      href={`/instructor/session/${c.activeSessionId}`}
                      className="flex-1 py-3 px-4 bg-[#1E7E53] hover:bg-[#166542] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      Resume Live Presenter Screen
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedCourseId(c.id);
                        handleLaunchSession(c.id);
                      }}
                      className="flex-1 py-3 px-4 btn-ochre text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Start Attendance Session Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launch & Session Configuration Panel */}
        <div className="warm-card p-6 space-y-5 h-fit border-t-4 border-[#B8860B]">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#2C221E] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B8860B]" />
              Session Launch Settings
            </h2>
            <p className="text-xs text-[#706259]">
              Configure mode & verify settings before projecting
            </p>
          </div>

          <div className="space-y-4">
            {/* Course Selector (Auto-selects if 1, dropdown if 2+) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#706259]">Target Course</label>
              {batchCourses.length === 1 ? (
                <div className="w-full bg-[#F4EFE6] border border-[#EADBCE] rounded-xl px-3 py-2.5 text-xs text-[#2C221E] font-bold">
                  {batchCourses[0].code} - {batchCourses[0].title}
                </div>
              ) : (
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2.5 text-xs text-[#2C221E] font-medium focus:outline-none focus:border-[#B8860B] shadow-sm"
                >
                  {batchCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Session Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#706259]">Session Type</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["Morning Lecture", "Afternoon Lab", "Make-up Class"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSessionType(t)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                      sessionType === t
                        ? "bg-[#FBF2DE] border-[#B8860B] text-[#B8860B] shadow-sm"
                        : "bg-[#FFFFFF] border-[#EADBCE] text-[#706259] hover:text-[#2C221E]"
                    }`}
                  >
                    {t.replace("Lecture", "Lec").replace("Class", "")}
                  </button>
                ))}
              </div>
            </div>

            {/* Attendance Protocol Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#706259]">Verification Protocol</label>
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
                  <p className="text-xs font-bold">Dynamic QR</p>
                  <p className="text-[10px] opacity-80">15s Projector Token</p>
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
                  <p className="text-xs font-bold">Rolling Code</p>
                  <p className="text-[10px] opacity-80">Power Outage Mode</p>
                </button>
              </div>
            </div>

            {/* Flexible Session Timing Info */}
            <div className="p-3 rounded-xl bg-[#F4EFE6] border border-[#EADBCE] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2C221E]">
                <Clock className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>Flexible In-Class Control</span>
              </div>
              <p className="text-[11px] text-[#706259] leading-relaxed">
                Sessions do not prematurely lock. You have full discretion to start, pause, and close attendance whenever your lecture concludes.
              </p>
            </div>

            {/* Manual Cap Reminder */}
            <div className="p-3 rounded-xl bg-[#FBF2DE] border border-[#B8860B]/30 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#B8860B]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>Anti-Proxy Protection</span>
              </div>
              <p className="text-[11px] text-[#706259] leading-relaxed">
                In-class manual check-ins are strictly capped at <strong>5 students per session</strong> for students with dead batteries or basic phones.
              </p>
            </div>

            <button
              disabled={isCreating}
              onClick={() => handleLaunchSession()}
              className="w-full py-3.5 px-4 btn-ochre text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              {isCreating ? "Initializing Session..." : "Launch Projector Session"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
