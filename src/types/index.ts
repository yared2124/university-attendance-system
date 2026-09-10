export type Role = "STUDENT" | "INSTRUCTOR" | "DEPT_HEAD";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED";

export type SessionMode = "DYNAMIC_QR" | "ROLLING_CODE" | "HYBRID";

export interface UserSessionProfile {
  id: string;
  phoneNumber: string;
  telegramId?: string | null;
  fullName: string;
  studentId?: string | null;
  role: Role;
  batchYear?: number | null;
  isActive: boolean;
}

export interface DynamicQRTokenPayload {
  sessionId: string;
  seed: string;
  expiresIn: number;
  courseCode: string;
  courseTitle: string;
  timestamp: number;
}

export interface VerifyCheckInRequest {
  sessionId: string;
  tokenType: "DYNAMIC_QR" | "ROLLING_CODE";
  payload: string; // seed token or 6-char OTP
  nonce?: string;  // anti-replay UUID
}

export interface VerifyCheckInResponse {
  success: boolean;
  message: string;
  markedAt?: string;
  status?: AttendanceStatus;
  studentName?: string;
  studentId?: string;
}

export interface TelegramWebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramWebAppData {
  query_id?: string;
  user?: TelegramWebAppUser;
  auth_date: number;
  hash: string;
  [key: string]: unknown;
}

export interface AttendanceAnalyticsSummary {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  attendanceRate: number; // calculated as present / (total - excused) * 100
  statusTier: "HEALTHY" | "WARNING" | "CRITICAL";
}

export interface BatchKPI {
  batchYear: number;
  name: string;
  totalStudents: number;
  overallAttendanceRate: number;
  atRiskCount: number; // attendance < 75%
  activeSessionsCount: number;
}
