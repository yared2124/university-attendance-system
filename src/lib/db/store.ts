import { Role, AttendanceStatus, SessionMode, UserSessionProfile, BatchKPI } from "@/types";

export interface MockUser {
  id: string;
  phoneNumber: string;
  telegramId?: string | null;
  telegramUsername?: string | null;
  fullName: string;
  studentId?: string | null;
  role: Role;
  batchYear?: number | null;
  isActive: boolean;
}

export interface MockCourse {
  id: string;
  courseCode: string;
  title: string;
  batchYear: number;
  semester: 1 | 2;
  instructorIds: string[];
}

export interface MockAttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  markedAt: string;
  isManual?: boolean;
  manualNote?: string | null;
  excuseReason?: string | null;
  reconciledById?: string | null;
  reconciledAt?: string | null;
}

export interface MockAttendanceSession {
  id: string;
  courseId: string;
  openedById: string;
  mode: SessionMode;
  semester: 1 | 2;
  isClosed: boolean;
  createdAt: string;
  closedAt?: string | null;
  expiresAt: string;
}

export interface DispatchedAlert {
  id: string;
  studentId: string;
  studentName: string;
  phoneNumber: string;
  telegramId?: string | null;
  attendanceRate: number;
  dispatchedAt: string;
  message: string;
  channel: "TELEGRAM_BOT" | "SMS_GATEWAY";
  status: "DELIVERED" | "QUEUED";
}

// Global in-memory mock state for seamless dev & demo execution
class DataStore {
  public currentAcademicYear = "2025/2026";
  public currentSemester: 1 | 2 = 1;

  public users: MockUser[] = [
    // Instructors & Dept Head
    {
      id: "inst_1",
      phoneNumber: "+251911000001",
      telegramId: "123456789",
      telegramUsername: "dr_yared",
      fullName: "Dr. Yared Tadesse",
      role: "DEPT_HEAD",
      isActive: true,
    },
    {
      id: "inst_2",
      phoneNumber: "+251911000002",
      telegramId: "987654321",
      telegramUsername: "eng_alazar",
      fullName: "Eng. Alazar Tesfaye",
      role: "INSTRUCTOR",
      isActive: true,
    },
    {
      id: "inst_3",
      phoneNumber: "+251911000003",
      telegramId: "456123789",
      telegramUsername: "dr_bethlehem",
      fullName: "Dr. Bethlehem Girma",
      role: "INSTRUCTOR",
      isActive: true,
    },

    // Batch Year 3 Students (Junior Cohort)
    {
      id: "stu_301",
      phoneNumber: "+251922110001",
      telegramId: "100001",
      telegramUsername: "abebe_k",
      fullName: "Abebe Kebede",
      studentId: "UGR/1401/14",
      role: "STUDENT",
      batchYear: 3,
      isActive: true,
    },
    {
      id: "stu_302",
      phoneNumber: "+251922110002",
      telegramId: "100002",
      telegramUsername: "chaltu_d",
      fullName: "Chaltu Desta",
      studentId: "UGR/1402/14",
      role: "STUDENT",
      batchYear: 3,
      isActive: true,
    },
    {
      id: "stu_303",
      phoneNumber: "+251922110003",
      telegramId: "100003",
      telegramUsername: "dawit_h",
      fullName: "Dawit Haile",
      studentId: "UGR/1403/14",
      role: "STUDENT",
      batchYear: 3,
      isActive: true,
    },
    {
      id: "stu_304",
      phoneNumber: "+251922110004",
      telegramId: null, // Pending first /start
      telegramUsername: "eyerus_b",
      fullName: "Eyerusalem Bekele",
      studentId: "UGR/1404/14",
      role: "STUDENT",
      batchYear: 3,
      isActive: true,
    },
    {
      id: "stu_305",
      phoneNumber: "+251922110005",
      telegramId: "100005",
      telegramUsername: "fikadu_a",
      fullName: "Fikadu Assefa",
      studentId: "UGR/1405/14",
      role: "STUDENT",
      batchYear: 3,
      isActive: true,
    },
    {
      id: "stu_306",
      phoneNumber: "+251922110006",
      telegramId: "100006",
      telegramUsername: "genet_a",
      fullName: "Genet Alemayehu",
      studentId: "UGR/1406/14",
      role: "STUDENT",
      batchYear: 3,
      isActive: true,
    },
    {
      id: "stu_307",
      phoneNumber: "+251922110007",
      telegramId: "100007",
      telegramUsername: "hanna_s",
      fullName: "Hanna Solomon",
      studentId: "UGR/1407/14",
      role: "STUDENT",
      batchYear: 3,
      isActive: true,
    },

    // Batch Year 1 Students
    {
      id: "stu_101",
      phoneNumber: "+251933000001",
      telegramId: "200001",
      telegramUsername: "kidus_m",
      fullName: "Kidus Melaku",
      studentId: "UGR/2801/16",
      role: "STUDENT",
      batchYear: 1,
      isActive: true,
    },
    {
      id: "stu_102",
      phoneNumber: "+251933000002",
      telegramId: "200002",
      telegramUsername: "lensa_n",
      fullName: "Lensa Negash",
      studentId: "UGR/2802/16",
      role: "STUDENT",
      batchYear: 1,
      isActive: true,
    },

    // Batch Year 2 Students
    {
      id: "stu_201",
      phoneNumber: "+251922000011",
      telegramId: "210001",
      telegramUsername: "yohannes_b",
      fullName: "Yohannes Berhanu",
      studentId: "UGR/1901/15",
      role: "STUDENT",
      batchYear: 2,
      isActive: true,
    },
    {
      id: "stu_202",
      phoneNumber: "+251922000012",
      telegramId: "210002",
      telegramUsername: "meron_k",
      fullName: "Meron Kassa",
      studentId: "UGR/1902/15",
      role: "STUDENT",
      batchYear: 2,
      isActive: true,
    },

    // Batch Year 4 Students
    {
      id: "stu_401",
      phoneNumber: "+251944000001",
      telegramId: "300001",
      telegramUsername: "marta_y",
      fullName: "Marta Yohannes",
      studentId: "UGR/0951/13",
      role: "STUDENT",
      batchYear: 4,
      isActive: true,
    },
    {
      id: "stu_402",
      phoneNumber: "+251944000002",
      telegramId: "300002",
      telegramUsername: "natnael_d",
      fullName: "Natnael Daniel",
      studentId: "UGR/0952/13",
      role: "STUDENT",
      batchYear: 4,
      isActive: true,
    },

    // Batch Year 5 Students (Finalists)
    {
      id: "stu_501",
      phoneNumber: "+251955000001",
      telegramId: "400001",
      telegramUsername: "rediet_k",
      fullName: "Rediet Kassahun",
      studentId: "UGR/0211/12",
      role: "STUDENT",
      batchYear: 5,
      isActive: true,
    },
    {
      id: "stu_502",
      phoneNumber: "+251955000002",
      telegramId: "400002",
      telegramUsername: "surafel_m",
      fullName: "Surafel Mengistu",
      studentId: "UGR/0212/12",
      role: "STUDENT",
      batchYear: 5,
      isActive: true,
    },
  ];

  public courses: MockCourse[] = [
    {
      id: "course_1",
      courseCode: "SEng3112",
      title: "Software Requirements Engineering",
      batchYear: 3,
      semester: 1,
      instructorIds: ["inst_1", "inst_2"],
    },
    {
      id: "course_2",
      courseCode: "SEng4111",
      title: "Cloud Computing & Microservices",
      batchYear: 4,
      semester: 1,
      instructorIds: ["inst_2"],
    },
    {
      id: "course_3",
      courseCode: "SEng2104",
      title: "Data Structures & Algorithms",
      batchYear: 2,
      semester: 1,
      instructorIds: ["inst_3"],
    },
    {
      id: "course_4",
      courseCode: "SEng1101",
      title: "Introduction to Software Engineering",
      batchYear: 1,
      semester: 1,
      instructorIds: ["inst_1"],
    },
    {
      id: "course_5",
      courseCode: "SEng5102",
      title: "Capstone System Architecture",
      batchYear: 5,
      semester: 1,
      instructorIds: ["inst_1", "inst_3"],
    },
    // Semester 2 courses
    {
      id: "course_6",
      courseCode: "SEng3201",
      title: "Software Architecture & Design Patterns",
      batchYear: 3,
      semester: 2,
      instructorIds: ["inst_1"],
    },
    {
      id: "course_7",
      courseCode: "SEng2202",
      title: "Object-Oriented Design & Programming",
      batchYear: 2,
      semester: 2,
      instructorIds: ["inst_3"],
    },
  ];

  public sessions: MockAttendanceSession[] = [
    {
      id: "sess_active_1",
      courseId: "course_1",
      openedById: "inst_1",
      mode: "DYNAMIC_QR",
      semester: 1,
      isClosed: false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    },
    {
      id: "sess_prev_1",
      courseId: "course_1",
      openedById: "inst_1",
      mode: "DYNAMIC_QR",
      semester: 1,
      isClosed: true,
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      closedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 45 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 15 * 60 * 1000).toISOString(),
    },
  ];

  public records: MockAttendanceRecord[] = [
    {
      id: "rec_1",
      sessionId: "sess_prev_1",
      studentId: "stu_301",
      status: "PRESENT",
      markedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "rec_2",
      sessionId: "sess_prev_1",
      studentId: "stu_302",
      status: "PRESENT",
      markedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "rec_3",
      sessionId: "sess_prev_1",
      studentId: "stu_303",
      status: "ABSENT",
      markedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "rec_4",
      sessionId: "sess_prev_1",
      studentId: "stu_304",
      status: "EXCUSED",
      markedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      excuseReason: "Approved medical certificate from University Student Clinic (Ref: MED-911)",
      reconciledById: "inst_1",
      reconciledAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "rec_5",
      sessionId: "sess_prev_1",
      studentId: "stu_305",
      status: "PRESENT",
      markedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "rec_6",
      sessionId: "sess_prev_1",
      studentId: "stu_306",
      status: "PRESENT",
      markedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "rec_7",
      sessionId: "sess_prev_1",
      studentId: "stu_307",
      status: "ABSENT",
      markedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
  ];

  public alerts: DispatchedAlert[] = [];

  // Helper Methods
  public getBatchKPIs(semester: 1 | 2 = this.currentSemester): BatchKPI[] {
    const batches = [1, 2, 3, 4, 5];
    const names = [
      "Year 1 (Freshman)",
      "Year 2 (Sophomore)",
      "Year 3 (Junior)",
      "Year 4 (Senior)",
      "Year 5 (Finalists)",
    ];

    return batches.map((year, idx) => {
      const students = this.users.filter((u) => u.role === "STUDENT" && u.batchYear === year && u.isActive);
      const studentIds = new Set(students.map((s) => s.id));
      const batchRecords = this.records.filter((r) => studentIds.has(r.studentId));

      const present = batchRecords.filter((r) => r.status === "PRESENT").length;
      const absent = batchRecords.filter((r) => r.status === "ABSENT").length;
      const totalEligible = present + absent;

      const rate = totalEligible > 0 ? Math.round((present / totalEligible) * 100) : 92;
      const atRisk = students.filter((s) => {
        const myRecs = batchRecords.filter((r) => r.studentId === s.id);
        const myP = myRecs.filter((r) => r.status === "PRESENT").length;
        const myA = myRecs.filter((r) => r.status === "ABSENT").length;
        if (myP + myA === 0) return false;
        return (myP / (myP + myA)) * 100 < 75;
      }).length;

      const activeSessions = this.sessions.filter((sess) => {
        const c = this.courses.find((c) => c.id === sess.courseId);
        return c?.batchYear === year && c?.semester === semester && !sess.isClosed;
      }).length;

      return {
        batchYear: year,
        name: names[idx],
        totalStudents: students.length,
        overallAttendanceRate: rate,
        atRiskCount: atRisk,
        activeSessionsCount: activeSessions,
      };
    });
  }

  public recordCheckIn(sessionId: string, studentId: string): MockAttendanceRecord {
    const existing = this.records.find(
      (r) => r.sessionId === sessionId && r.studentId === studentId
    );
    if (existing) {
      return existing;
    }

    const newRecord: MockAttendanceRecord = {
      id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sessionId,
      studentId,
      status: "PRESENT",
      markedAt: new Date().toISOString(),
    };
    this.records.push(newRecord);
    return newRecord;
  }

  /**
   * Instructor In-Class Manual Mark
   * For students with no smartphone, dead battery, or lack of cellular data
   */
  public manualMarkStudent(
    sessionId: string,
    studentId: string,
    instructorId: string,
    reason: string = "Physical in-class check-in (no smartphone / offline)",
    status: AttendanceStatus = "PRESENT"
  ): MockAttendanceRecord {
    const existingIndex = this.records.findIndex(
      (r) => r.sessionId === sessionId && r.studentId === studentId
    );

    if (existingIndex >= 0) {
      this.records[existingIndex].status = status;
      this.records[existingIndex].isManual = true;
      this.records[existingIndex].manualNote = reason;
      this.records[existingIndex].reconciledById = instructorId;
      this.records[existingIndex].reconciledAt = new Date().toISOString();
      return this.records[existingIndex];
    }

    const newRecord: MockAttendanceRecord = {
      id: `rec_man_${Date.now()}_${studentId}`,
      sessionId,
      studentId,
      status,
      markedAt: new Date().toISOString(),
      isManual: true,
      manualNote: reason,
      reconciledById: instructorId,
      reconciledAt: new Date().toISOString(),
    };
    this.records.push(newRecord);
    return newRecord;
  }

  public closeSessionAndMaterializeAbsence(sessionId: string): {
    presentCount: number;
    absentCount: number;
  } {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error("Session not found");

    session.isClosed = true;
    session.closedAt = new Date().toISOString();

    const course = this.courses.find((c) => c.id === session.courseId);
    if (!course) throw new Error("Course not found");

    // Cohort students for this course's batch
    const cohortStudents = this.users.filter(
      (u) => u.role === "STUDENT" && u.batchYear === course.batchYear && u.isActive
    );

    let absentCount = 0;
    let presentCount = 0;

    for (const student of cohortStudents) {
      const existingRecord = this.records.find(
        (r) => r.sessionId === sessionId && r.studentId === student.id
      );

      if (!existingRecord) {
        // Materialize as ABSENT
        this.records.push({
          id: `rec_abs_${Date.now()}_${student.id}`,
          sessionId,
          studentId: student.id,
          status: "ABSENT",
          markedAt: new Date().toISOString(),
        });
        absentCount++;
      } else if (existingRecord.status === "PRESENT") {
        presentCount++;
      }
    }

    return { presentCount, absentCount };
  }

  public reconcileExcuse(
    recordId: string,
    excuseReason: string,
    facultyId: string
  ): MockAttendanceRecord {
    const record = this.records.find((r) => r.id === recordId);
    if (!record) throw new Error("Attendance record not found");

    record.status = "EXCUSED";
    record.excuseReason = excuseReason;
    record.reconciledById = facultyId;
    record.reconciledAt = new Date().toISOString();

    return record;
  }

  /**
   * Dispatch Warning Alert to At-Risk Student
   */
  public logDispatchedAlert(
    studentId: string,
    message: string,
    attendanceRate: number
  ): DispatchedAlert {
    const student = this.users.find((u) => u.id === studentId);
    const alertRecord: DispatchedAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      studentId,
      studentName: student?.fullName || "Student",
      phoneNumber: student?.phoneNumber || "",
      telegramId: student?.telegramId,
      attendanceRate,
      dispatchedAt: new Date().toISOString(),
      message,
      channel: "TELEGRAM_BOT",
      status: "DELIVERED",
    };
    this.alerts.unshift(alertRecord);
    return alertRecord;
  }
}

// Singleton global mock data store
const globalForStore = globalThis as unknown as { mockStore: DataStore };
export const dataStore = globalForStore.mockStore || new DataStore();
if (process.env.NODE_ENV !== "production") globalForStore.mockStore = dataStore;
