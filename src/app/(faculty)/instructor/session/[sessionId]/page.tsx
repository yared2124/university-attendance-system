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
  Maximize2,
  Minimize2,
  ChevronLeft,
  UserPlus,
  Search,
  X,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

interface CheckInRecord {
  id: string;
  studentId?: string;
  fullName?: string;
  markedAt: string;
  isManual?: boolean;
}

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
  const [totalCohort, setTotalCohort] = useState(28);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInRecord[]>([]);
  const [isClosed, setIsClosed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [closedSummary, setClosedSummary] = useState<{
    presentCount: number;
    absentCount: number;
  } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Manual In-Class Registration Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualSearchQuery, setManualSearchQuery] = useState("");
  const [manualReason, setManualReason] = useState("No smartphone / dead battery");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualSuccessMsg, setManualSuccessMsg] = useState<string | null>(null);

  // Batch cohort students list available for manual check-in
  const cohortStudents = [
    { id: "stu_301", studentId: "UGR/1401/14", name: "Abebe Kebede", phone: "+251922110001" },
    { id: "stu_302", studentId: "UGR/1402/14", name: "Chaltu Desta", phone: "+251922110002" },
    { id: "stu_303", studentId: "UGR/1403/14", name: "Dawit Haile", phone: "+251922110003" },
    { id: "stu_304", studentId: "UGR/1404/14", name: "Eyerusalem Bekele", phone: "+251922110004" },
    { id: "stu_305", studentId: "UGR/1405/14", name: "Fikadu Assefa", phone: "+251922110005" },
    { id: "stu_306", studentId: "UGR/1406/14", name: "Genet Alemayehu", phone: "+251922110006" },
    { id: "stu_307", studentId: "UGR/1407/14", name: "Hanna Solomon", phone: "+251922110007" },
  ];

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
        setTotalCohort(data.totalCohort || 28);
        if (data.recentCheckIns) setRecentCheckIns(data.recentCheckIns);
        if (data.isClosed) setIsClosed(true);

        const currentSeconds =
          mode === "DYNAMIC_QR"
            ? data.qrExpiresInSeconds || 15
            : data.codeExpiresInSeconds || 20;
        setSecondsRemaining(currentSeconds);

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
              dark: "#0f172a",
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

  // Client countdown tick for ring
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 15));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle In-Class Manual Mark for a student with Strict Cap of 5
  const MAX_MANUAL_CAP = 5;
  const manualCount = recentCheckIns.filter((r) => r.isManual).length;

  const handleManualMark = async (student: { id: string; name: string; studentId: string }) => {
    if (manualCount >= MAX_MANUAL_CAP) {
      setManualSuccessMsg(`⛔ Quota Exceeded: Maximum ${MAX_MANUAL_CAP} manual check-ins allowed per session. Additional absentees must present official excuse documentation to the Department Head.`);
      return;
    }

    setIsSubmittingManual(true);
    setManualSuccessMsg(null);

    try {
      const res = await fetch("/api/sessions/manual-mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          studentId: student.id,
          reason: manualReason,
          status: "PRESENT",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setManualSuccessMsg(`✅ ${student.name} marked PRESENT manually (${manualCount + 1}/${MAX_MANUAL_CAP} quota used).`);
        setCheckedInCount((prev) => prev + 1);
        setRecentCheckIns((prev) => [
          {
            id: `man_${Date.now()}`,
            fullName: student.name,
            studentId: student.studentId,
            markedAt: new Date().toISOString(),
            isManual: true,
          },
          ...prev,
        ]);
        setTimeout(() => setManualSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Handle Session Close
  const handleCloseSession = async () => {
    if (!confirm("Are you sure you want to terminate this attendance session? All students who did not check in will be automatically recorded as ABSENT.")) {
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

  const attendanceRate = Math.round((checkedInCount / (totalCohort || 1)) * 100);
  const filteredCohortForManual = cohortStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(manualSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#2C221E] flex flex-col justify-between p-6">
      {/* Top Header Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EADBCE] pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/instructor"
            className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADBCE] hover:border-[#B8860B] text-[#706259] hover:text-[#2C221E] transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#FBF2DE] text-[#B8860B] border border-[#B8860B]/30">
                SEng3112 • Semester 1
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#E8F3EE] text-[#1E7E53] border border-[#C2E8CA]">
                <span className="w-2 h-2 rounded-full bg-[#1E7E53] animate-pulse" />
                Live Attendance Session (Injibara University)
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#2C221E] mt-1">
              Software Requirements Engineering (Year 3)
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Manual Check-in Trigger with 5-student Cap */}
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFFFFF] border border-[#EADBCE] hover:border-[#B8860B] text-[#2C221E] font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4 text-[#B8860B]" />
            Manual Check-in ({manualCount}/5 Used)
          </button>

          {/* Mode Switcher */}
          <div className="flex bg-[#ECE4D8] p-1 rounded-xl border border-[#EADBCE]">
            <button
              onClick={() => setMode("DYNAMIC_QR")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === "DYNAMIC_QR"
                  ? "bg-[#1E7E53] text-white shadow-sm"
                  : "text-[#706259] hover:text-[#2C221E]"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              Dynamic QR (15s)
            </button>
            <button
              onClick={() => setMode("ROLLING_CODE")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === "ROLLING_CODE"
                  ? "bg-[#B8860B] text-white shadow-sm"
                  : "text-[#706259] hover:text-[#2C221E]"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Rolling Code
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADBCE] hover:border-[#B8860B] text-[#706259] shadow-sm"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {!isClosed && (
            <button
              disabled={isClosing}
              onClick={handleCloseSession}
              className="flex items-center gap-2 px-4 py-2 bg-[#FAEAE9] hover:bg-[#F8D7DA] text-[#B83833] border border-[#F8D7DA] font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              {isClosing ? "Terminating..." : "Terminate Session"}
            </button>
          )}
        </div>
      </header>

      {/* Presenter Canvas */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6 items-center max-w-7xl mx-auto w-full">
        {/* LEFT / CENTER: Active Token Presenter */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center text-center space-y-6">
          {isClosed ? (
            <div className="p-10 rounded-3xl warm-card max-w-md w-full space-y-4 text-center">
              <CheckCircle2 className="w-14 h-14 text-[#1E7E53] mx-auto" />
              <h2 className="text-xl font-bold text-[#2C221E]">Attendance Finalized</h2>
              <p className="text-xs text-[#706259]">
                The session has been terminated. Cohort absences have been materialized into PostgreSQL.
              </p>
              {closedSummary && (
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#EADBCE]">
                  <div className="bg-[#E8F3EE] border border-[#C2E8CA] p-3 rounded-2xl">
                    <p className="text-xs text-[#1E7E53] font-bold">Present</p>
                    <p className="text-2xl font-black text-[#1E7E53]">{closedSummary.presentCount}</p>
                  </div>
                  <div className="bg-[#FAEAE9] border border-[#F8D7DA] p-3 rounded-2xl">
                    <p className="text-xs text-[#B83833] font-bold">Absent (Unexcused)</p>
                    <p className="text-2xl font-black text-[#B83833]">{closedSummary.absentCount}</p>
                  </div>
                </div>
              )}
              <Link
                href="/instructor"
                className="inline-block mt-3 w-full py-3 px-4 btn-ochre text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Return to Course Deck
              </Link>
            </div>
          ) : mode === "DYNAMIC_QR" ? (
            <div className="flex flex-col items-center space-y-4">
              {/* Dynamic QR Box with Circular Timer Ring */}
              <div className="relative p-6 rounded-3xl bg-[#FFFFFF] shadow-xl border-4 border-[#EADBCE]">
                {qrSvgDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrSvgDataUrl}
                    alt="Dynamic Attendance QR"
                    className="w-72 h-72 md:w-96 md:h-96 rounded-2xl"
                  />
                ) : (
                  <div className="w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
                    <Radio className="w-10 h-10 text-[#B8860B] animate-spin" />
                  </div>
                )}

                {/* Circular Gauge Badge */}
                <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-[#FFFFFF] border-2 border-[#EADBCE] shadow-lg flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90">
                    <circle cx="24" cy="24" r="19" stroke="#ECE4D8" strokeWidth="3" fill="transparent" />
                    <circle
                      cx="24"
                      cy="24"
                      r="19"
                      stroke="#B8860B"
                      strokeWidth="3"
                      fill="transparent"
                      strokeDasharray="119"
                      strokeDashoffset={(119 * (15 - secondsRemaining)) / 15}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-[#B8860B]">{secondsRemaining}s</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-black text-[#2C221E]">
                  Scan via Telegram Mini App
                </p>
                <p className="text-xs text-[#706259]">
                  QR seed rotates every 15s. Forwarded screenshots will fail automatically.
                </p>
              </div>
            </div>
          ) : (
            /* OUTAGE MODE: HIGH-CONTRAST ROLLING PASSCODE */
            <div className="p-8 rounded-3xl warm-card border-2 border-[#B8860B] max-w-lg w-full space-y-5">
              <div className="flex items-center justify-center gap-2 text-[#B8860B] font-bold text-xs uppercase tracking-wider bg-[#FBF2DE] py-1.5 px-3 rounded-full w-fit mx-auto border border-[#B8860B]/30">
                <AlertTriangle className="w-4 h-4" />
                Power Outage / Classroom Offline Mode
              </div>

              <div className="space-y-2">
                <p className="text-xs text-[#706259] font-bold uppercase tracking-wider">
                  Active Classroom Rolling Code
                </p>
                <div className="py-6 px-8 rounded-2xl bg-[#F4EFE6] border border-[#EADBCE]">
                  <span className="text-5xl md:text-7xl font-mono font-black text-[#B8860B] tracking-wider">
                    {rollingCode}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 text-[#706259] text-xs">
                <span>Cycles every 20 seconds</span>
                <span>•</span>
                <span className="text-[#B8860B] font-bold">
                  Next code in <strong className="text-[#2C221E]">{secondsRemaining}s</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Live Incoming Attendance Roster Feed */}
        <div className="lg:col-span-4 p-5 rounded-3xl warm-card space-y-4 h-[480px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
              <h3 className="text-xs font-bold text-[#2C221E] uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#B8860B]" />
                Live Attendance Feed
              </h3>
              <span className="text-xs font-bold text-[#1E7E53] bg-[#E8F3EE] px-2.5 py-0.5 rounded-lg border border-[#C2E8CA]">
                {checkedInCount} / {totalCohort} ({attendanceRate}%)
              </span>
            </div>

            <div className="w-full h-2 bg-[#F4EFE6] rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-[#1E7E53] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, attendanceRate)}%` }}
              />
            </div>
          </div>

          {/* Incoming Stream list */}
          <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
            {recentCheckIns.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#706259] space-y-2">
                <Clock className="w-7 h-7 opacity-40 animate-spin text-[#B8860B]" />
                <p className="text-xs">Awaiting student check-ins...</p>
              </div>
            ) : (
              recentCheckIns.map((rec, i) => (
                <div
                  key={rec.id || `live_${i}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#FFFFFF] border border-[#EADBCE] text-xs shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1E7E53] shrink-0" />
                    <div>
                      <p className="font-bold text-[#2C221E] flex items-center gap-1.5">
                        {rec.fullName}
                        {rec.isManual && (
                          <span className="text-[10px] font-bold text-[#B8860B] bg-[#FBF2DE] px-1.5 py-0.5 rounded-md border border-[#B8860B]/30">
                            Manual
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-[#706259] font-mono">{rec.studentId}</p>
                    </div>
                  </div>
                  <span suppressHydrationWarning className="text-[10px] font-mono font-medium text-[#706259]">
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

          <div className="pt-2 border-t border-[#EADBCE] text-[11px] text-center text-[#706259] font-medium">
            Atomic Real-time Sync • Injibara University SEng
          </div>
        </div>
      </main>

      {/* MANUAL IN-CLASS REGISTRATION MODAL WITH STRICT CAP OF 5 */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-[#2C221E]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EADBCE] shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-[#2C221E] flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-[#B8860B]" />
                    Manual In-Class Check-in
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FBF2DE] text-[#B8860B] border border-[#B8860B]/30">
                    {manualCount} / 5 Used
                  </span>
                </div>
                <p className="text-xs text-[#706259]">
                  Strict limit: Maximum 5 manual check-ins per session to prevent proxy attendance.
                </p>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-xl text-[#706259] hover:text-[#2C221E] hover:bg-[#F4EFE6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Reason Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#706259]">Verification Reason</label>
              <select
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2 text-xs text-[#2C221E] font-medium focus:outline-none focus:border-[#B8860B]"
              >
                <option value="No smartphone / dead battery">📵 No smartphone / battery died</option>
                <option value="No cellular data / internet down">🌐 No cellular data / network down</option>
                <option value="Physical paper sign-in verified">📝 Verified physical sign-in in hall</option>
              </select>
            </div>

            {/* Search Cohort */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#706259] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student by name or ID (e.g. Abebe)..."
                value={manualSearchQuery}
                onChange={(e) => setManualSearchQuery(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C221E] placeholder-[#A6978A] focus:outline-none focus:border-[#B8860B]"
              />
            </div>

            {manualSuccessMsg && (
              <p className="text-xs text-[#1E7E53] font-bold p-2.5 bg-[#E8F3EE] rounded-xl border border-[#C2E8CA]">
                {manualSuccessMsg}
              </p>
            )}

            {/* Students List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-[#EADBCE]/60">
              {filteredCohortForManual.map((stu) => (
                <div
                  key={stu.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F9F6F0] transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-[#2C221E]">{stu.name}</p>
                    <p className="text-[10px] text-[#706259] font-mono">{stu.studentId} • {stu.phone}</p>
                  </div>
                  <button
                    disabled={isSubmittingManual || manualCount >= 5}
                    onClick={() => handleManualMark(stu)}
                    className="px-3 py-1.5 btn-ochre text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {manualCount >= 5 ? "Cap Reached (5/5)" : "Mark Present"}
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#EADBCE] flex justify-end">
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#706259] hover:text-[#2C221E]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-[#706259] pt-3 border-t border-[#EADBCE] flex items-center justify-between">
        <span className="font-medium">Department of Software Engineering • Injibara University</span>
        <span className="font-semibold text-[#B8860B]">Anti-Proxy Limit Enforced (Max 5 Manual)</span>
        <span className="font-mono text-[10px]">v2.2.0</span>
      </footer>
    </div>
  );
}
