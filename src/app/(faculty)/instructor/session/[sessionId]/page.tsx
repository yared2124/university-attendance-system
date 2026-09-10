"use client";

import React, { useState, useEffect, use } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  KeyRound,
  Users,
  CheckCircle2,
  Clock,
  Square,
  AlertTriangle,
  Radio,
  Sparkles,
  Maximize2,
  Minimize2,
  GraduationCap,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

export default function InstructorSessionPresenter({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const [mode, setMode] = useState<"DYNAMIC_QR" | "ROLLING_CODE">("DYNAMIC_QR");
  const [qrSvgDataUrl, setQrSvgDataUrl] = useState<string>("");
  const [qrSeed, setQrSeed] = useState<string>("");
  const [rollingCode, setRollingCode] = useState<string>("--- ---");
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [totalCohort, setTotalCohort] = useState(25);
  const [recentCheckIns, setRecentCheckIns] = useState<
    Array<{ id: string; studentId?: string; fullName?: string; markedAt: string }>
  >([]);
  const [isClosed, setIsClosed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [closedSummary, setClosedSummary] = useState<{
    presentCount: number;
    absentCount: number;
  } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Poll or stream active tokens every 2 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchSessionState = async () => {
      if (isClosed) return;
      try {
        const res = await fetch(`/api/sessions/${sessionId}/stream`);
        if (!res.ok) return;
        const data = await res.json();

        setQrSeed(data.qrSeed);
        setRollingCode(data.rollingCode);
        setCheckedInCount(data.checkedInCount || 0);
        setTotalCohort(data.totalCohort || 25);
        if (data.recentCheckIns) setRecentCheckIns(data.recentCheckIns);
        if (data.isClosed) setIsClosed(true);

        // Update remaining seconds
        const currentSeconds =
          mode === "DYNAMIC_QR"
            ? data.qrExpiresInSeconds || 15
            : data.codeExpiresInSeconds || 20;
        setSecondsRemaining(currentSeconds);

        // Generate QR code data URL
        if (data.qrSeed) {
          const qrPayload = JSON.stringify({
            sessionId,
            seed: data.qrSeed,
            exp: Date.now() + 15000,
          });
          const url = await QRCode.toDataURL(qrPayload, {
            width: 480,
            margin: 2,
            color: {
              dark: "#0284c7",
              light: "#ffffff",
            },
          });
          setQrSvgDataUrl(url);
        }
      } catch (err) {
        console.error("Stream polling error:", err);
      }
    };

    fetchSessionState();
    interval = setInterval(fetchSessionState, 2000);

    return () => clearInterval(interval);
  }, [sessionId, mode, isClosed]);

  // Client-side 1-second countdown tick for smooth UI ring animation
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 15));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle Session Close & Absence Materialization
  const handleCloseSession = async () => {
    if (!confirm("Are you sure you want to terminate this attendance session? Any absent students will be automatically marked as ABSENT.")) {
      return;
    }

    setIsClosing(true);
    try {
      const res = await fetch("/api/sessions/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsClosed(true);
        setClosedSummary({
          presentCount: data.presentCount,
          absentCount: data.absentCount,
        });
      }
    } catch (err) {
      console.error("Close error:", err);
    } finally {
      setIsClosing(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Percentage calculations
  const attendanceRate = Math.round((checkedInCount / (totalCohort || 1)) * 100);
  const maxTimer = mode === "DYNAMIC_QR" ? 15 : 20;
  const strokeDash = ((maxTimer - secondsRemaining) / maxTimer) * 283;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/instructor"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                SEng3112 • Year 3
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Attendance Session
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white mt-1">
              Software Requirements Engineering
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setMode("DYNAMIC_QR")}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === "DYNAMIC_QR"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <QrCode className="w-4 h-4" />
              Dynamic Projector QR
            </button>
            <button
              onClick={() => setMode("ROLLING_CODE")}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === "ROLLING_CODE"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <KeyRound className="w-4 h-4" />
              Outage Rolling Code
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {!isClosed && (
            <button
              disabled={isClosing}
              onClick={handleCloseSession}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600/90 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 border border-rose-500/30 transition-all disabled:opacity-50"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              {isClosing ? "Closing..." : "Terminate & Materialize Absences"}
            </button>
          )}
        </div>
      </header>

      {/* Main Classroom Presenter Canvas */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-8 items-center max-w-7xl mx-auto w-full">
        {/* LEFT / CENTER: Active Token Presenter */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center text-center space-y-6">
          {isClosed ? (
            <div className="glass-panel p-10 rounded-3xl border border-slate-800 max-w-md w-full space-y-4 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
              <h2 className="text-2xl font-black text-white">Session Terminated</h2>
              <p className="text-sm text-slate-400">
                Attendance records have been finalized and absent students were automatically materialized into PostgreSQL.
              </p>
              {closedSummary && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div className="bg-emerald-950/40 border border-emerald-500/20 p-3 rounded-2xl">
                    <p className="text-xs text-emerald-300 font-semibold">Present</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {closedSummary.presentCount}
                    </p>
                  </div>
                  <div className="bg-rose-950/40 border border-rose-500/20 p-3 rounded-2xl">
                    <p className="text-xs text-rose-300 font-semibold">Materialized Absent</p>
                    <p className="text-2xl font-bold text-rose-400">
                      {closedSummary.absentCount}
                    </p>
                  </div>
                </div>
              )}
              <Link
                href="/instructor"
                className="inline-block mt-4 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Return to Course List
              </Link>
            </div>
          ) : mode === "DYNAMIC_QR" ? (
            <div className="flex flex-col items-center space-y-5">
              {/* Dynamic QR Box with Circular Timer Ring */}
              <div className="relative p-6 rounded-3xl bg-white shadow-2xl shadow-blue-500/10 border-4 border-slate-800/20">
                {qrSvgDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrSvgDataUrl}
                    alt="Dynamic Attendance QR"
                    className="w-72 h-72 md:w-96 md:h-96 rounded-2xl"
                  />
                ) : (
                  <div className="w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
                    <Radio className="w-12 h-12 text-blue-500 animate-spin" />
                  </div>
                )}

                {/* Circular Countdown Gauge Badge */}
                <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-800 shadow-xl flex items-center justify-center">
                  <svg className="w-14 h-14 -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      stroke="#334155"
                      strokeWidth="3"
                      fill="transparent"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      stroke="#0284c7"
                      strokeWidth="3"
                      fill="transparent"
                      strokeDasharray="138"
                      strokeDashoffset={(138 * (15 - secondsRemaining)) / 15}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-sky-400">
                    {secondsRemaining}s
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Scan with the Telegram Mini App
                </p>
                <p className="text-xs text-slate-400">
                  Tokens decay every 15 seconds. Screenshots sent to absentee friends will fail.
                </p>
              </div>
            </div>
          ) : (
            /* OUTAGE MODE: HIGH-CONTRAST ROLLING PASSCODE */
            <div className="glass-panel p-10 rounded-3xl border-2 border-amber-500/30 max-w-xl w-full space-y-6">
              <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider bg-amber-500/10 py-1.5 px-3 rounded-full w-fit mx-auto border border-amber-500/20">
                <AlertTriangle className="w-4 h-4" />
                Power Outage / Low-Tech Mode
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
                  Current Classroom Rolling Code
                </p>
                {/* Enormous high-contrast code display */}
                <div className="py-6 px-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
                  <span className="text-5xl md:text-7xl font-mono font-black text-amber-300 tracking-wider">
                    {rollingCode}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 text-slate-400 text-xs">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Cycles every 20s
                </span>
                <span>•</span>
                <span className="text-amber-400 font-medium">
                  Next code in <strong className="text-white">{secondsRemaining}s</strong>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Students type this directly into their Telegram bot or the Mini App.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Live Incoming Attendance Roster Feed */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 h-[480px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Live Attendance Ticker
              </h3>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {checkedInCount} / {totalCohort} ({attendanceRate}%)
              </span>
            </div>

            {/* Attendance Progress Meter */}
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-3 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, attendanceRate)}%` }}
              />
            </div>
          </div>

          {/* Incoming Stream list */}
          <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
            {recentCheckIns.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                <Clock className="w-8 h-8 opacity-40 animate-spin" />
                <p className="text-xs">Waiting for student check-ins...</p>
              </div>
            ) : (
              recentCheckIns.map((rec, i) => (
                <div
                  key={rec.id || `live_${i}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs animate-in fade-in-50 slide-in-from-top-1"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-200">{rec.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{rec.studentId}</p>
                    </div>
                  </div>
                  <span suppressHydrationWarning className="text-[10px] font-mono text-slate-400">
                    {new Date(rec.markedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-center text-slate-500 font-medium">
            Atomic PostgreSQL & Redis Ingestion
          </div>
        </div>
      </main>

      {/* Bottom Status Ticker */}
      <footer className="text-center text-xs text-slate-500 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span>Department of Software Engineering</span>
        <span>Anti-Replay Token & Hardware Identity Active</span>
        <span>Version 2.0.0</span>
      </footer>
    </div>
  );
}
