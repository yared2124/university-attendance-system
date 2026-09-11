"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  Building2,
  Users,
  AlertTriangle,
  CheckCircle2,
  Download,
  Upload,
  Search,
  Filter,
  FileCheck,
  Calendar,
  Sparkles,
  Phone,
  Send,
  MessageSquare,
  FileSpreadsheet,
  HelpCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  GraduationCap,
  X,
  FileText,
  AlertOctagon,
  ChevronDown,
} from "lucide-react";

interface StudentRow {
  id: string;
  name: string;
  studentId: string;
  phoneNumber: string;
  telegramUsername?: string;
  batchYear: number;
  course: string;
  status: "PRESENT" | "ABSENT" | "EXCUSED";
  date: string;
  attendanceRate: number;
}

interface ParsedUploadRow {
  fullName: string;
  studentId: string;
  phoneNumber: string;
  batchYear: string | number;
  semester: string | number;
  isValidPhone: boolean;
}

export default function DepartmentHeadDashboard() {
  // Academic Hierarchy States
  const [academicYear, setAcademicYear] = useState("2025/2026");
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"roster" | "atRisk" | "upload" | "history">("atRisk");

  // Roster Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [parsedUploadRows, setParsedUploadRows] = useState<ParsedUploadRow[]>([]);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmittingUpload, setIsSubmittingUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Excuse Modal State
  const [selectedRecordForExcuse, setSelectedRecordForExcuse] = useState<StudentRow | null>(null);
  const [excuseNote, setExcuseNote] = useState("");
  const [isSubmittingExcuse, setIsSubmittingExcuse] = useState(false);
  const [excuseNotification, setExcuseNotification] = useState<string | null>(null);

  // Telegram Warning Dispatch State
  const [alertingStudentId, setAlertingStudentId] = useState<string | null>(null);
  const [dispatchedSuccessStudent, setDispatchedSuccessStudent] = useState<string | null>(null);

  // Broadcast Warning Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastTargetBatch, setBroadcastTargetBatch] = useState<number>(3);
  const [customBroadcastMessage, setCustomBroadcastMessage] = useState(
    "🚨 አስቸኳይ የዲፓርትመንት ማስጠንቀቂያ: የአቴንዳንስ ምጣኔዎ ከ 75% በታች በመሆኑ ለፈተና እንዳይከለከሉ በአስቸኳይ ዲፓርትመንት ቢሮ ቀርበው ያነጋግሩ!"
  );
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Department Cohorts Metadata
  const batches = [
    { year: 1, name: "Year 1 (Freshman)", total: 35, rate: 94, atRisk: 1 },
    { year: 2, name: "Year 2 (Sophomore)", total: 32, rate: 89, atRisk: 2 },
    { year: 3, name: "Year 3 (Junior)", total: 28, rate: 84, atRisk: 3 },
    { year: 4, name: "Year 4 (Senior)", total: 30, rate: 91, atRisk: 1 },
    { year: 5, name: "Year 5 (Finalists)", total: 24, rate: 73, atRisk: 5 },
  ];

  // Live Student Roster
  const [studentRecords, setStudentRecords] = useState<StudentRow[]>([
    {
      id: "rec_3",
      name: "Dawit Haile",
      studentId: "UGR/1403/14",
      phoneNumber: "+251922110003",
      telegramUsername: "dawit_h",
      batchYear: 3,
      course: "SEng3112",
      status: "ABSENT",
      date: "2026-09-10",
      attendanceRate: 64, // Critical Risk < 75%
    },
    {
      id: "rec_5",
      name: "Rediet Kassahun",
      studentId: "UGR/0211/12",
      phoneNumber: "+251955000001",
      telegramUsername: "rediet_k",
      batchYear: 5,
      course: "SEng5102",
      status: "ABSENT",
      date: "2026-09-09",
      attendanceRate: 70, // Critical Risk < 75%
    },
    {
      id: "rec_7",
      name: "Hanna Solomon",
      studentId: "UGR/1407/14",
      phoneNumber: "+251922110007",
      telegramUsername: "hanna_s",
      batchYear: 3,
      course: "SEng3112",
      status: "ABSENT",
      date: "2026-09-10",
      attendanceRate: 71, // Critical Risk < 75%
    },
    {
      id: "rec_1",
      name: "Abebe Kebede",
      studentId: "UGR/1401/14",
      phoneNumber: "+251922110001",
      telegramUsername: "abebe_k",
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
      phoneNumber: "+251922110002",
      telegramUsername: "chaltu_d",
      batchYear: 3,
      course: "SEng3112",
      status: "PRESENT",
      date: "2026-09-10",
      attendanceRate: 88,
    },
    {
      id: "rec_4",
      name: "Eyerusalem Bekele",
      studentId: "UGR/1404/14",
      phoneNumber: "+251922110004",
      telegramUsername: "eyerus_b",
      batchYear: 3,
      course: "SEng3112",
      status: "EXCUSED",
      date: "2026-09-10",
      attendanceRate: 85,
    },
  ]);

  // Handle Drag & Drop File Parsing
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processRosterFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processRosterFile(files[0]);
    }
  };

  const processRosterFile = async (file: File) => {
    setUploadFileName(file.name);
    setUploadMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        const parsed: ParsedUploadRow[] = json.map((row) => {
          const rawPhone = String(
            row["phoneNumber"] || row["phone"] || row["Telegram Phone"] || row["Phone Number"] || ""
          ).trim();

          const normalizedPhone = rawPhone.startsWith("+")
            ? rawPhone
            : rawPhone.length > 8
            ? `+251${rawPhone.replace(/^0/, "")}`
            : rawPhone;

          const isValidPhone = /^\+251[0-9]{9}$/.test(normalizedPhone.replace(/\s+/g, ""));

          return {
            fullName: String(row["fullName"] || row["name"] || row["Full Name"] || "Unknown"),
            studentId: String(row["studentId"] || row["id"] || row["Student ID"] || "Pending"),
            phoneNumber: normalizedPhone,
            batchYear: Number(row["batchYear"] || row["batch"] || row["Year"] || 3),
            semester: Number(row["semester"] || selectedSemester),
            isValidPhone,
          };
        });

        setParsedUploadRows(parsed);
      } catch (err) {
        console.error("Failed to parse file:", err);
        setUploadMessage({ type: "error", text: "Failed to parse file. Please upload a valid CSV or Excel file." });
      }
    };
    reader.readAsBinaryString(file);
  };

  // Commit Parsed Roster
  const handleCommitUpload = async () => {
    if (parsedUploadRows.length === 0) return;
    setIsSubmittingUpload(true);

    try {
      const res = await fetch("/api/admin/rosters/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsedUploadRows }),
      });

      const data = await res.json();
      if (res.ok) {
        setUploadMessage({
          type: "success",
          text: `✅ Successfully whitelisted ${data.addedCount} new students and updated ${data.updatedCount} existing records. Telegram identity binding is now active.`,
        });
      } else {
        setUploadMessage({ type: "error", text: data.error || "Failed to commit roster upload." });
      }
    } catch {
      setUploadMessage({ type: "error", text: "Network error occurred during roster synchronization." });
    } finally {
      setIsSubmittingUpload(false);
    }
  };

  // Dispatch Telegram Warning Alert to Individual Student
  const handleSendTelegramWarning = async (student: StudentRow) => {
    setAlertingStudentId(student.id);
    try {
      const res = await fetch("/api/admin/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          attendanceRate: student.attendanceRate,
        }),
      });

      if (res.ok) {
        setDispatchedSuccessStudent(student.name);
        setTimeout(() => setDispatchedSuccessStudent(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAlertingStudentId(null);
    }
  };

  // Broadcast Warning to Batch
  const handleBroadcastBatchWarning = async () => {
    setIsSendingBroadcast(true);
    try {
      const atRiskInBatch = studentRecords.filter(
        (s) => s.batchYear === broadcastTargetBatch && s.attendanceRate < 75
      );

      for (const student of atRiskInBatch) {
        await fetch("/api/admin/alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student.id,
            customMessage: customBroadcastMessage,
            attendanceRate: student.attendanceRate,
          }),
        });
      }

      setIsBroadcastModalOpen(false);
      setDispatchedSuccessStudent(`Batch Year ${broadcastTargetBatch} At-Risk Cohort (${atRiskInBatch.length} students)`);
      setTimeout(() => setDispatchedSuccessStudent(null), 4500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  // Excuse Absence Submission
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
        setExcuseNotification(`Attendance status for ${selectedRecordForExcuse.name} reconciled to EXCUSED.`);
        setTimeout(() => {
          setSelectedRecordForExcuse(null);
          setExcuseNotification(null);
          setExcuseNote("");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingExcuse(false);
    }
  };

  const atRiskStudents = studentRecords.filter((s) => s.attendanceRate < 75);
  const filteredStudents = studentRecords.filter((s) => {
    const matchesBatch = selectedBatchFilter === "ALL" || s.batchYear === selectedBatchFilter;
    const matchesQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phoneNumber.includes(searchQuery);
    return matchesBatch && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Academic Context & Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-blue-400" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Department Leadership Console
              </span>

              {/* Academic Year Dropdown */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-0.5 text-xs text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{academicYear}</span>
              </div>

              {/* Semester Switcher Tabs */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setSelectedSemester(1)}
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-md transition-colors ${
                    selectedSemester === 1
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Semester 1
                </button>
                <button
                  onClick={() => setSelectedSemester(2)}
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-md transition-colors ${
                    selectedSemester === 2
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Semester 2
                </button>
              </div>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Department of Software Engineering
            </h1>
            <p className="text-xs text-slate-400">
              Institutional Attendance Integrity, Single-Device Telegram Binding & At-Risk Intervention
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-600/10 border border-rose-500/30 hover:bg-rose-600/20 text-rose-300 font-semibold text-xs rounded-xl transition-all"
          >
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            Broadcast At-Risk Warning
          </button>
          <a
            href={`/api/admin/export?batchYear=${selectedBatchFilter === "ALL" ? 3 : selectedBatchFilter}`}
            target="_blank"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export (.xlsx)
          </a>
          <Link
            href="/instructor"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all"
          >
            Instructor View <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Dispatched Notification Success Banner */}
      {dispatchedSuccessStudent && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center justify-between animate-in fade-in-50">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Telegram Warning dispatched to <strong>{dispatchedSuccessStudent}</strong>. Direct message logged in audit store.
            </span>
          </div>
          <button
            onClick={() => setDispatchedSuccessStudent(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary KPI Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <span className="text-xs font-medium text-slate-400">Department Attendance Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white tracking-tight">88.4%</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Good Standing
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[88.4%]" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-rose-900/30 space-y-2">
          <span className="text-xs font-medium text-slate-400">Critical Risk Students (&lt;75%)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-rose-400 tracking-tight">
              {atRiskStudents.length}
            </span>
            <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Urgent Attention
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Facing semester exam exclusion without intervention</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <span className="text-xs font-medium text-slate-400">Active Classroom Sessions</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-sky-400 tracking-tight">1</span>
            <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              SEng3112 Live
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Dynamic 15s QR + In-Class Manual Mark available</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <span className="text-xs font-medium text-slate-400">Total Enrolled Cohort</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white tracking-tight">149</span>
            <span className="text-xs font-semibold text-slate-400">Years 1–5</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Whitelisted Telegram Contact
          </p>
        </div>
      </section>

      {/* 5-BATCH COHORT HEALTH MATRIX (Years 1 to 5) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Academic Cohorts Overview (Semester {selectedSemester})
          </h2>
          <span className="text-xs text-slate-500">Click any batch card to filter records</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {batches.map((b) => (
            <div
              key={b.year}
              onClick={() => setSelectedBatchFilter(selectedBatchFilter === b.year ? "ALL" : b.year)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedBatchFilter === b.year
                  ? "bg-slate-800 border-blue-500 shadow-md shadow-blue-500/10"
                  : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{b.name}</span>
                <span
                  className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                    b.rate >= 85
                      ? "text-emerald-400 bg-emerald-500/10"
                      : b.rate >= 75
                      ? "text-amber-400 bg-amber-500/10"
                      : "text-rose-400 bg-rose-500/10"
                  }`}
                >
                  {b.rate}%
                </span>
              </div>

              <div className="my-2.5 w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    b.rate >= 85 ? "bg-emerald-500" : b.rate >= 75 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${b.rate}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{b.total} Students</span>
                <span className={b.atRisk > 0 ? "text-rose-400 font-semibold" : "text-slate-500"}>
                  {b.atRisk} At-Risk
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Feature Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab("atRisk")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "atRisk"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          🚨 Critical Warning Center ({atRiskStudents.length})
        </button>
        <button
          onClick={() => setActiveTab("roster")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "roster"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          Full Attendance Roster & Excuse
        </button>
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "upload"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Upload className="w-4 h-4" />
          Drag & Drop Student Whitelist (CSV / Excel)
        </button>
      </div>

      {/* TAB 1: CRITICAL AT-RISK ACTION CENTER */}
      {activeTab === "atRisk" && (
        <section className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                Urgent Intervention Required: Students Below 75% Threshold
              </h3>
              <p className="text-xs text-slate-300">
                You can directly call absent students on their phone or dispatch official Telegram Bot warning notifications.
              </p>
            </div>
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all shrink-0"
            >
              Broadcast Warning to All {atRiskStudents.length} Students
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">ID & Batch</th>
                  <th className="py-3.5 px-4">Telegram Phone</th>
                  <th className="py-3.5 px-4">Attendance Rate</th>
                  <th className="py-3.5 px-4">Last Status</th>
                  <th className="py-3.5 px-4 text-right">Direct Intervention Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {atRiskStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold text-xs">
                        !
                      </div>
                      <div>
                        <p>{s.name}</p>
                        {s.telegramUsername && (
                          <p className="text-[10px] text-blue-400 font-normal">@{s.telegramUsername}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {s.studentId} • <span className="font-sans text-slate-400">Year {s.batchYear}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-200">
                      {s.phoneNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-rose-400">{s.attendanceRate}%</span>
                        <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
                          CRITICAL RISK
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {s.status} ({s.date})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 1. Direct Phone Call Button */}
                        <a
                          href={`tel:${s.phoneNumber}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 font-semibold text-xs transition-colors"
                          title="Call student directly to ask why they are missing class"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call
                        </a>

                        {/* 2. Direct Telegram Warning Button */}
                        <button
                          disabled={alertingStudentId === s.id}
                          onClick={() => handleSendTelegramWarning(s)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {alertingStudentId === s.id ? "Sending..." : "Send Telegram Warning"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: FULL ATTENDANCE ROSTER & EXCUSE LOG */}
      {activeTab === "roster" && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search name, ID, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-400 font-medium">Batch Filter:</span>
              <select
                value={selectedBatchFilter}
                onChange={(e) =>
                  setSelectedBatchFilter(
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value)
                  )
                }
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Batches (Years 1–5)</option>
                <option value={1}>Year 1 (Freshman)</option>
                <option value={2}>Year 2 (Sophomore)</option>
                <option value={3}>Year 3 (Junior)</option>
                <option value={4}>Year 4 (Senior)</option>
                <option value={5}>Year 5 (Finalists)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Telegram Phone</th>
                  <th className="py-3 px-4">Recent Status</th>
                  <th className="py-3 px-4">Attendance Rate</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                        {s.name[0]}
                      </div>
                      {s.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{s.studentId}</td>
                    <td className="py-3 px-4">Year {s.batchYear}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{s.phoneNumber}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
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
                      <span
                        className={`font-bold ${
                          s.attendanceRate >= 85
                            ? "text-emerald-400"
                            : s.attendanceRate >= 75
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {s.attendanceRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {s.status === "ABSENT" ? (
                        <button
                          onClick={() => setSelectedRecordForExcuse(s)}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Reconcile / Excuse
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Reconciled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: DRAG & DROP ROSTER INGESTION */}
      {activeTab === "upload" && (
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-400" />
              Drag & Drop Student Roster Whitelisting
            </h2>
            <p className="text-xs text-slate-400">
              Upload class roster files (.csv, .xlsx, .xls). Telegram phone numbers are automatically normalized and serve as the single-device hardware anchor.
            </p>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-10 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
              isDragging
                ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">
                {uploadFileName ? `Selected: ${uploadFileName}` : "Drag and drop your roster file here"}
              </p>
              <p className="text-xs text-slate-400">
                Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
            >
              Browse Local File
            </button>
          </div>

          {/* Upload Status Banner */}
          {uploadMessage && (
            <div
              className={`p-4 rounded-2xl border text-xs font-semibold ${
                uploadMessage.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-950/40 border-rose-500/30 text-rose-300"
              }`}
            >
              {uploadMessage.text}
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedUploadRows.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Roster File Preview ({parsedUploadRows.length} Students Detected)
                </h3>
                <button
                  disabled={isSubmittingUpload}
                  onClick={handleCommitUpload}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                >
                  {isSubmittingUpload ? "Synchronizing Whitelist..." : "Confirm & Synchronize Whitelist"}
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Full Name</th>
                      <th className="py-2.5 px-4">Student ID</th>
                      <th className="py-2.5 px-4">Telegram Phone Number</th>
                      <th className="py-2.5 px-4">Batch</th>
                      <th className="py-2.5 px-4">Semester</th>
                      <th className="py-2.5 px-4 text-right">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {parsedUploadRows.slice(0, 8).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 font-sans font-semibold text-white">
                          {row.fullName}
                        </td>
                        <td className="py-2.5 px-4 text-slate-300">{row.studentId}</td>
                        <td className="py-2.5 px-4 text-slate-200">{row.phoneNumber}</td>
                        <td className="py-2.5 px-4 font-sans">Year {row.batchYear}</td>
                        <td className="py-2.5 px-4 font-sans">Sem {row.semester}</td>
                        <td className="py-2.5 px-4 text-right font-sans">
                          {row.isValidPhone ? (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              Valid E.164
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                              Check Format
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedUploadRows.length > 8 && (
                <p className="text-[11px] text-slate-500 text-center">
                  Showing 8 of {parsedUploadRows.length} parsed records...
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* BROADCAST AT-RISK WARNING MODAL */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-lg w-full space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-500" />
                  Broadcast Urgent Telegram Warning
                </h3>
                <p className="text-xs text-slate-400">
                  Sends an official direct notification to all at-risk students in a batch.
                </p>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select Target Batch</label>
              <select
                value={broadcastTargetBatch}
                onChange={(e) => setBroadcastTargetBatch(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value={1}>Year 1 (Freshman)</option>
                <option value={2}>Year 2 (Sophomore)</option>
                <option value={3}>Year 3 (Junior - 3 At-Risk Students)</option>
                <option value={4}>Year 4 (Senior)</option>
                <option value={5}>Year 5 (Finalists - 5 At-Risk Students)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Warning Message (Amharic & English)</label>
              <textarea
                rows={4}
                value={customBroadcastMessage}
                onChange={(e) => setCustomBroadcastMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={isSendingBroadcast}
                onClick={handleBroadcastBatchWarning}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {isSendingBroadcast ? "Dispatching..." : "Dispatch Broadcast Warning"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXCUSE RECONCILIATION MODAL */}
      {selectedRecordForExcuse && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-lg w-full space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-amber-400" />
                  Absence Reconciliation & Excuse Override
                </h3>
                <p className="text-xs text-slate-400">
                  Update an unverified absence to EXCUSED with audit documentation.
                </p>
              </div>
              <button
                onClick={() => setSelectedRecordForExcuse(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 text-xs">
              <p>
                <strong className="text-slate-400">Student:</strong>{" "}
                <span className="text-white font-bold">{selectedRecordForExcuse.name}</span> (
                {selectedRecordForExcuse.studentId})
              </p>
              <p>
                <strong className="text-slate-400">Phone:</strong>{" "}
                <span className="text-slate-200 font-mono">{selectedRecordForExcuse.phoneNumber}</span>
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
              />
            </div>

            {excuseNotification && (
              <p className="text-xs text-emerald-400 font-semibold">{excuseNotification}</p>
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
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
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
