import * as XLSX from "xlsx";
import { dataStore } from "@/lib/db/store";

export function generateBatchAttendanceExcel(batchYear: number): Uint8Array {
  const students = dataStore.users.filter(
    (u) => u.role === "STUDENT" && u.batchYear === batchYear
  );

  const courses = dataStore.courses.filter((c) => c.batchYear === batchYear);
  const courseIds = new Set(courses.map((c) => c.id));
  const batchSessions = dataStore.sessions.filter((s) => courseIds.has(s.courseId));

  const rows = students.map((student) => {
    const studentRecords = dataStore.records.filter((r) => r.studentId === student.id);
    const present = studentRecords.filter((r) => r.status === "PRESENT").length;
    const absent = studentRecords.filter((r) => r.status === "ABSENT").length;
    const excused = studentRecords.filter((r) => r.status === "EXCUSED").length;
    const total = present + absent;
    const rate = total > 0 ? `${Math.round((present / total) * 100)}%` : "N/A";

    return {
      "Student ID": student.studentId || "N/A",
      "Full Name": student.fullName,
      "Phone Number": student.phoneNumber,
      "Telegram Bound": student.telegramId ? "Yes" : "No",
      "Sessions Present": present,
      "Sessions Absent": absent,
      "Sessions Excused": excused,
      "Attendance Rate": rate,
      "Academic Status":
        total > 0 && (present / total) * 100 < 75 ? "CRITICAL RISK (<75%)" : "GOOD STANDING",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Year ${batchYear} Attendance`);

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  return excelBuffer;
}
