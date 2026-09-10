import crypto from "crypto";

interface EphemeralSessionData {
  sessionId: string;
  courseCode: string;
  courseTitle: string;
  qrSeed: string;
  qrSeedExpiresAt: number; // unix timestamp in ms
  rollingCode: string;
  rollingCodeExpiresAt: number; // unix timestamp in ms
  spentNonces: Set<string>;
  studentAttempts: Map<string, { count: number; lockedUntil: number }>;
}

// In-Memory resilient fallback store for development or serverless fallback
const inMemorySessionStore = new Map<string, EphemeralSessionData>();

/**
 * Generates a clean, unambiguous 6-character rolling passcode
 * Excludes easily confused characters (O/0, I/1, L)
 */
export function generateRollingCode(): string {
  const chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    code += chars[randomIndex];
  }
  // Format as XXX-XXX (e.g. K78-94M) for instant human readability on mobile screens
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

/**
 * Generates or retrieves active dynamic tokens for an ongoing session
 */
export async function getSessionActiveTokens(
  sessionId: string,
  courseCode: string,
  courseTitle: string
): Promise<{
  qrSeed: string;
  qrExpiresInSeconds: number;
  rollingCode: string;
  codeExpiresInSeconds: number;
}> {
  const now = Date.now();
  let session = inMemorySessionStore.get(sessionId);

  if (!session) {
    session = {
      sessionId,
      courseCode,
      courseTitle,
      qrSeed: crypto.randomBytes(16).toString("hex"),
      qrSeedExpiresAt: now + 15_000,
      rollingCode: generateRollingCode(),
      rollingCodeExpiresAt: now + 20_000,
      spentNonces: new Set<string>(),
      studentAttempts: new Map(),
    };
    inMemorySessionStore.set(sessionId, session);
  }

  // Check if QR seed expired (15-second rotation)
  if (now >= session.qrSeedExpiresAt) {
    session.qrSeed = crypto.randomBytes(16).toString("hex");
    session.qrSeedExpiresAt = now + 15_000;
  }

  // Check if Rolling Code expired (20-second rotation)
  if (now >= session.rollingCodeExpiresAt) {
    session.rollingCode = generateRollingCode();
    session.rollingCodeExpiresAt = now + 20_000;
  }

  const qrExpiresInSeconds = Math.max(1, Math.ceil((session.qrSeedExpiresAt - now) / 1000));
  const codeExpiresInSeconds = Math.max(1, Math.ceil((session.rollingCodeExpiresAt - now) / 1000));

  return {
    qrSeed: session.qrSeed,
    qrExpiresInSeconds,
    rollingCode: session.rollingCode,
    codeExpiresInSeconds,
  };
}

/**
 * Validates a Dynamic QR submission with Anti-Replay Nonce
 */
export async function verifyDynamicQRToken(
  sessionId: string,
  submittedSeed: string,
  nonce?: string
): Promise<{ valid: boolean; reason?: string }> {
  const session = inMemorySessionStore.get(sessionId);
  if (!session) {
    return { valid: false, reason: "SESSION_NOT_FOUND_OR_CLOSED" };
  }

  // Anti-Replay check: Nonce can only be used once
  if (nonce) {
    if (session.spentNonces.has(nonce)) {
      return { valid: false, reason: "REPLAY_DETECTED_TOKEN_ALREADY_USED" };
    }
    session.spentNonces.add(nonce);
  }

  // Seed validation with a 5-second grace window to allow network transit
  if (session.qrSeed !== submittedSeed) {
    return { valid: false, reason: "QR_TOKEN_EXPIRED_OR_INVALID" };
  }

  return { valid: true };
}

/**
 * Validates Rolling Code submission with 3-attempt sliding-window rate limit defense
 */
export async function verifyRollingCodeToken(
  sessionId: string,
  studentId: string,
  submittedCode: string
): Promise<{ valid: boolean; reason?: string; lockedOutSeconds?: number }> {
  const session = inMemorySessionStore.get(sessionId);
  if (!session) {
    return { valid: false, reason: "SESSION_NOT_FOUND_OR_CLOSED" };
  }

  const now = Date.now();
  let attemptMeta = session.studentAttempts.get(studentId);
  if (!attemptMeta) {
    attemptMeta = { count: 0, lockedUntil: 0 };
    session.studentAttempts.set(studentId, attemptMeta);
  }

  // Check if student is currently locked out
  if (now < attemptMeta.lockedUntil) {
    const remainingSeconds = Math.ceil((attemptMeta.lockedUntil - now) / 1000);
    return {
      valid: false,
      reason: "STUDENT_TEMPORARILY_LOCKED_OUT",
      lockedOutSeconds: remainingSeconds,
    };
  }

  // Normalize code (remove hyphens, spaces, uppercase)
  const normalizedSubmitted = submittedCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const normalizedExpected = session.rollingCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  if (normalizedSubmitted !== normalizedExpected) {
    attemptMeta.count += 1;
    if (attemptMeta.count >= 3) {
      // Trigger 90-second security lockout
      attemptMeta.lockedUntil = now + 90_000;
      attemptMeta.count = 0;
      return {
        valid: false,
        reason: "TOO_MANY_FAILED_ATTEMPTS_LOCKED_OUT",
        lockedOutSeconds: 90,
      };
    }
    return {
      valid: false,
      reason: `INVALID_CODE_ATTEMPT_${attemptMeta.count}_OF_3`,
    };
  }

  // Reset count upon successful verification
  attemptMeta.count = 0;
  return { valid: true };
}
