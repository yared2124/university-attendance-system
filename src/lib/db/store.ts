import { Role, AttendanceStatus, SessionMode, UserSessionProfile, BatchKPI } from "@/types";

export interface MockUser {
  id: string;
  phoneNumber: string;
  email?: string;
  staffId?: string; // e.g. STAFF/SE/101
  password?: string; // For authentication
  telegramId?: string | null;
  telegramUsername?: string | null;
  fullName: string;
  studentId?: string | null;
  role: Role;
  batchYear?: number | null;
  department?: string;
  isActive: boolean;
}

export interface MockCourse {
  id: string;
  courseCode: string;
  title: string;
  batchYear: number;
  semester: 1 | 2;
  instructorIds: string[];
  scheduleSlot?: string;
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
  channel: "TELEGRAM_BOT" | "SMS_GATEWAY" | "GMAIL";
  status: "DELIVERED" | "QUEUED";
}

export interface GmailInvitationLog {
  id: string;
  facultyId: string;
  facultyName: string;
  email: string;
  staffId: string;
  temporaryPassword: string;
  sentAt: string;
  status: "SENT";
}

// Global in-memory mock state for seamless dev & demo execution
class DataStore {
  public currentAcademicYear = "2025/2026";
  public currentSemester: 1 | 2 = 1;

  public users: MockUser[] = [
    // Dept Head
    {
      id: "inst_1",
      phoneNumber: "+251911000001",
      email: "head@injibara.edu.et",
      staffId: "STAFF/SE/001",
      password: "Admin@2026",
      telegramId: "123456789",
      telegramUsername: "dr_yared",
      fullName: "Dr. Yared Tadesse",
      role: "DEPT_HEAD",
      department: "Software Engineering",
      isActive: true,
    },
    // Instructors
    {
      id: "inst_2",
      phoneNumber: "+251911000002",
      email: "alazar.t@injibara.edu.et",
      staffId: "STAFF/SE/102",
      password: "Instructor@2026",
      telegramId: "987654321",
      telegramUsername: "eng_alazar",
      fullName: "Eng. Alazar Tesfaye",
      role: "INSTRUCTOR",
      department: "Software Engineering",
      isActive: true,
    },
    {
      id: "inst_3",
      phoneNumber: "+251911000003",
      email: "bethlehem.g@injibara.edu.et",
      staffId: "STAFF/SE/103",
      password: "Instructor@2026",
      telegramId: "456123789",
      telegramUsername: "dr_bethlehem",
      fullName: "Dr. Bethlehem Girma",
      role: "INSTRUCTOR",
      department: "Software Engineering",
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
      department: "Software Engineering",
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
      department: "Software Engineering",
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
      department: "Software Engineering",
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
      department: "Software Engineering",
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
      department: "Software Engineering",
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
      department: "Software Engineering",
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
      department: "Software Engineering",
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
      department: "Software Engineering",
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
      department: "Software Engineering",
      isActive: true,
    },
    {
      id: "stu_103",
      phoneNumber: "+251933000003",
      telegramId: "200003",
      telegramUsername: "abinet_g",
      fullName: "Abinet Getachew",
      studentId: "UGR/2803/16",
      role: "STUDENT",
      batchYear: 1,
      department: "Software Engineering",
      isActive: true,
    },
    {
      id: "stu_104",
      phoneNumber: "+251933000004",
      telegramId: "200004",
      telegramUsername: "selam_b",
      fullName: "Selamawit Belay",
      studentId: "UGR/2804/16",
      role: "STUDENT",
      batchYear: 1,
      department: "Software Engineering",
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
      department: "Software Engineering",
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
      department: "Software Engineering",
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
      department: "Software Engineering",
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
      department: "Software Engineering",
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
      department: "Software Engineering",
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
      department: "Software Engineering",
      isActive: true,
    },
  ];

  public courses: MockCourse[] = [
    // Year 1
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
      instructorIds: ["inst_1", "inst_2"],
      scheduleSlot: "Tue/Thu 10:30 - 12:00",
    },
    // Year 2
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
    // Year 3
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
    // Year 4
    {
      id: "course_2",
      courseCode: "SEng4111",
      title: "Cloud Computing & Microservices",
      batchYear: 4,
      semester: 1,
      instructorIds: ["inst_2"],
      scheduleSlot: "Fri 09:00 - 12:00",
    },
    // Year 5
    {
      id: "course_5",
      courseCode: "SEng5102",
      title: "Senior Capstone System Architecture",
      batchYear: 5,
      semester: 1,
      instructorIds: ["inst_1", "inst_3"],
      scheduleSlot: "Wed 14:00 - 17:00",
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
    // Year 1 previous session
    {
      id: "sess_y1_1",
      courseId: "course_4",
      openedById: "inst_1",
      mode: "DYNAMIC_QR",
      semester: 1,
      isClosed: true,
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      closedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 45 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 15 * 60 * 1000).toISOString(),
    },
  ];

  public records: MockAttendanceRecord[] = [
    { id: "rec_1", sessionId: "sess_prev_1", studentId: "stu_301", status: "PRESENT", markedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
    { id: "rec_2", sessionId: "sess_prev_1", studentId: "stu_302", status: "PRESENT", markedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
    { id: "rec_3", sessionId: "sess_prev_1", studentId: "stu_303", status: "ABSENT", markedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
    { id: "rec_4", sessionId: "sess_prev_1", studentId: "stu_304", status: "EXCUSED", markedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), excuseReason: "Clinic note", reconciledById: "inst_1" },
    { id: "rec_5", sessionId: "sess_prev_1", studentId: "stu_305", status: "PRESENT", markedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
    { id: "rec_6", sessionId: "sess_prev_1", studentId: "stu_306", status: "PRESENT", markedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
    { id: "rec_7", sessionId: "sess_prev_1", studentId: "stu_307", status: "ABSENT", markedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },

    // Year 1 Records
    { id: "rec_101", sessionId: "sess_y1_1", studentId: "stu_101", status: "PRESENT", markedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
    { id: "rec_102", sessionId: "sess_y1_1", studentId: "stu_102", status: "PRESENT", markedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
    { id: "rec_103", sessionId: "sess_y1_1", studentId: "stu_103", status: "ABSENT", markedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
    { id: "rec_104", sessionId: "sess_y1_1", studentId: "stu_104", status: "PRESENT", markedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
  ];

  public alerts: DispatchedAlert[] = [];
  public gmailLogs: GmailInvitationLog[] = [];

  // Helper Methods
  public authenticateUser(identifier: string, pass: string): MockUser | null {
    const cleanId = identifier.trim().toLowerCase();
    const user = this.users.find(
      (u) =>
        u.isActive &&
        (u.email?.toLowerCase() === cleanId ||
          u.staffId?.toLowerCase() === cleanId ||
          u.phoneNumber.replace(/\s+/g, "") === cleanId ||
          u.studentId?.toLowerCase() === cleanId)
    );

    if (!user) return null;
    if (user.password && user.password !== pass) return null;
    return user;
  }

  public registerFacultyMember(params: {
    fullName: string;
    email: string;
    phoneNumber: string;
    staffId: string;
    department: string;
    temporaryPassword?: string;
  }): { faculty: MockUser; invitation: GmailInvitationLog } {
    const tempPassword = params.temporaryPassword || `Injibara@${Math.floor(1000 + Math.random() * 9000)}`;
    const newFaculty: MockUser = {
      id: `inst_${Date.now()}`,
      fullName: params.fullName,
      email: params.email,
      phoneNumber: params.phoneNumber,
      staffId: params.staffId,
      department: params.department,
      password: tempPassword,
      role: "INSTRUCTOR",
      isActive: true,
    };

    this.users.push(newFaculty);

    const invitationLog: GmailInvitationLog = {
      id: `inv_${Date.now()}`,
      facultyId: newFaculty.id,
      facultyName: newFaculty.fullName,
      email: newFaculty.email || params.email,
      staffId: newFaculty.staffId || params.staffId,
      temporaryPassword: tempPassword,
      sentAt: new Date().toISOString(),
      status: "SENT",
    };

    this.gmailLogs.unshift(invitationLog);
    return { faculty: newFaculty, invitation: invitationLog };
  }

  public assignInstructorToCourse(courseId: string, instructorId: string, scheduleSlot?: string): MockCourse {
    const course = this.courses.find((c) => c.id === courseId);
    if (!course) throw new Error("Course not found");

    if (!course.instructorIds.includes(instructorId)) {
      course.instructorIds.push(instructorId);
    }
    if (scheduleSlot) {
      course.scheduleSlot = scheduleSlot;
    }
    return course;
  }

  public registerStudentByInstructor(params: {
    fullName: string;
    studentId: string;
    phoneNumber: string;
    batchYear: number;
    courseId?: string;
  }): MockUser {
    const existing = this.users.find(
      (u) => u.studentId === params.studentId || u.phoneNumber === params.phoneNumber
    );
    if (existing) {
      existing.fullName = params.fullName;
      existing.batchYear = params.batchYear;
      return existing;
    }

    const newStudent: MockUser = {
      id: `stu_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      fullName: params.fullName,
      studentId: params.studentId,
      phoneNumber: params.phoneNumber,
      batchYear: params.batchYear,
      role: "STUDENT",
      isActive: true,
      department: "Software Engineering",
    };
    this.users.push(newStudent);
    return newStudent;
  }

  public getCourseAttendanceForStudent(studentId: string) {
    const student = this.users.find((u) => u.id === studentId || u.studentId === studentId);
    if (!student || !student.batchYear) return [];

    const enrolledCourses = this.courses.filter((c) => c.batchYear === student.batchYear);

    return enrolledCourses.map((course) => {
      const courseSessions = this.sessions.filter((s) => s.courseId === course.id);
      const sessionIds = new Set(courseSessions.map((s) => s.id));
      const studentRecords = this.records.filter(
        (r) => r.studentId === student.id && sessionIds.has(r.sessionId)
      );

      const present = studentRecords.filter((r) => r.status === "PRESENT").length;
      const totalSessions = Math.max(courseSessions.length, 12); // Simulated baseline
      const rate = Math.min(100, Math.round(((present + 9) / totalSessions) * 100)); // realistic demo rate

      return {
        courseId: course.id,
        courseCode: course.courseCode,
        courseTitle: course.title,
        attendanceRate: rate,
        isGoodStanding: rate >= 80,
        statusLabel: rate >= 80 ? "Good Standing" : "Low Attendance Warning",
      };
    });
  }

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
      existing.status = "PRESENT";
      existing.markedAt = new Date().toISOString();
      return existing;
    }

    const newRecord: MockAttendanceRecord = {
      id: `rec_${Date.now()}_${studentId}`,
      sessionId,
      studentId,
      status: "PRESENT",
      markedAt: new Date().toISOString(),
    };
    this.records.push(newRecord);
    return newRecord;
  }

  public manualMarkStudent(
    sessionId: string,
    studentId: string,
    instructorId: string,
    reason: string,
    status: AttendanceStatus = "PRESENT"
  ): MockAttendanceRecord {
    return this.recordManualAttendance(sessionId, studentId, status, reason, instructorId);
  }

  public recordManualAttendance(
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    reason: string,
    instructorId: string
  ): MockAttendanceRecord {
    const existing = this.records.find(
      (r) => r.sessionId === sessionId && r.studentId === studentId
    );
    if (existing) {
      existing.status = status;
      existing.isManual = true;
      existing.manualNote = reason;
      existing.reconciledById = instructorId;
      existing.reconciledAt = new Date().toISOString();
      return existing;
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
