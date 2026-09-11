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
  BookOpen,
  Check,
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

interface FacultyComplianceRow {
  facultyName: string;
  courseCode: string;
  courseTitle: string;
  batchYear: number;
  scheduledTime: string;
  sessionStatus: "COMPLETED" | "LIVE" | "NOT_OPENED";
  attendanceTaken: boolean;
  markedStudents: number;
  totalEnrolled: number;
}

export default function DepartmentHeadDashboard() {
  // Institution & Department Selection
  const [selectedDepartment, setSelectedDepartment] = useState("Software Engineering");

  // Academic Hierarchy States
  const [academicYear, setAcademicYear] = useState("2025/2026");
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"atRisk" | "facultyCompliance" | "roster" | "upload">("atRisk");

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
    "Official Notice from Injibara University Department Office: Your attendance is currently below 75%. Please report to the department head office immediately to avoid exam exclusion."
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

  // Faculty Daily Compliance Monitoring Data
  const facultyComplianceData: FacultyComplianceRow[] = [
    {
      facultyName: "Dr. Yared Tadesse",
      courseCode: "SEng3112",
      courseTitle: "Software Requirements Engineering",
      batchYear: 3,
      scheduledTime: "08:30 - 10:00 AM",
      sessionStatus: "LIVE",
      attendanceTaken: true,
      markedStudents: 24,
      totalEnrolled: 28,
    },
    {
      facultyName: "Ins. Henok Alemu",
      courseCode: "SEng1101",
      courseTitle: "Intro to Computing",
      batchYear: 1,
      scheduledTime: "10:30 - 12:00 PM",
      sessionStatus: "COMPLETED",
      attendanceTaken: true,
      markedStudents: 34,
      totalEnrolled: 35,
    },
    {
      facultyName: "Ins. Selamawit Gizaw",
      courseCode: "SEng2104",
      courseTitle: "Data Structures & Algorithms",
      batchYear: 2,
      scheduledTime: "01:30 - 03:00 PM",
      sessionStatus: "NOT_OPENED",
      attendanceTaken: false,
      markedStudents: 0,
      totalEnrolled: 32,
    },
    {
      facultyName: "Dr. Biruk Bekele",
      courseCode: "SEng5102",
      courseTitle: "Senior Capstone Project II",
      batchYear: 5,
      scheduledTime: "03:30 - 05:00 PM",
      sessionStatus: "NOT_OPENED",
      attendanceTaken: false,
      markedStudents: 0,
      totalEnrolled: 24,
    },
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
          text: `✅ Successfully whitelisted ${data.addedCount} new students and updated ${data.updatedCount} records. Telegram identity binding is active.`,
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
    <div className="min-h-screen bg-[#F9F6F0] text-[#2C221E] p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Academic Context & Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#EADBCE] pb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FBF2DE] border border-[#B8860B]/30 flex items-center justify-center shrink-0 shadow-sm">
            <Building2 className="w-7 h-7 text-[#B8860B]" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FBF2DE] text-[#B8860B] border border-[#B8860B]/30">
                Injibara University
              </span>

              {/* Department Switcher */}
              <div className="flex items-center gap-1 bg-[#FFFFFF] border border-[#EADBCE] rounded-lg px-2.5 py-0.5 text-xs text-[#2C221E] font-bold shadow-sm">
                <span className="text-[#706259] font-medium">Dept:</span>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="bg-transparent font-bold text-[#2C221E] focus:outline-none cursor-pointer"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                </select>
              </div>

              {/* Academic Year Selector */}
              <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#EADBCE] rounded-lg px-2.5 py-1 text-xs text-[#706259] font-bold shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>{academicYear}</span>
              </div>

              {/* Semester Switcher Tabs */}
              <div className="flex items-center bg-[#ECE4D8] border border-[#EADBCE] rounded-xl p-1">
                <button
                  onClick={() => setSelectedSemester(1)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedSemester === 1
                      ? "bg-[#B8860B] text-white shadow-sm"
                      : "text-[#706259] hover:text-[#2C221E]"
                  }`}
                >
                  Semester 1
                </button>
                <button
                  onClick={() => setSelectedSemester(2)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedSemester === 2
                      ? "bg-[#B8860B] text-white shadow-sm"
                      : "text-[#706259] hover:text-[#2C221E]"
                  }`}
                >
                  Semester 2
                </button>
              </div>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-[#2C221E]">
              Department Head Console • {selectedDepartment}
            </h1>
            <p className="text-xs text-[#706259] font-medium">
              Academic Cohort Oversight, Telegram Bot Broadcasts, Faculty Compliance & Roster Control
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FAEAE9] border border-[#F8D7DA] hover:bg-[#F8D7DA] text-[#B83833] font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <AlertOctagon className="w-4 h-4 text-[#B83833]" />
            Send Broadcast Warning
          </button>
          <a
            href={`/api/admin/export?batchYear=${selectedBatchFilter === "ALL" ? 3 : selectedBatchFilter}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FFFFFF] border border-[#EADBCE] hover:border-[#B8860B] text-[#2C221E] font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-[#1E7E53]" />
            Export Report (.xlsx)
          </a>
          <Link
            href="/instructor"
            className="flex items-center gap-2 px-4 py-2.5 btn-ochre text-xs font-bold rounded-xl shadow-md transition-all"
          >
            Instructor View <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Dispatched Notification Success Banner */}
      {dispatchedSuccessStudent && (
        <div className="p-4 rounded-2xl bg-[#E8F3EE] border border-[#C2E8CA] text-[#1E7E53] flex items-center justify-between animate-in fade-in-50">
          <div className="flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#1E7E53] shrink-0" />
            <span>
              Telegram Warning dispatched successfully to <strong>{dispatchedSuccessStudent}</strong>.
            </span>
          </div>
          <button
            onClick={() => setDispatchedSuccessStudent(null)}
            className="text-[#1E7E53] hover:text-[#166542]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary KPI Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="warm-card p-5 space-y-2">
          <span className="text-xs font-bold text-[#706259]">Overall Department Attendance</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#2C221E] tracking-tight">88.4%</span>
            <span className="text-xs font-bold text-[#1E7E53] bg-[#E8F3EE] px-2.5 py-0.5 rounded-lg border border-[#C2E8CA]">
              Good Standing
            </span>
          </div>
          <div className="w-full h-2 bg-[#F4EFE6] rounded-full overflow-hidden">
            <div className="h-full bg-[#1E7E53] rounded-full w-[88.4%]" />
          </div>
        </div>

        <div className="warm-card p-5 space-y-2 border-l-4 border-l-[#B83833]">
          <span className="text-xs font-bold text-[#706259]">Critical Risk Cohort (&lt;75%)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#B83833] tracking-tight">
              {atRiskStudents.length} Students
            </span>
            <span className="text-xs font-bold text-[#B83833] bg-[#FAEAE9] px-2.5 py-0.5 rounded-lg border border-[#F8D7DA]">
              Action Required
            </span>
          </div>
          <p className="text-[11px] text-[#706259] font-medium">Students falling below exam eligibility criteria</p>
        </div>

        <div className="warm-card p-5 space-y-2">
          <span className="text-xs font-bold text-[#706259]">Active Lecture Sessions</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#B8860B] tracking-tight">1</span>
            <span className="text-xs font-bold text-[#B8860B] bg-[#FBF2DE] px-2.5 py-0.5 rounded-lg border border-[#B8860B]/30">
              SEng3112 Live
            </span>
          </div>
          <p className="text-[11px] text-[#706259] font-medium">Dynamic 15s QR + In-class manual mark cap active</p>
        </div>

        <div className="warm-card p-5 space-y-2">
          <span className="text-xs font-bold text-[#706259]">Total Whitelisted Students</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#2C221E] tracking-tight">149</span>
            <span className="text-xs font-bold text-[#706259] bg-[#F4EFE6] px-2.5 py-0.5 rounded-lg border border-[#EADBCE]">
              Batches 1–5
            </span>
          </div>
          <p className="text-[11px] text-[#1E7E53] font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E7E53]" /> 100% Telegram Bound
          </p>
        </div>
      </section>

      {/* 5-BATCH COHORT HEALTH MATRIX (Years 1 to 5) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-[#706259] uppercase tracking-wider">
            5-Year Batch Cohort Matrix • Semester {selectedSemester} Overview
          </h2>
          <span className="text-xs text-[#706259] font-medium">Click batch cards to filter table</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {batches.map((b) => (
            <div
              key={b.year}
              onClick={() => setSelectedBatchFilter(selectedBatchFilter === b.year ? "ALL" : b.year)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedBatchFilter === b.year
                  ? "bg-[#FFFFFF] border-[#B8860B] ring-2 ring-[#B8860B]/30 shadow-md"
                  : "bg-[#FFFFFF] border-[#EADBCE] hover:border-[#B8860B] shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#2C221E]">{b.name}</span>
                <span
                  className={`font-black px-2 py-0.5 rounded-lg text-xs ${
                    b.rate >= 85
                      ? "text-[#1E7E53] bg-[#E8F3EE]"
                      : b.rate >= 75
                      ? "text-[#B8860B] bg-[#FBF2DE]"
                      : "text-[#B83833] bg-[#FAEAE9]"
                  }`}
                >
                  {b.rate}%
                </span>
              </div>

              <div className="my-2.5 w-full h-2 bg-[#F4EFE6] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    b.rate >= 85 ? "bg-[#1E7E53]" : b.rate >= 75 ? "bg-[#B8860B]" : "bg-[#B83833]"
                  }`}
                  style={{ width: `${b.rate}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#706259] font-medium">
                <span>{b.total} Students</span>
                <span className={b.atRisk > 0 ? "text-[#B83833] font-bold" : "text-[#706259]"}>
                  {b.atRisk} At Risk
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Feature Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#EADBCE] pb-3">
        <button
          onClick={() => setActiveTab("atRisk")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "atRisk"
              ? "bg-[#B83833] text-white shadow-md"
              : "text-[#706259] hover:text-[#2C221E] bg-[#FFFFFF] border border-[#EADBCE]"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Critical At-Risk Center ({atRiskStudents.length})
        </button>
        <button
          onClick={() => setActiveTab("facultyCompliance")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "facultyCompliance"
              ? "btn-ochre shadow-md"
              : "text-[#706259] hover:text-[#2C221E] bg-[#FFFFFF] border border-[#EADBCE]"
          }`}
        >
          <Clock className="w-4 h-4" />
          Faculty Daily Compliance Monitor
        </button>
        <button
          onClick={() => setActiveTab("roster")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "roster"
              ? "btn-ochre shadow-md"
              : "text-[#706259] hover:text-[#2C221E] bg-[#FFFFFF] border border-[#EADBCE]"
          }`}
        >
          <Users className="w-4 h-4" />
          Master Student Roster & Excuses
        </button>
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "upload"
              ? "btn-ochre shadow-md"
              : "text-[#706259] hover:text-[#2C221E] bg-[#FFFFFF] border border-[#EADBCE]"
          }`}
        >
          <Upload className="w-4 h-4" />
          Drag & Drop Whitelist Ingestion (Excel/CSV)
        </button>
      </div>

      {/* TAB 1: CRITICAL AT-RISK ACTION CENTER */}
      {activeTab === "atRisk" && (
        <section className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#FAEAE9] border border-[#F8D7DA] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-[#B83833] flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-[#B83833]" />
                Students At Risk of Examination Bar (&lt; 75% Attendance)
              </h3>
              <p className="text-xs text-[#706259]">
                Intervene directly via phone call or dispatch official Telegram warnings backed by institutional records.
              </p>
            </div>
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="px-4 py-2.5 bg-[#B83833] hover:bg-[#9E2A26] text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
            >
              Broadcast Warning to All {atRiskStudents.length} Students
            </button>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[#EADBCE] bg-[#FFFFFF] shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF2DE] text-[#706259] font-bold border-b border-[#EADBCE]">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Student ID & Cohort</th>
                  <th className="py-3.5 px-4">Telegram Bound Phone</th>
                  <th className="py-3.5 px-4">Attendance Rate</th>
                  <th className="py-3.5 px-4">Last Status</th>
                  <th className="py-3.5 px-4 text-right">Intervention Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {atRiskStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F9F6F0] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#2C221E] flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#FAEAE9] text-[#B83833] border border-[#F8D7DA] flex items-center justify-center font-black text-xs">
                        !
                      </div>
                      <div>
                        <p>{s.name}</p>
                        {s.telegramUsername && (
                          <p className="text-[10px] text-[#B8860B] font-medium">@{s.telegramUsername}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#706259] font-mono">
                      {s.studentId} • <span className="font-sans font-bold text-[#2C221E]">Year {s.batchYear}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-[#2C221E]">
                      {s.phoneNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#B83833]">{s.attendanceRate}%</span>
                        <span className="text-[10px] font-black text-[#B83833] bg-[#FAEAE9] px-2 py-0.5 rounded-md border border-[#F8D7DA]">
                          CRITICAL RISK
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-[#FAEAE9] text-[#B83833] border border-[#F8D7DA]">
                        {s.status} ({s.date})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 1. Direct Phone Call Button */}
                        <a
                          href={`tel:${s.phoneNumber}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F3EE] hover:bg-[#C2E8CA] text-[#1E7E53] border border-[#C2E8CA] font-bold text-xs transition-colors"
                          title="Call student phone"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call
                        </a>

                        {/* 2. Direct Telegram Warning Button */}
                        <button
                          disabled={alertingStudentId === s.id}
                          onClick={() => handleSendTelegramWarning(s)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B83833] hover:bg-[#9E2A26] text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {alertingStudentId === s.id ? "Sending..." : "Send Warning"}
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

      {/* TAB 2: FACULTY DAILY COMPLIANCE MONITOR */}
      {activeTab === "facultyCompliance" && (
        <section className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#FBF2DE] border border-[#B8860B]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-[#2C221E] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#B8860B]" />
                Daily Lecture Attendance Compliance Log (Today's Scheduled Classes)
              </h3>
              <p className="text-xs text-[#706259]">
                Verify whether instructors have launched attendance sessions and logged student turnout for their assigned lecture slots.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1E7E53] bg-[#E8F3EE] px-3 py-1.5 rounded-xl border border-[#C2E8CA]">
              <CheckCircle2 className="w-4 h-4" /> 2 of 4 Sessions Completed Today
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[#EADBCE] bg-[#FFFFFF] shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF2DE] text-[#706259] font-bold border-b border-[#EADBCE]">
                <tr>
                  <th className="py-3 px-4">Instructor Name</th>
                  <th className="py-3 px-4">Course & Code</th>
                  <th className="py-3 px-4">Batch Cohort</th>
                  <th className="py-3 px-4">Scheduled Slot</th>
                  <th className="py-3 px-4">Session Status</th>
                  <th className="py-3 px-4">Turnout / Registered</th>
                  <th className="py-3 px-4 text-right">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {facultyComplianceData.map((f, i) => (
                  <tr key={i} className="hover:bg-[#F9F6F0] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#2C221E]">{f.facultyName}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#B8860B] mr-1.5">{f.courseCode}</span>
                      <span className="text-[#706259]">{f.courseTitle}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#2C221E]">Year {f.batchYear}</td>
                    <td className="py-3 px-4 font-mono text-[#706259]">{f.scheduledTime}</td>
                    <td className="py-3 px-4">
                      {f.sessionStatus === "LIVE" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E8F3EE] text-[#1E7E53] border border-[#C2E8CA] flex items-center gap-1.5 w-fit">
                          <span className="w-2 h-2 rounded-full bg-[#1E7E53] animate-pulse" />
                          Session Live
                        </span>
                      ) : f.sessionStatus === "COMPLETED" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F4EFE6] text-[#706259] border border-[#EADBCE] w-fit">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FAEAE9] text-[#B83833] border border-[#F8D7DA] w-fit">
                          Pending Start
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#2C221E]">
                      {f.markedStudents} / {f.totalEnrolled}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {f.attendanceTaken ? (
                        <span className="text-xs font-bold text-[#1E7E53] flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Compliant
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-[#B83833] flex items-center justify-end gap-1">
                          <Clock className="w-4 h-4" /> Not Initiated
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: FULL ATTENDANCE ROSTER & EXCUSE LOG */}
      {activeTab === "roster" && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#706259] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search student by name, ID or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl pl-10 pr-4 py-2 text-xs text-[#2C221E] placeholder-[#A6978A] focus:outline-none focus:border-[#B8860B] shadow-sm font-medium"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-[#706259] font-bold">Filter Batch:</span>
              <select
                value={selectedBatchFilter}
                onChange={(e) =>
                  setSelectedBatchFilter(
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value)
                  )
                }
                className="bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-1.5 text-xs text-[#2C221E] font-medium focus:outline-none focus:border-[#B8860B] shadow-sm"
              >
                <option value="ALL">All Cohorts (Years 1–5)</option>
                <option value={1}>Year 1 (Freshman)</option>
                <option value={2}>Year 2 (Sophomore)</option>
                <option value={3}>Year 3 (Junior)</option>
                <option value={4}>Year 4 (Senior)</option>
                <option value={5}>Year 5 (Finalists)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[#EADBCE] bg-[#FFFFFF] shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF2DE] text-[#706259] font-bold border-b border-[#EADBCE]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Telegram Phone</th>
                  <th className="py-3 px-4">Recent Status</th>
                  <th className="py-3 px-4">Attendance Rate</th>
                  <th className="py-3 px-4 text-right">Head Excuse Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F9F6F0] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#2C221E] flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#F4EFE6] text-[#706259] flex items-center justify-center font-bold text-xs border border-[#EADBCE]">
                        {s.name[0]}
                      </div>
                      {s.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#706259]">{s.studentId}</td>
                    <td className="py-3 px-4 font-bold text-[#2C221E]">Year {s.batchYear}</td>
                    <td className="py-3 px-4 font-mono text-[#706259]">{s.phoneNumber}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          s.status === "PRESENT"
                            ? "bg-[#E8F3EE] text-[#1E7E53] border border-[#C2E8CA]"
                            : s.status === "EXCUSED"
                            ? "bg-[#FBF2DE] text-[#B8860B] border border-[#B8860B]/30"
                            : "bg-[#FAEAE9] text-[#B83833] border border-[#F8D7DA]"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-black ${
                          s.attendanceRate >= 85
                            ? "text-[#1E7E53]"
                            : s.attendanceRate >= 75
                            ? "text-[#B8860B]"
                            : "text-[#B83833]"
                        }`}
                      >
                        {s.attendanceRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {s.status === "ABSENT" ? (
                        <button
                          onClick={() => setSelectedRecordForExcuse(s)}
                          className="px-3 py-1 bg-[#FBF2DE] hover:bg-[#B8860B] hover:text-white text-[#B8860B] border border-[#B8860B]/30 rounded-xl text-xs font-bold transition-all"
                        >
                          Excuse Absence
                        </button>
                      ) : (
                        <span className="text-[#A6978A] text-[11px] font-medium">Reconciled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 4: DRAG & DROP ROSTER INGESTION */}
      {activeTab === "upload" && (
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-black text-[#2C221E] flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#B8860B]" />
              Roster Whitelist Ingestion (Excel & CSV Drag & Drop)
            </h2>
            <p className="text-xs text-[#706259]">
              Upload batch class rosters (.csv, .xlsx). Phone numbers are automatically verified and bound to students' Telegram identities.
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
                ? "border-[#B8860B] bg-[#FBF2DE] scale-[1.01]"
                : "border-[#EADBCE] bg-[#FFFFFF] hover:border-[#B8860B] shadow-sm"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-[#FBF2DE] text-[#B8860B] border border-[#B8860B]/30 flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#2C221E]">
                {uploadFileName ? `Selected File: ${uploadFileName}` : "Drag & drop roster spreadsheet here, or click to browse"}
              </p>
              <p className="text-xs text-[#706259]">
                Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-[#F4EFE6] hover:bg-[#EADBCE] text-[#2C221E] font-bold text-xs rounded-xl transition-colors"
            >
              Browse Files from Computer
            </button>
          </div>

          {/* Upload Status Banner */}
          {uploadMessage && (
            <div
              className={`p-4 rounded-2xl border text-xs font-semibold ${
                uploadMessage.type === "success"
                  ? "bg-[#E8F3EE] border-[#C2E8CA] text-[#1E7E53]"
                  : "bg-[#FAEAE9] border-[#F8D7DA] text-[#B83833]"
              }`}
            >
              {uploadMessage.text}
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedUploadRows.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#706259] uppercase tracking-wider">
                  Roster Whitelist Preview ({parsedUploadRows.length} Students Parsed)
                </h3>
                <button
                  disabled={isSubmittingUpload}
                  onClick={handleCommitUpload}
                  className="px-5 py-2.5 btn-ochre text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmittingUpload ? "Synchronizing..." : "Confirm & Whitelist Roster"}
                </button>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-[#EADBCE] bg-[#FFFFFF] shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FBF2DE] text-[#706259] font-bold border-b border-[#EADBCE]">
                    <tr>
                      <th className="py-2.5 px-4">Full Name</th>
                      <th className="py-2.5 px-4">Student ID</th>
                      <th className="py-2.5 px-4">Telegram Phone</th>
                      <th className="py-2.5 px-4">Batch</th>
                      <th className="py-2.5 px-4">Semester</th>
                      <th className="py-2.5 px-4 text-right">E.164 Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADBCE] font-mono">
                    {parsedUploadRows.slice(0, 8).map((row, i) => (
                      <tr key={i} className="hover:bg-[#F9F6F0]">
                        <td className="py-2.5 px-4 font-sans font-bold text-[#2C221E]">
                          {row.fullName}
                        </td>
                        <td className="py-2.5 px-4 text-[#706259]">{row.studentId}</td>
                        <td className="py-2.5 px-4 text-[#2C221E]">{row.phoneNumber}</td>
                        <td className="py-2.5 px-4 font-sans font-medium text-[#706259]">Year {row.batchYear}</td>
                        <td className="py-2.5 px-4 font-sans font-medium text-[#706259]">Sem {row.semester}</td>
                        <td className="py-2.5 px-4 text-right font-sans">
                          {row.isValidPhone ? (
                            <span className="text-[10px] font-bold text-[#1E7E53] bg-[#E8F3EE] px-2 py-0.5 rounded-md border border-[#C2E8CA]">
                              Valid E.164
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-[#B8860B] bg-[#FBF2DE] px-2 py-0.5 rounded-md border border-[#B8860B]/30">
                              Verify Format
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedUploadRows.length > 8 && (
                <p className="text-[11px] text-[#706259] text-center font-medium">
                  Showing 8 of {parsedUploadRows.length} parsed records...
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* BROADCAST AT-RISK WARNING MODAL */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 bg-[#2C221E]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EADBCE] shadow-2xl max-w-lg w-full space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#2C221E] flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-[#B83833]" />
                  Broadcast Telegram Attendance Warning
                </h3>
                <p className="text-xs text-[#706259]">
                  Send official warning messages via the Telegram Bot to all students below 75% attendance.
                </p>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-1 rounded-xl text-[#706259] hover:text-[#2C221E] hover:bg-[#F4EFE6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#706259]">Target Cohort / Batch</label>
              <select
                value={broadcastTargetBatch}
                onChange={(e) => setBroadcastTargetBatch(Number(e.target.value))}
                className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2 text-xs text-[#2C221E] font-medium focus:outline-none focus:border-[#B8860B]"
              >
                <option value={1}>Year 1 (Freshman)</option>
                <option value={2}>Year 2 (Sophomore)</option>
                <option value={3}>Year 3 (Junior - 3 Students at Risk)</option>
                <option value={4}>Year 4 (Senior)</option>
                <option value={5}>Year 5 (Finalists - 5 Students at Risk)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#706259]">Warning Message Content</label>
              <textarea
                rows={4}
                value={customBroadcastMessage}
                onChange={(e) => setCustomBroadcastMessage(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl p-3 text-xs text-[#2C221E] focus:outline-none focus:border-[#B8860B] font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#706259] hover:text-[#2C221E]"
              >
                Cancel
              </button>
              <button
                disabled={isSendingBroadcast}
                onClick={handleBroadcastBatchWarning}
                className="px-4 py-2.5 bg-[#B83833] hover:bg-[#9E2A26] text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isSendingBroadcast ? "Dispatching..." : "Send Telegram Warning Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXCUSE RECONCILIATION MODAL */}
      {selectedRecordForExcuse && (
        <div className="fixed inset-0 bg-[#2C221E]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EADBCE] shadow-2xl max-w-lg w-full space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#2C221E] flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-[#B8860B]" />
                  Absence Excuse & Documentation Reconciliation
                </h3>
                <p className="text-xs text-[#706259]">
                  Reconcile unverified absence to EXCUSED upon presentation of university clinic or dean approval.
                </p>
              </div>
              <button
                onClick={() => setSelectedRecordForExcuse(null)}
                className="p-1 rounded-xl text-[#706259] hover:text-[#2C221E] hover:bg-[#F4EFE6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FBF2DE] p-4 rounded-2xl border border-[#B8860B]/30 space-y-1 text-xs">
              <p>
                <strong className="text-[#706259]">Student:</strong>{" "}
                <span className="text-[#2C221E] font-black">{selectedRecordForExcuse.name}</span> (
                {selectedRecordForExcuse.studentId})
              </p>
              <p>
                <strong className="text-[#706259]">Telegram Phone:</strong>{" "}
                <span className="text-[#2C221E] font-mono font-bold">{selectedRecordForExcuse.phoneNumber}</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#706259]">
                Official Documentation Reference / Reason <span className="text-[#B83833]">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g., Verified medical certificate issued by Injibara University Student Clinic (Ref: INJ-MED-2026-104)..."
                value={excuseNote}
                onChange={(e) => setExcuseNote(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl p-3 text-xs text-[#2C221E] focus:outline-none focus:border-[#B8860B] placeholder-[#A6978A]"
              />
            </div>

            {excuseNotification && (
              <p className="text-xs text-[#1E7E53] font-bold p-2.5 bg-[#E8F3EE] rounded-xl border border-[#C2E8CA]">
                {excuseNotification}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedRecordForExcuse(null)}
                className="px-4 py-2 text-xs font-bold text-[#706259] hover:text-[#2C221E]"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingExcuse || excuseNote.trim().length < 5}
                onClick={handleSubmitExcuse}
                className="px-4 py-2.5 btn-ochre text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isSubmittingExcuse ? "Submitting..." : "Approve & Mark Excused"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
