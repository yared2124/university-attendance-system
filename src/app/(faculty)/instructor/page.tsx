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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Instructor Control Deck
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Dr. Yared Tadesse • Department of Software Engineering
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            🏛️ Dept Head View
          </Link>
          <Link
            href="/mini-app"
            className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-300 font-semibold text-xs rounded-xl transition-colors"
          >
            📱 Open Student TMA
          </Link>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Cards Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            Your Assigned Courses (2025/2026 S1)
          </h2>

          <div className="space-y-4">
            {assignedCourses.map((c) => (
              <div
                key={c.id}
                className="glass-panel p-6 rounded-3xl border border-slate-800/80 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {c.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300">
                        {c.batch}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{c.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      {c.studentsCount} Students Enrolled
                    </p>
                  </div>

                  {c.activeSessionId ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Session In Progress
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
                      Idle
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
                  {c.activeSessionId ? (
                    <Link
                      href={`/instructor/session/${c.activeSessionId}`}
                      className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      Resume Projector Presenter
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedCourse(c.id);
                        handleLaunchSession();
                      }}
                      className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
                    >
                      <Play className="w-4 h-4" />
                      Start Attendance Session
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launch Panel */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5 h-fit">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Session Configurator
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Select Target Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="course_1">SEng3112 - Software Requirements (Year 3)</option>
                <option value="course_4">SEng1101 - Intro to Software Eng (Year 1)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Verification Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSessionMode("DYNAMIC_QR")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    sessionMode === "DYNAMIC_QR"
                      ? "bg-blue-600/20 border-blue-500 text-blue-200"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <QrCode className="w-4 h-4 mb-1" />
                  <p className="text-xs font-bold">Dynamic QR</p>
                  <p className="text-[10px] opacity-75">Projector rotation</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSessionMode("ROLLING_CODE")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    sessionMode === "ROLLING_CODE"
                      ? "bg-amber-600/20 border-amber-500 text-amber-200"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <KeyRound className="w-4 h-4 mb-1" />
                  <p className="text-xs font-bold">Rolling Code</p>
                  <p className="text-[10px] opacity-75">Outage mode</p>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Session Window Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value={10}>10 Minutes (Standard Class Start)</option>
                <option value={15}>15 Minutes (Default)</option>
                <option value={20}>20 Minutes (Extended Lab)</option>
              </select>
            </div>

            <button
              disabled={isCreating}
              onClick={handleLaunchSession}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              {isCreating ? "Initializing..." : "Launch New Live Session"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
