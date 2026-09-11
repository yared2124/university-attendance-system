"use client";

import React, { useState, useRef, useEffect } from "react";
import SidebarLayout, { NavItem } from "@/components/layout/SidebarLayout";
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
  UserPlus,
  Mail,
  Layers,
  Key,
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

interface FacultyMember {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  staffId?: string;
  department?: string;
  role: string;
}

interface CourseItem {
  id: string;
  courseCode: string;
  title: string;
  batchYear: number;
  semester: 1 | 2;
  instructorIds: string[];
  scheduleSlot?: string;
}

export default function DepartmentHeadDashboard() {
  // Institution & Department Selection
  const [selectedDepartment, setSelectedDepartment] = useState("Software Engineering");

  // Academic Hierarchy States
  const [academicYear, setAcademicYear] = useState("2025/2026");
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "atRisk" | "facultyOnboarding" | "courseAssignment" | "facultyCompliance" | "roster" | "upload"
  >("overview");

  // Faculty Onboarding State
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([
    {
      id: "inst_1",
      fullName: "Dr. Yared Tadesse",
      email: "head@injibara.edu.et",
      phoneNumber: "+251911000001",
      staffId: "STAFF/SE/001",
      department: "Software Engineering",
      role: "DEPT_HEAD",
    },
    {
      id: "inst_2",
      fullName: "Eng. Alazar Tesfaye",
      email: "alazar.t@injibara.edu.et",
      phoneNumber: "+251911000002",
      staffId: "STAFF/SE/102",
      department: "Software Engineering",
      role: "INSTRUCTOR",
    },
    {
      id: "inst_3",
      fullName: "Dr. Bethlehem Girma",
      email: "bethlehem.g@injibara.edu.et",
      phoneNumber: "+251911000003",
      staffId: "STAFF/SE/103",
      department: "Software Engineering",
      role: "INSTRUCTOR",
    },
  ]);
  const [isAddFacultyModalOpen, setIsAddFacultyModalOpen] = useState(false);
  const [newFacultyName, setNewFacultyName] = useState("");
  const [newFacultyEmail, setNewFacultyEmail] = useState("");
  const [newFacultyPhone, setNewFacultyPhone] = useState("");
  const [newFacultyStaffId, setNewFacultyStaffId] = useState("");
  const [newFacultyTempPass, setNewFacultyTempPass] = useState("Injibara@2026");
  const [isSubmittingFaculty, setIsSubmittingFaculty] = useState(false);
  const [gmailSentBanner, setGmailSentBanner] = useState<string | null>(null);

  // Course Assignment State
  const [coursesList, setCoursesList] = useState<CourseItem[]>([
    {
      id: "course_4",
      courseCode: "SEng1101",
      title: "Introduction to Software Engineering",
      batchYear: 1,
      semester: 1,
      instructorIds: ["inst_1"],
      scheduleSlot: "Mon/Wed 08:30 - 10:00",
    },
    {
      id: "course_8",
      courseCode: "SEng1103",
      title: "Structured Programming Fundamentals",
      batchYear: 1,
      semester: 1,
      instructorIds: ["inst_2"],
      scheduleSlot: "Tue/Thu 10:30 - 12:00",
    },
    {
      id: "course_3",
      courseCode: "SEng2104",
      title: "Data Structures & Algorithms",
      batchYear: 2,
      semester: 1,
      instructorIds: ["inst_3"],
      scheduleSlot: "Tue/Thu 08:30 - 10:00",
    },
    {
      id: "course_7",
      courseCode: "SEng2202",
      title: "Object-Oriented Design & Programming",
      batchYear: 2,
      semester: 2,
      instructorIds: ["inst_1", "inst_3"],
      scheduleSlot: "Mon/Wed 14:00 - 15:30",
    },
    {
      id: "course_1",
      courseCode: "SEng3112",
      title: "Software Requirements Engineering",
      batchYear: 3,
      semester: 1,
      instructorIds: ["inst_1", "inst_2"],
      scheduleSlot: "Mon/Wed 08:30 - 10:00",
    },
    {
      id: "course_6",
      courseCode: "SEng3201",
      title: "Software Architecture & Design Patterns",
      batchYear: 3,
      semester: 1,
      instructorIds: ["inst_1"],
      scheduleSlot: "Tue/Thu 10:30 - 12:00",
    },
  ]);
  const [assignTargetBatch, setAssignTargetBatch] = useState<number>(2);
  const [assignTargetCourseId, setAssignTargetCourseId] = useState<string>("course_7");
  const [assignSelectedInstructorId, setAssignSelectedInstructorId] = useState<string>("inst_1");
  const [assignScheduleSlot, setAssignScheduleSlot] = useState<string>("Mon/Wed 08:30 - 10:00 AM");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentSuccessMsg, setAssignmentSuccessMsg] = useState<string | null>(null);

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

  // Handle Faculty Onboarding Submission
  const handleRegisterFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFaculty(true);
    setGmailSentBanner(null);

    try {
      const res = await fetch("/api/admin/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newFacultyName,
          email: newFacultyEmail,
          phoneNumber: newFacultyPhone,
          staffId: newFacultyStaffId,
          department: selectedDepartment,
          temporaryPassword: newFacultyTempPass,
        }),
      });

      const data = await res.json();
      if (res.ok && data.faculty) {
        setFacultyList((prev) => [...prev, data.faculty]);
        setGmailSentBanner(
          `✉️ Official welcome email & login credentials dispatched via Gmail to ${newFacultyEmail} (Staff ID: ${newFacultyStaffId}, Initial Password: ${newFacultyTempPass}).`
        );
        setIsAddFacultyModalOpen(false);
        setNewFacultyName("");
        setNewFacultyEmail("");
        setNewFacultyPhone("");
        setNewFacultyStaffId("");
      }
    } catch {
      alert("Failed to onboard faculty member.");
    } finally {
      setIsSubmittingFaculty(false);
    }
  };

  // Handle Course Assignment Submission
  const handleAssignCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssigning(true);
    setAssignmentSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/courses/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: assignTargetCourseId,
          instructorId: assignSelectedInstructorId,
          scheduleSlot: assignScheduleSlot,
        }),
      });

      const data = await res.json();
      if (res.ok && data.course) {
        setCoursesList((prev) =>
          prev.map((c) => (c.id === data.course.id ? data.course : c))
        );
        const inst = facultyList.find((f) => f.id === assignSelectedInstructorId);
        setAssignmentSuccessMsg(
          `✅ Successfully assigned ${data.course.courseCode} (${data.course.title}) to ${inst?.fullName || "Instructor"} for slot: ${assignScheduleSlot}.`
        );
        setTimeout(() => setAssignmentSuccessMsg(null), 5000);
      }
    } catch {
      alert("Failed to assign course.");
    } finally {
      setIsAssigning(false);
    }
  };

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

  const navItems: NavItem[] = [
    {
      id: "overview",
      label: "Executive Dashboard",
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: "atRisk",
      label: "Critical At-Risk Center",
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: atRiskStudents.length,
      badgeColor: "bg-[#FAEAE9] text-[#B83833]",
    },
    {
      id: "facultyOnboarding",
      label: "Faculty Onboarding & Invites",
      icon: <GraduationCap className="w-4 h-4" />,
      badge: facultyList.length,
      badgeColor: "bg-[#FBF2DE] text-[#B8860B]",
    },
    {
      id: "courseAssignment",
      label: "Course Assignment Engine",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "facultyCompliance",
      label: "Faculty Daily Compliance",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: "roster",
      label: "Master Roster & Excuses",
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "upload",
      label: "Drag & Drop Whitelist",
      icon: <Upload className="w-4 h-4" />,
    },
  ];

  return (
    <SidebarLayout
      portalTitle="Department Head Console"
      portalSubtitle="Oversight & Faculty Hub"
      userRoleLabel="DEPARTMENT HEAD"
      userName="Dr. Yared Tadesse"
      navItems={navItems}
      activeItemId={activeTab}
      onSelectItem={(id) => setActiveTab(id as any)}
      academicTerm={`${academicYear} • Semester ${selectedSemester}`}
      topHeaderActions={
        <div className="flex items-center gap-2">
          {/* Department Selector */}
          <div className="flex items-center gap-1.5 bg-[#F9F6F0] border border-[#EADBCE] rounded-xl px-2.5 py-1 text-xs text-[#2C221E] font-bold">
            <span className="text-[#706259] font-medium hidden sm:inline">Dept:</span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-transparent font-bold text-[#2C221E] focus:outline-none cursor-pointer text-xs"
            >
              <option value="Software Engineering">Software Engineering</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
            </select>
          </div>

          {/* Semester Switcher Tabs */}
          <div className="flex items-center bg-[#ECE4D8] border border-[#EADBCE] rounded-xl p-0.5">
            <button
              onClick={() => setSelectedSemester(1)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedSemester === 1
                  ? "bg-[#B8860B] text-white shadow-xs"
                  : "text-[#706259] hover:text-[#2C221E]"
              }`}
            >
              Sem 1
            </button>
            <button
              onClick={() => setSelectedSemester(2)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedSemester === 2
                  ? "bg-[#B8860B] text-white shadow-xs"
                  : "text-[#706259] hover:text-[#2C221E]"
              }`}
            >
              Sem 2
            </button>
          </div>

          {/* Export Report Action */}
          <a
            href={`/api/admin/export?batchYear=${selectedBatchFilter === "ALL" ? 3 : selectedBatchFilter}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#EADBCE] hover:border-[#1E7E53] text-[#1E7E53] font-bold text-xs rounded-xl shadow-xs transition-colors"
            title="Export Excel Attendance Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export</span>
          </a>

          {/* Link to Instructor View */}
          <Link
            href="/instructor"
            className="flex items-center gap-1.5 px-3 py-1.5 btn-ochre text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            title="Switch to Instructor Control Deck"
          >
            <span>Instructor View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      }
    >
      

      {/* Gmail Dispatched Notification Banner */}
      {gmailSentBanner && (
        <div className="p-4 rounded-2xl bg-[#E8F3EE] border border-[#C2E8CA] text-[#1E7E53] flex items-center justify-between animate-in fade-in-50">
          <div className="flex items-center gap-3 text-xs font-bold">
            <Mail className="w-4 h-4 text-[#1E7E53] shrink-0" />
            <span>{gmailSentBanner}</span>
          </div>
          <button
            onClick={() => setGmailSentBanner(null)}
            className="text-[#1E7E53] hover:text-[#166542]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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

      {/* OVERVIEW VIEW (Executive KPI Metrics & 5-Batch Cohort Health Matrix) */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
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
              <span className="text-xs font-bold text-[#706259]">Onboarded Faculty Members</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-[#B8860B] tracking-tight">
                  {facultyList.length}
                </span>
                <span className="text-xs font-bold text-[#B8860B] bg-[#FBF2DE] px-2.5 py-0.5 rounded-lg border border-[#B8860B]/30">
                  Active Instructors
                </span>
              </div>
              <p className="text-[11px] text-[#706259] font-medium">Credentials provisioned with Gmail invites</p>
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
              <span className="text-xs text-[#706259] font-medium">Click batch cards to inspect cohort</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {batches.map((b) => (
                <div
                  key={b.year}
                  onClick={() => {
                    setSelectedBatchFilter(selectedBatchFilter === b.year ? "ALL" : b.year);
                    setActiveTab("roster");
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] ${
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

          {/* REAL-TIME OPERATIONAL PANELS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
            {/* Panel 1: Top Critical At-Risk Students */}
            <div className="warm-card p-5 space-y-3 border-t-4 border-[#B83833]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FAEAE9] text-[#B83833] flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#2C221E] uppercase tracking-wider">
                      Urgent Attendance Interventions (<span className="text-[#B83833]">{atRiskStudents.length}</span>)
                    </h3>
                    <p className="text-[11px] text-[#706259]">Students below the 75% examination eligibility bar</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("atRisk")}
                  className="text-xs font-bold text-[#B83833] hover:underline"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="divide-y divide-[#EADBCE]">
                {atRiskStudents.slice(0, 4).map((s) => (
                  <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#2C221E]">{s.name}</p>
                      <p className="text-[10px] text-[#706259] font-mono">{s.studentId} • Year {s.batchYear}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-[#B83833]">{s.attendanceRate}%</span>
                      <button
                        onClick={() => handleSendTelegramWarning(s)}
                        disabled={alertingStudentId === s.id}
                        className="px-2.5 py-1 bg-[#FAEAE9] hover:bg-[#B83833] text-[#B83833] hover:text-white rounded-lg font-bold text-[11px] transition-all disabled:opacity-50"
                      >
                        {alertingStudentId === s.id ? "Sending..." : "Alert"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 2: Today's Faculty Compliance Snapshot */}
            <div className="warm-card p-5 space-y-3 border-t-4 border-[#B8860B]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FBF2DE] text-[#B8860B] flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#2C221E] uppercase tracking-wider">
                      Today's Lecture Attendance Compliance
                    </h3>
                    <p className="text-[11px] text-[#706259]">Scheduled faculty classes & verified turnout</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("facultyCompliance")}
                  className="text-xs font-bold text-[#B8860B] hover:underline"
                >
                  Full Log &rarr;
                </button>
              </div>

              <div className="divide-y divide-[#EADBCE]">
                {facultyComplianceData.slice(0, 4).map((f, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#2C221E]">{f.courseCode} - {f.facultyName}</p>
                      <p className="text-[10px] text-[#706259]">{f.scheduledTime} • Year {f.batchYear}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-[#706259]">{f.markedStudents}/{f.totalEnrolled}</span>
                      {f.attendanceTaken ? (
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-[#E8F3EE] text-[#1E7E53]">
                          ✓ Taken
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-[#FAEAE9] text-[#B83833]">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

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
                        <a
                          href={`tel:${s.phoneNumber}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F3EE] hover:bg-[#C2E8CA] text-[#1E7E53] border border-[#C2E8CA] font-bold text-xs transition-colors"
                          title="Call student phone"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call
                        </a>
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

      {/* TAB 2: FACULTY ONBOARDING & GMAIL CREDENTIALS DISPATCH */}
      {activeTab === "facultyOnboarding" && (
        <section className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#FBF2DE] border border-[#B8860B]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-[#2C221E] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#B8860B]" />
                Faculty Staff Directory & Gmail Invitation Dispatch
              </h3>
              <p className="text-xs text-[#706259]">
                Register academic instructors, assign institutional Staff IDs, and automatically dispatch login credentials via Gmail.
              </p>
            </div>
            <button
              onClick={() => setIsAddFacultyModalOpen(true)}
              className="px-4 py-2.5 btn-ochre text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Add New Faculty Member
            </button>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[#EADBCE] bg-[#FFFFFF] shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF2DE] text-[#706259] font-bold border-b border-[#EADBCE]">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Gmail / Institutional Email</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {facultyList.map((f) => (
                  <tr key={f.id} className="hover:bg-[#F9F6F0] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#2C221E] flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#FBF2DE] text-[#B8860B] border border-[#B8860B]/30 flex items-center justify-center font-bold text-xs">
                        {f.fullName[0]}
                      </div>
                      <div>
                        <p>{f.fullName}</p>
                        <span className="text-[10px] text-[#706259] font-normal">{f.role}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#B8860B]">{f.staffId || "STAFF/SE/---"}</td>
                    <td className="py-3 px-4 font-mono text-[#2C221E]">{f.email || "—"}</td>
                    <td className="py-3 px-4 font-mono text-[#706259]">{f.phoneNumber}</td>
                    <td className="py-3 px-4 text-[#706259]">{f.department || selectedDepartment}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs font-bold text-[#1E7E53] bg-[#E8F3EE] px-2.5 py-0.5 rounded-lg border border-[#C2E8CA] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Credentials Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: COURSE ASSIGNMENT ENGINE */}
      {activeTab === "courseAssignment" && (
        <section className="space-y-6">
          <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#EADBCE] shadow-sm space-y-4">
            <div className="space-y-1 border-b border-[#EADBCE] pb-3">
              <h3 className="text-sm font-black text-[#2C221E] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#B8860B]" />
                Assign Faculty to Courses & Schedule Slots
              </h3>
              <p className="text-xs text-[#706259]">
                Select the target batch and semester to link registered instructors to curriculum courses.
              </p>
            </div>

            {assignmentSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-[#E8F3EE] border border-[#C2E8CA] text-[#1E7E53] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{assignmentSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleAssignCourse} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#706259]">1. Batch Cohort</label>
                <select
                  value={assignTargetBatch}
                  onChange={(e) => setAssignTargetBatch(Number(e.target.value))}
                  className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2.5 text-xs text-[#2C221E] font-medium focus:outline-none focus:border-[#B8860B]"
                >
                  <option value={1}>Year 1 (Freshman)</option>
                  <option value={2}>Year 2 (Sophomore)</option>
                  <option value={3}>Year 3 (Junior)</option>
                  <option value={4}>Year 4 (Senior)</option>
                  <option value={5}>Year 5 (Finalists)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#706259]">2. Course to Assign</label>
                <select
                  value={assignTargetCourseId}
                  onChange={(e) => setAssignTargetCourseId(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2.5 text-xs text-[#2C221E] font-medium focus:outline-none focus:border-[#B8860B]"
                >
                  {coursesList
                    .filter((c) => c.batchYear === assignTargetBatch)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.courseCode} - {c.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#706259]">3. Primary Instructor</label>
                <select
                  value={assignSelectedInstructorId}
                  onChange={(e) => setAssignSelectedInstructorId(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2.5 text-xs text-[#2C221E] font-medium focus:outline-none focus:border-[#B8860B]"
                >
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fullName} ({f.staffId || f.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#706259]">4. Scheduled Class Slot</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={assignScheduleSlot}
                    onChange={(e) => setAssignScheduleSlot(e.target.value)}
                    placeholder="e.g. Mon/Wed 08:30 - 10:00 AM"
                    className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2 text-xs text-[#2C221E] font-medium focus:outline-none focus:border-[#B8860B]"
                  />
                  <button
                    type="submit"
                    disabled={isAssigning}
                    className="px-4 py-2 btn-ochre text-white font-bold text-xs rounded-xl shadow-md shrink-0 transition-all disabled:opacity-50"
                  >
                    {isAssigning ? "Assigning..." : "Assign"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Current Assignments Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#706259] uppercase tracking-wider">
              Current Faculty Course Assignments (Year {assignTargetBatch})
            </h4>
            <div className="overflow-x-auto rounded-3xl border border-[#EADBCE] bg-[#FFFFFF] shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FBF2DE] text-[#706259] font-bold border-b border-[#EADBCE]">
                  <tr>
                    <th className="py-3 px-4">Course Code</th>
                    <th className="py-3 px-4">Course Title</th>
                    <th className="py-3 px-4">Batch</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">Assigned Instructor</th>
                    <th className="py-3 px-4">Lecture Slot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADBCE]">
                  {coursesList
                    .filter((c) => c.batchYear === assignTargetBatch)
                    .map((c) => {
                      const instructor = facultyList.find((f) => c.instructorIds.includes(f.id));
                      return (
                        <tr key={c.id} className="hover:bg-[#F9F6F0]">
                          <td className="py-3 px-4 font-mono font-bold text-[#B8860B]">{c.courseCode}</td>
                          <td className="py-3 px-4 font-bold text-[#2C221E]">{c.title}</td>
                          <td className="py-3 px-4">Year {c.batchYear}</td>
                          <td className="py-3 px-4">Sem {c.semester}</td>
                          <td className="py-3 px-4 font-bold text-[#1E7E53]">
                            {instructor ? instructor.fullName : "Unassigned"}
                          </td>
                          <td className="py-3 px-4 font-mono text-[#706259]">{c.scheduleSlot || "Not scheduled"}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: FACULTY DAILY COMPLIANCE MONITOR */}
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

      {/* TAB 5: FULL ATTENDANCE ROSTER & EXCUSE LOG */}
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

      {/* TAB 6: DRAG & DROP ROSTER INGESTION */}
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

      {/* ONBOARD FACULTY MODAL (WITH GMAIL DISPATCH) */}
      {isAddFacultyModalOpen && (
        <div className="fixed inset-0 bg-[#2C221E]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EADBCE] shadow-2xl max-w-lg w-full space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#2C221E] flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#B8860B]" />
                  Onboard Faculty & Dispatch Gmail Invitation
                </h3>
                <p className="text-xs text-[#706259]">
                  Provision institutional credentials. An automated invitation with Staff ID and password will be sent to the instructor's email.
                </p>
              </div>
              <button
                onClick={() => setIsAddFacultyModalOpen(false)}
                className="p-1 rounded-xl text-[#706259] hover:text-[#2C221E] hover:bg-[#F4EFE6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterFaculty} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#706259]">Full Name <span className="text-[#B83833]">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Abebaw Haile"
                  value={newFacultyName}
                  onChange={(e) => setNewFacultyName(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2 text-xs text-[#2C221E] focus:outline-none focus:border-[#B8860B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#706259]">Staff ID <span className="text-[#B83833]">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="STAFF/SE/105"
                    value={newFacultyStaffId}
                    onChange={(e) => setNewFacultyStaffId(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2 text-xs text-[#2C221E] font-mono focus:outline-none focus:border-[#B8860B]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#706259]">Phone Number <span className="text-[#B83833]">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="+251911223344"
                    value={newFacultyPhone}
                    onChange={(e) => setNewFacultyPhone(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2 text-xs text-[#2C221E] font-mono focus:outline-none focus:border-[#B8860B]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#706259]">Gmail / Institutional Email <span className="text-[#B83833]">*</span></label>
                <input
                  type="email"
                  required
                  placeholder="abebaw.h@injibara.edu.et"
                  value={newFacultyEmail}
                  onChange={(e) => setNewFacultyEmail(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#EADBCE] rounded-xl px-3 py-2 text-xs text-[#2C221E] font-mono focus:outline-none focus:border-[#B8860B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#706259]">Initial / Temporary Password</label>
                <input
                  type="text"
                  value={newFacultyTempPass}
                  onChange={(e) => setNewFacultyTempPass(e.target.value)}
                  className="w-full bg-[#F4EFE6] border border-[#EADBCE] rounded-xl px-3 py-2 text-xs text-[#2C221E] font-mono focus:outline-none focus:border-[#B8860B]"
                />
                <p className="text-[10px] text-[#706259]">Instructor will be prompted to change password upon first login.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EADBCE]">
                <button
                  type="button"
                  onClick={() => setIsAddFacultyModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#706259] hover:text-[#2C221E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFaculty}
                  className="px-5 py-2.5 btn-ochre text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {isSubmittingFaculty ? "Dispatching..." : "Send Gmail Invite & Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
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
    </SidebarLayout>
  );
}