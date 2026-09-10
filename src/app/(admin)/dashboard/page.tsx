"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  FileCheck,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  ChevronRight,
  ExternalLink,
  X,
} from "lucide-react";

export default function DepartmentHeadDashboard() {
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "roster" | "upload">("overview");

  // Excuse Modal state
  const [selectedRecordForExcuse, setSelectedRecordForExcuse] = useState<{
    id: string;
    studentName: string;
    studentId: string;
    courseCode: string;
    date: string;
  } | null>(null);
  const [excuseNote, setExcuseNote] = useState("");
  const [isSubmittingExcuse, setIsSubmittingExcuse] = useState(false);
  const [excuseSuccessMessage, setExcuseSuccessMessage] = useState("");

  // Roster Bulk Upload state
  const [csvText, setCsvText] = useState(
    `fullName,phoneNumber,studentId,batchYear,role\nTariku Belay,+251911990011,UGR/1421/14,3,STUDENT\nSelamawit Girma,+251911990012,UGR/1422/14,3,STUDENT\nDr. Haile Gebrselassie,+251911990099,,null,INSTRUCTOR`
  );
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Department Batches Summary
  const batches = [
    { year: 1, name: "Year 1 (Freshman)", total: 35, rate: 94, atRisk: 1, color: "emerald" },
    { year: 2, name: "Year 2 (Sophomore)", total: 32, rate: 89, atRisk: 2, color: "emerald" },
    { year: 3, name: "Year 3 (Junior)", total: 28, rate: 84, atRisk: 3, color: "amber" },
    { year: 4, name: "Year 4 (Senior)", total: 30, rate: 91, atRisk: 1, color: "emerald" },
    { year: 5, name: "Year 5 (Finalists)", total: 24, rate: 73, atRisk: 5, color: "rose" },
  ];

  // Sample Department Student Roster with attendance calculations
  const [studentRecords, setStudentRecords] = useState([
    {
      id: "rec_1",
      name: "Abebe Kebede",
      studentId: "UGR/1401/14",
      batchYear: 3,
      course: "SEng3112",
      status: "PRESENT",
      date: "2026-09-10",
      attendanceRate: 92,
    },
    {
      id: "rec_2",
      name: "Chaltu Desta",
      studentId: "UGR/1402/14",
      batchYear: 3,
      course: "SEng3112",
      status: "PRESENT",
      date: "2026-09-10",
      attendanceRate: 88,
    },
    {
      id: "rec_3",
      name: "Dawit Haile",
      studentId: "UGR/1403/14",
      batchYear: 3,
      course: "SEng3112",
      status: "ABSENT",
      date: "2026-09-10",
      attendanceRate: 64, // Critical Risk
    },
    {
      id: "rec_4",
      name: "Eyerusalem Bekele",
      studentId: "UGR/1404/14",
      batchYear: 3,
      course: "SEng3112",
      status: "EXCUSED",
      date: "2026-09-10",
      attendanceRate: 85,
    },
    {
      id: "rec_5",
      name: "Rediet Kassahun",
      studentId: "UGR/0211/12",
      batchYear: 5,
      course: "SEng5102",
      status: "ABSENT",
      date: "2026-09-09",
      attendanceRate: 70, // Critical Risk
    },
  ]);

  // Handle Excuse submission
  const handleSubmitExcuse = async () => {
    if (!selectedRecordForExcuse || excuseNote.trim().length < 5) return;
    setIsSubmittingExcuse(true);
    try {
      const res = await fetch("/api/sessions/excuse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: selectedRecordForExcuse.id,
          excuseReason: excuseNote,
          facultyId: "inst_1",
        }),
      });

      if (res.ok) {
        setStudentRecords((prev) =>
          prev.map((r) =>
            r.id === selectedRecordForExcuse.id ? { ...r, status: "EXCUSED" } : r
          )
        );
        setExcuseSuccessMessage("Absence successfully reconciled as EXCUSED.");
        setTimeout(() => {
          setSelectedRecordForExcuse(null);
          setExcuseSuccessMessage("");
          setExcuseNote("");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingExcuse(false);
    }
  };

  // Handle Bulk CSV Upload
  const handleProcessCsvUpload = async () => {
    setUploadStatus("Processing and whitelisting...");
    try {
      const lines = csvText.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      const rows = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const rowObj: Record<string, string> = {};
        headers.forEach((h, i) => {
          rowObj[h] = values[i] || "";
        });
        return rowObj;
      });

      const res = await fetch("/api/admin/rosters/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });

      const data = await res.json();
      if (res.ok) {
        setUploadStatus(
          `✅ Successfully processed ${data.totalProcessed} records (${data.addedCount} new, ${data.updatedCount} updated). Whitelist synchronized.`
        );
      } else {
        setUploadStatus(`❌ Error: ${data.error}`);
      }
    } catch {
      setUploadStatus("❌ Failed to process upload.");
    }
  };

  const filteredStudents = studentRecords.filter((s) => {
    const matchesBatch = selectedBatchFilter === "ALL" || s.batchYear === selectedBatchFilter;
    const matchesQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.course.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBatch && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-xl shadow-blue-500/20 border border-blue-400/30">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Department Executive Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300">
                Academic Year 2025/2026 S1
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mt-1">
              Department of Software Engineering
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Smart Telegram-Integrated Attendance Oversight & Roster Analytics
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/api/admin/export?batchYear=3"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export Batch 3 (.xlsx)
          </a>
          <Link
            href="/instructor"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all"
          >
            👨‍🏫 Instructor View
          </Link>
          <Link
            href="/mini-app"
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600/20 border border-sky-500/30 hover:bg-sky-600/30 text-sky-300 font-bold text-xs rounded-xl transition-all"
          >
            📱 Student TMA
          </Link>
        </div>
      </header>

      {/* KPI Highlight Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 space-y-2">
          <p className="text-xs font-semibold text-slate-400">Department Average Attendance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">88.4%</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              +2.1% this week
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[88.4%]" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 space-y-2">
          <p className="text-xs font-semibold text-slate-400">Critical Risk Students (&lt;75%)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400">12</span>
            <span className="text-xs text-slate-400">Students flagged for counseling</span>
          </div>
          <p className="text-[11px] text-slate-500">Subject to semester exam exclusion</p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 space-y-2">
          <p className="text-xs font-semibold text-slate-400">Active Sessions Right Now</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-sky-400">1</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SEng3112 Live
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Dr. Yared Tadesse (Projector Mode)</p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 space-y-2">
          <p className="text-xs font-semibold text-slate-400">Hardware Bound Students</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">149 / 149</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              100%
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Telegram contact cryptographically bound</p>
        </div>
      </section>

      {/* 5-BATCH COHORT BREAKDOWN (Year 1 to Year 5) */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          5-Year Academic Cohort Status (Years 1 - 5)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {batches.map((b) => (
            <div
              key={b.year}
              onClick={() => setSelectedBatchFilter(b.year)}
              className={`glass-panel p-5 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] ${
                selectedBatchFilter === b.year
                  ? "border-blue-500 shadow-lg shadow-blue-500/10 bg-slate-900"
                  : "border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">{b.name}</span>
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-md ${
                    b.rate >= 85
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : b.rate >= 75
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {b.rate}%
                </span>
              </div>

              <div className="my-3">
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      b.rate >= 85 ? "bg-emerald-500" : b.rate >= 75 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${b.rate}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>{b.total} Students</span>
                <span className={b.atRisk > 0 ? "text-rose-400 font-bold" : "text-slate-500"}>
                  {b.atRisk} At-Risk
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "overview"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Attendance Roster & Excuse Log
        </button>
        <button
          onClick={() => setActiveTab("upload")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "upload"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Bulk Roster Upload & Whitelist
        </button>
      </div>

      {/* TAB 1: ATTENDANCE ROSTER & EXCUSE LOG */}
      {activeTab === "overview" && (
        <section className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search student name, ID, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-400 font-medium">Batch:</span>
              <select
                value={selectedBatchFilter}
                onChange={(e) =>
                  setSelectedBatchFilter(
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value)
                  )
                }
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Batches (Y1–Y5)</option>
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
                <option value={5}>Year 5</option>
              </select>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Recent Status</th>
                  <th className="py-3 px-4">Overall Attendance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                        {s.name[0]}
                      </div>
                      {s.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{s.studentId}</td>
                    <td className="py-3 px-4">Year {s.batchYear}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{s.course}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                          s.status === "PRESENT"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : s.status === "EXCUSED"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black ${
                            s.attendanceRate >= 85
                              ? "text-emerald-400"
                              : s.attendanceRate >= 75
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {s.attendanceRate}%
                        </span>
                        {s.attendanceRate < 75 && (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                            At-Risk
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {s.status === "ABSENT" ? (
                        <button
                          onClick={() =>
                            setSelectedRecordForExcuse({
                              id: s.id,
                              studentName: s.name,
                              studentId: s.studentId,
                              courseCode: s.course,
                              date: s.date,
                            })
                          }
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Reconcile / Excuse
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">No Action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: BULK ROSTER UPLOAD & WHITELIST */}
      {activeTab === "upload" && (
        <section className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-400" />
              Pre-Load Student & Faculty Whitelist (CSV / Excel Format)
            </h2>
            <p className="text-xs text-slate-400">
              Pre-loaded phone numbers serve as the cryptographic anchor for single-device hardware lock upon /start.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">
              CSV Data (Columns: fullName, phoneNumber, studentId, batchYear, role)
            </label>
            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {uploadStatus && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-300">
              {uploadStatus}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-500">
              Existing users will be updated; new users will be whitelisted automatically.
            </p>
            <button
              onClick={handleProcessCsvUpload}
              className="py-2.5 px-5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all"
            >
              Synchronize Whitelist
            </button>
          </div>
        </section>
      )}

      {/* EXCUSE RECONCILIATION MODAL */}
      {selectedRecordForExcuse && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-lg w-full space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-amber-400" />
                  Absence Reconciliation & Excuse Override
                </h3>
                <p className="text-xs text-slate-400">
                  Update an unverified absence to EXCUSED with required audit justification.
                </p>
              </div>
              <button
                onClick={() => setSelectedRecordForExcuse(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <p>
                <strong className="text-slate-400">Student:</strong>{" "}
                <span className="text-white font-bold">{selectedRecordForExcuse.studentName}</span> (
                {selectedRecordForExcuse.studentId})
              </p>
              <p>
                <strong className="text-slate-400">Course & Date:</strong>{" "}
                <span className="text-slate-200 font-medium">
                  {selectedRecordForExcuse.courseCode} on {selectedRecordForExcuse.date}
                </span>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Official Excuse Justification Note <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g., Medical certificate verified from University Student Clinic (Ref: MED-2026-904)"
                value={excuseNote}
                onChange={(e) => setExcuseNote(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
              />
              <p className="text-[10px] text-slate-500">
                Will be logged permanently with your faculty identity and timestamp.
              </p>
            </div>

            {excuseSuccessMessage && (
              <p className="text-xs text-emerald-400 font-semibold">{excuseSuccessMessage}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedRecordForExcuse(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingExcuse || excuseNote.trim().length < 5}
                onClick={handleSubmitExcuse}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
              >
                {isSubmittingExcuse ? "Logging..." : "Confirm & Excuse Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
