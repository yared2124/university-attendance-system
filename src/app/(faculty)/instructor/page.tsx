"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
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
  UserPlus,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  X,
  Upload,
  Search,
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

interface StudentRosterItem {
  id: string;
  fullName: string;
  studentId: string;
  phoneNumber: string;
  batchYear: number;
  attendanceRate: number;
  status: "GOOD_STANDING" | "LOW_ATTENDANCE";
}

export default function InstructorDashboard() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  // Batch Filter & Course Selection
  const [selectedBatchYear, setSelectedBatchYear] = useState<number>(1);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("course_4");
  const [sessionType, setSessionType] = useState<"Morning Lecture" | "Afternoon Lab" | "Make-up Class">("Morning Lecture");
  const [sessionMode, setSessionMode] = useState<"DYNAMIC_QR" | "ROLLING_CODE">("DYNAMIC_QR");
  const [duration, setDuration] = useState<number>(15);

  // Enrolled Students Roster State
  const [rosterStudents, setRosterStudents] = useState<StudentRosterItem[]>([]);
  const [rosterSearch, setRosterSearch] = useState("");
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  // Student Registration Modals (Manual Entry & Drag-and-Drop)
  const [isManualStudentModalOpen, setIsManualStudentModalOpen] = useState(false);
  const [isUploadRosterModalOpen, setIsUploadRosterModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentId, setNewStudentId] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("+2519");
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [studentActionSuccess, setStudentActionSuccess] = useState<string | null>(null);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);

  const assignedCourses: CourseItem[] = [
    {
      id: "course_4",
      code: "SEng1101",
      title: "Introduction to Software Engineering",
      batchYear: 1,
      studentsCount: 35,
      activeSessionId: null,
      scheduleSlot: "Mon/Wed 08:30 - 10:00",
    },
    {
      id: "course_8",
      code: "SEng1103",
      title: "Structured Programming Fundamentals",
      batchYear: 1,
      studentsCount: 35,
      activeSessionId: null,
      scheduleSlot: "Tue/Thu 10:30 - 12:00",
    },
    {
      id: "course_3",
      code: "SEng2104",
      title: "Data Structures & Algorithms",
      batchYear: 2,
      studentsCount: 32,
      activeSessionId: null,
      scheduleSlot: "Tue/Thu 08:30 - 10:00",
    },
    {
      id: "course_7",
      code: "SEng2202",
      title: "Object-Oriented Design & Programming",
      batchYear: 2,
      studentsCount: 32,
      activeSessionId: null,
      scheduleSlot: "Mon/Wed 14:00 - 15:30",
    },
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
      id: "course_6",
      code: "SEng3201",
      title: "Software Architecture & Design Patterns",
      batchYear: 3,
      studentsCount: 28,
      activeSessionId: null,
      scheduleSlot: "Tue/Thu 10:30 - 12:00",
    },
    {
      id: "course_2",
      code: "SEng4111",
      title: "Cloud Computing & Microservices",
      batchYear: 4,
      studentsCount: 30,
      activeSessionId: null,
      scheduleSlot: "Fri 09:00 - 12:00",
    },
    {
      id: "course_5",
      code: "SEng5102",
      title: "Senior Capstone System Architecture",
      batchYear: 5,
      studentsCount: 24,
      activeSessionId: null,
      scheduleSlot: "Wed 14:00 - 17:00",
    },
  ];

  // Filter courses by chosen batch
  const batchCourses = assignedCourses.filter((c) => c.batchYear === selectedBatchYear);
  const activeCourse = batchCourses.find((c) => c.id === selectedCourseId) || batchCourses[0];

  // Fetch student roster for batch
  const fetchBatchRoster = async (batchYear: number, courseId: string) => {
    setIsLoadingRoster(true);
    try {
      const res = await fetch(`/api/instructor/students?batchYear=${batchYear}&courseId=${courseId}`);
      const data = await res.json();
      if (res.ok && data.students) {
        setRosterStudents(data.students);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRoster(false);
    }
  };

  useEffect(() => {
    fetchBatchRoster(selectedBatchYear, selectedCourseId);
  }, [selectedBatchYear, selectedCourseId]);

  // Handle batch change
  const handleBatchChange = (batchYear: number) => {
    setSelectedBatchYear(batchYear);
    const matching = assignedCourses.filter((c) => c.batchYear === batchYear);
    if (matching.length > 0) {
      setSelectedCourseId(matching[0].id);
    }
  };

  // Launch in-page attendance session
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

  // Manual Student Registration by Instructor
  const handleManualStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingStudent(true);
    try {
      const res = await fetch("/api/instructor/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newStudentName,
          studentId: newStudentId,
          phoneNumber: newStudentPhone,
          batchYear: selectedBatchYear,
          courseId: selectedCourseId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.student) {
        setStudentActionSuccess(`✅ Student ${newStudentName} registered in Year ${selectedBatchYear} roster.`);
        setIsManualStudentModalOpen(false);
        setNewStudentName("");
        setNewStudentId("");
        setNewStudentPhone("+2519");
        fetchBatchRoster(selectedBatchYear, selectedCourseId);
        setTimeout(() => setStudentActionSuccess(null), 4000);
      }
    } catch {
      alert("Failed to register student.");
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  // Excel / CSV File Drop Registration
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUploadFile(files[0]);
    }
  };

  const processUploadFile = async (file: File) => {
    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        for (const row of json) {
          const fullName = String(row["fullName"] || row["name"] || row["Full Name"] || "Student");
          const studentId = String(row["studentId"] || row["id"] || row["Student ID"] || "UGR/TEMP");
          const rawPhone = String(row["phoneNumber"] || row["phone"] || row["Phone Number"] || "+251911000000");

          await fetch("/api/instructor/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullName,
              studentId,
              phoneNumber: rawPhone.startsWith("+") ? rawPhone : `+251${rawPhone.replace(/^0/, "")}`,
              batchYear: selectedBatchYear,
              courseId: selectedCourseId,
            }),
          });
        }

        setStudentActionSuccess(`✅ Successfully whitelisted ${json.length} students from ${file.name} into Year ${selectedBatchYear} roster.`);
        setIsUploadRosterModalOpen(false);
        fetchBatchRoster(selectedBatchYear, selectedCourseId);
        setTimeout(() => setStudentActionSuccess(null), 5000);
      } catch {
        alert("Failed to parse roster file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const filteredStudents = rosterStudents.filter(
    (s) =>
      s.fullName.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      s.studentId.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      s.phoneNumber.includes(rosterSearch)
  );

  const lowAttendanceStudents = rosterStudents.filter((s) => s.attendanceRate < 80);

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#2C221E] p-6 md:p-10 max-w-7xl mx-auto space-y-8">
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
          <Link
            href="/login"
            className="px-3 py-2 bg-[#FFFFFF] border border-[#EADBCE] hover:border-[#B8860B] text-[#706259] text-xs font-bold rounded-xl shadow-sm transition-all"
            title="Sign Out / Switch Account"
          >
            Sign Out
          </Link>
        </div>
      </header>

      {/* Success Notification Banner */}
      {studentActionSuccess && (
        <div className="p-4 rounded-2xl bg-[#E8F3EE] border border-[#C2E8CA] text-[#1E7E53] flex items-center justify-between animate-in fade-in-50">
          <div className="flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#1E7E53] shrink-0" />
            <span>{studentActionSuccess}</span>
          </div>
          <button
            onClick={() => setStudentActionSuccess(null)}
            className="text-[#1E7E53] hover:text-[#166542]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
            { year: 1, label: "Year 1", sub: "Freshman", count: 2 },
            { year: 2, label: "Year 2", sub: "Sophomore", count: 2 },
            { year: 3, label: "Year 3", sub: "Junior", count: 2 },
            { year: 4, label: "Year 4", sub: "Senior", count: 1 },
            { year: 5, label: "Year 5", sub: "Finalist", count: 1 },
          ].map((b) => (
            <button
              key={b.year}
              type="button"
              onClick={() => handleBatchChange(b.year)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                selectedBatchYear === b.year
                  ? "bg-[#FFFFFF] border-[#B8860B] ring-2 ring-[#B8860B]/30 shadow-md"
                  : "bg-[#FFFFFF] border-[#EADBCE] hover:border-[#B8860B] shadow-sm text-[#706259]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-base font-black ${selectedBatchYear === b.year ? "text-[#B8860B]" : "text-[#2C221E]"}`}>
                  {b.label}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#F4EFE6] text-[#706259]">
                  {b.count} Courses
                </span>
              </div>
              <p className="text-xs text-[#706259] font-medium mt-0.5">{b.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout: In-Page Attendance Launcher & Course Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Course Selector and Quick Launcher Banner */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EADBCE] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADBCE] pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#B8860B] bg-[#FBF2DE] px-2 py-0.5 rounded-md border border-[#B8860B]/30">
                  Year {selectedBatchYear} Active Curriculum
                </span>
                <h2 className="text-lg font-bold text-[#2C221E] mt-1">
                  {activeCourse?.code} - {activeCourse?.title}
                </h2>
                <p className="text-xs text-[#706259] flex items-center gap-2 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-[#B8860B]" />
                  Schedule: {activeCourse?.scheduleSlot} • {activeCourse?.studentsCount} Enrolled Students
                </p>
              </div>

              {/* Course Switcher if multiple courses in this batch */}
              {batchCourses.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#706259] font-bold">Switch Course:</span>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="bg-[#F4EFE6] border border-[#EADBCE] rounded-xl px-3 py-1.5 text-xs text-[#2C221E] font-bold focus:outline-none focus:border-[#B8860B]"
                  >
                    {batchCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* In-Page Attendance Launch Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#706259]">Session Type</label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value as any)}
                  className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2 text-xs text-[#2C221E] font-medium focus:outline-none focus:border-[#B8860B]"
                >
                  <option value="Morning Lecture">Morning Lecture</option>
                  <option value="Afternoon Lab">Afternoon Lab</option>
                  <option value="Make-up Class">Make-up Class</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#706259]">Verification Protocol</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSessionMode("DYNAMIC_QR")}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      sessionMode === "DYNAMIC_QR"
                        ? "bg-[#E8F3EE] border-[#1E7E53] text-[#1E7E53] font-bold"
                        : "bg-[#FFFFFF] border-[#EADBCE] text-[#706259]"
                    }`}
                  >
                    <p className="text-xs">Dynamic QR</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionMode("ROLLING_CODE")}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      sessionMode === "ROLLING_CODE"
                        ? "bg-[#FBF2DE] border-[#B8860B] text-[#B8860B] font-bold"
                        : "bg-[#FFFFFF] border-[#EADBCE] text-[#706259]"
                    }`}
                  >
                    <p className="text-xs">Rolling Code</p>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#706259]">In-Class Attendance Action</label>
                {activeCourse?.activeSessionId ? (
                  <Link
                    href={`/instructor/session/${activeCourse.activeSessionId}`}
                    className="w-full py-2.5 px-4 bg-[#1E7E53] hover:bg-[#166542] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-4 h-4" /> Resume Presenter
                  </Link>
                ) : (
                  <button
                    disabled={isCreating}
                    onClick={() => handleLaunchSession()}
                    className="w-full py-2.5 px-4 btn-ochre text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {isCreating ? "Starting..." : "Start Attendance"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Register Buttons & 80% Threshold Summary */}
        <div className="warm-card p-6 space-y-4 h-fit border-t-4 border-[#B8860B]">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#2C221E] flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-[#B8860B]" />
              Enroll Students in Year {selectedBatchYear}
            </h3>
            <p className="text-xs text-[#706259]">
              Two options to register students into this cohort:
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setIsManualStudentModalOpen(true)}
              className="w-full py-2.5 px-3 bg-[#FFFFFF] hover:bg-[#FBF2DE] border border-[#EADBCE] hover:border-[#B8860B] text-[#2C221E] font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-[#B8860B]" />
              Manual Student Registration
            </button>
            <button
              onClick={() => setIsUploadRosterModalOpen(true)}
              className="w-full py-2.5 px-3 bg-[#FFFFFF] hover:bg-[#FBF2DE] border border-[#EADBCE] hover:border-[#B8860B] text-[#2C221E] font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#1E7E53]" />
              Upload Excel / CSV Spreadsheet
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAEAE9] border border-[#F8D7DA] space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#B83833] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-[#B83833]" />
                80% Attendance Threshold
              </span>
              <span className="font-mono font-black text-[#B83833]">
                {lowAttendanceStudents.length} Students Below 80%
              </span>
            </div>
            <p className="text-[11px] text-[#706259]">
              Instructors monitor turnout at 80% to address absentees before students reach the critical 75% exam bar.
            </p>
          </div>
        </div>
      </div>

      {/* Course Enrolled Students Table with 80% Warning Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-[#2C221E] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#B8860B]" />
              Enrolled Students Roster • Year {selectedBatchYear} ({rosterStudents.length} Students)
            </h3>
            <p className="text-xs text-[#706259]">
              Live attendance standing calculated across all course sessions
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#706259] absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search student by name, ID or phone..."
              value={rosterSearch}
              onChange={(e) => setRosterSearch(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl pl-10 pr-4 py-2 text-xs text-[#2C221E] placeholder-[#A6978A] focus:outline-none focus:border-[#B8860B] shadow-sm font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-[#EADBCE] bg-[#FFFFFF] shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF2DE] text-[#706259] font-bold border-b border-[#EADBCE]">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Telegram Phone</th>
                <th className="py-3 px-4">Batch</th>
                <th className="py-3 px-4">Attendance Rate (%)</th>
                <th className="py-3 px-4 text-right">Instructor Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE]">
              {isLoadingRoster ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-[#706259]">
                    Loading enrolled students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-[#706259]">
                    No students found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-[#F9F6F0] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#2C221E] flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#F4EFE6] text-[#706259] flex items-center justify-center font-bold text-xs border border-[#EADBCE]">
                        {student.fullName[0]}
                      </div>
                      {student.fullName}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#706259]">{student.studentId}</td>
                    <td className="py-3 px-4 font-mono text-[#706259]">{student.phoneNumber}</td>
                    <td className="py-3 px-4 font-bold text-[#2C221E]">Year {student.batchYear}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black text-sm ${
                            student.attendanceRate >= 80 ? "text-[#1E7E53]" : "text-[#B83833]"
                          }`}
                        >
                          {student.attendanceRate}%
                        </span>
                        <div className="w-20 h-1.5 bg-[#F4EFE6] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              student.attendanceRate >= 80 ? "bg-[#1E7E53]" : "bg-[#B83833]"
                            }`}
                            style={{ width: `${student.attendanceRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {student.attendanceRate >= 80 ? (
                        <span className="text-[11px] font-bold text-[#1E7E53] bg-[#E8F3EE] px-2.5 py-0.5 rounded-lg border border-[#C2E8CA]">
                          Good Standing (≥80%)
                        </span>
                      ) : (
                        <span className="text-[11px] font-black text-[#B83833] bg-[#FAEAE9] px-2.5 py-0.5 rounded-lg border border-[#F8D7DA] animate-pulse">
                          ⚠️ Low Attendance (&lt;80%)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: MANUAL STUDENT REGISTRATION */}
      {isManualStudentModalOpen && (
        <div className="fixed inset-0 bg-[#2C221E]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EADBCE] shadow-2xl max-w-md w-full space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#2C221E] flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#B8860B]" />
                  Manual Student Registration
                </h3>
                <p className="text-xs text-[#706259]">
                  Enrolling in Year {selectedBatchYear} Cohort
                </p>
              </div>
              <button
                onClick={() => setIsManualStudentModalOpen(false)}
                className="p-1 rounded-xl text-[#706259] hover:text-[#2C221E] hover:bg-[#F4EFE6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualStudentRegister} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#706259]">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Yohannes"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2 text-xs text-[#2C221E] focus:outline-none focus:border-[#B8860B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#706259]">Student ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UGR/1450/14"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2 text-xs text-[#2C221E] font-mono focus:outline-none focus:border-[#B8860B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#706259]">Telegram Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+251911000000"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2 text-xs text-[#2C221E] font-mono focus:outline-none focus:border-[#B8860B]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EADBCE]">
                <button
                  type="button"
                  onClick={() => setIsManualStudentModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#706259] hover:text-[#2C221E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStudent}
                  className="px-5 py-2.5 btn-ochre text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmittingStudent ? "Registering..." : "Enroll Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EXCEL / CSV DRAG-AND-DROP UPLOAD */}
      {isUploadRosterModalOpen && (
        <div className="fixed inset-0 bg-[#2C221E]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EADBCE] shadow-2xl max-w-lg w-full space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#2C221E] flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#B8860B]" />
                  Drag & Drop Excel/CSV Student Whitelist
                </h3>
                <p className="text-xs text-[#706259]">
                  Upload class roster spreadsheet directly into Year {selectedBatchYear}
                </p>
              </div>
              <button
                onClick={() => setIsUploadRosterModalOpen(false)}
                className="p-1 rounded-xl text-[#706259] hover:text-[#2C221E] hover:bg-[#F4EFE6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                isDragging
                  ? "border-[#B8860B] bg-[#FBF2DE] scale-[1.01]"
                  : "border-[#EADBCE] bg-[#FFFFFF] hover:border-[#B8860B] shadow-sm"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) processUploadFile(files[0]);
                }}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-[#FBF2DE] text-[#B8860B] border border-[#B8860B]/30 flex items-center justify-center shadow-sm">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#2C221E]">
                  {uploadFileName ? `Selected: ${uploadFileName}` : "Drag & drop Excel or CSV file here, or click to browse"}
                </p>
                <p className="text-[11px] text-[#706259]">
                  Supports .xlsx, .xls and .csv (Name, Student ID, Phone Number)
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsUploadRosterModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#706259] hover:text-[#2C221E]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
