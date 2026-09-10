# Software Requirements Specification (SRS)
## Smart Telegram-Integrated Class Attendance Management System
**Document Version:** 2.0.0-PROD  
**Status:** Approved for Architecture & Implementation  
**Standard Compliance:** IEEE 830 / ISO/IEC/IEEE 29148  
**Target Environment:** Vercel Serverless (Next.js 15+ App Router) + Neon PostgreSQL + Upstash Redis + Telegram Bot & Mini App Platform  

---

## 1. Executive Summary & Document Control

### 1.1 Purpose
This document specifies the technical and functional requirements for the **Smart Telegram-Integrated Class Attendance Management System**. The system is an enterprise-grade, fraud-resistant, low-latency attendance platform tailored for university academic departments (e.g., Department of Software Engineering). It unifies a **Telegram Bot & Mini App interface** for instructors and students with a high-performance **Next.js 15+ administrative web dashboard** for Department Leadership.

### 1.2 Scope & Business Objectives
* **Elimination of Proxy Attendance:** Enforce single-device hardware binding via Telegram native cryptographic contact verification, combined with time-decaying dynamic visual tokens (Rotating QR) and brute-force resilient rolling codes.
* **Extreme Environmental Resiliency (Power & Network Outages):** Maintain uninterrupted in-class attendance capture during projector power failures or campus network blackouts through an offline-tolerant, instructor-device broadcast mode.
* **Serverless Scalability & Zero Idle Cost:** Operate natively on modern serverless infrastructure (Vercel Serverless Edge/Node Runtime) without database connection exhaustion, memory leaks, or execution timeout hazards during concurrent morning check-in spikes (up to 500 concurrent requests within a 15-second window).
* **Actionable Academic Analytics:** Provide Department Heads with real-time cohort attendance tracking across 5 academic batches (Years 1–5), flagging at-risk students for counseling prior to semester examination eligibility cutoffs.

### 1.3 Definitions, Acronyms, and Abbreviations
| Term | Definition |
| :--- | :--- |
| **SRS** | Software Requirements Specification |
| **TMA** | Telegram Mini App (Web application running inside Telegram webview with signed context) |
| **OTP** | One-Time Passcode |
| **TTL** | Time-To-Live (in seconds, enforced via Redis volatile keys) |
| **HMAC** | Hash-based Message Authentication Code |
| **EAT** | East Africa Time (UTC+3) |
| **CUID** | Collision-resistant Unique Identifier |
| **SSE** | Server-Sent Events (unidirectional real-time event streaming over HTTP) |

---

## 2. System Architecture & Component Interactions

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 Clients Layer                                   │
├───────────────────────┬───────────────────────────────┬─────────────────────────┤
│  Dept Head Web Panel  │    Instructor Control Deck    │   Student Client        │
│   (Desktop Chrome/FF) │ (Telegram WebApp / Desktop UI)│ (Telegram Bot / TMA)    │
└───────────┬───────────┴───────────────┬───────────────┴────────────┬────────────┘
            │ HTTPS                     │ HTTPS / SSE                │ Telegram MTProto
            ▼                           ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│              Application Layer: Next.js 15+ (Vercel Serverless)                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│ • /api/bot/webhook          : Signed Telegram Bot Update Ingestion              │
│ • /api/sessions/[id]/stream : SSE Stream for Projector Dynamic QR Rotation      │
│ • /api/sessions/verify      : High-Throughput Verification (Redis Atomicity)    │
│ • /api/cron/weekly-digest   : Cryptographically Authenticated Cron Job          │
│ • Server Actions & Route Handlers with React Server Components (RSC)            │
└───────────────────────────────┬───────────────────────────────┬─────────────────┘
                                │                               │
                   (Prisma Transactional DB)           (In-Memory Cache & OTP)
                                ▼                               ▼
┌──────────────────────────────────────────────┐ ┌────────────────────────────────┐
│         Neon Serverless PostgreSQL           │ │          Upstash Redis         │
│  - PgBouncer Pooling (Port 6543)             │ │  - Active Session Meta         │
│  - Academic Batches & Enrollments            │ │  - Ephemeral Seeds & Nonces    │
│  - Immutable Audit & Attendance Records      │ │  - Sliding-Window Rate Limiter │
└──────────────────────────────────────────────┘ └────────────────────────────────┘
```

### 2.1 Technology Stack & Architectural Decisions
| Layer / Subsystem | Technology Selected | Architectural Rationale & Guardrails |
| :--- | :--- | :--- |
| **Fullstack Web** | Next.js 15+ (App Router, TS, React 19) | Server Components for instant dashboard rendering; unified TypeScript types across Webhook routes, Server Actions, and Mini Apps. |
| **Relational Database** | Neon PostgreSQL (Serverless) | Instant scale-to-zero, autoscaling branches, native connection pooling (`pgBouncer`) preventing Vercel pool exhaustion. |
| **Data Access Layer** | Prisma ORM + `@prisma/adapter-pg` | Type-safe queries, migration control, relation isolation, strict foreign key constraints. |
| **Transient State & Cache**| Upstash Redis (REST / Pipeline API)| Edge-compatible HTTP-based Redis driver eliminating connection overhead; atomic operations (`SET ... EX NX`, Lua scripts). |
| **Bot Framework** | GrammY (Webhook Mode) | Lightest footprint, fastest cold-start times on Vercel Edge/Node runtimes, native TypeScript support, composable middleware. |
| **Real-time Delivery** | Server-Sent Events (SSE) / Polling fallback | Low complexity token rotation for projector display without requiring external WebSocket infrastructure. |
| **Reporting / Export** | SheetJS (`xlsx`) + Client-Side PDF (`jspdf`) | In-browser stream generation avoiding server memory saturation during multi-year roster exports. |

---

## 3. User Roles & Detailed Authorization Matrix

The system enforces strict Role-Based Access Control (RBAC).

| Feature / Action | Student | Instructor | Department Head | System / Cron |
| :--- | :---: | :---: | :---: | :---: |
| **Execute `/start` & Verify Contact** | Yes | Yes | Yes | — |
| **Launch Attendance Session (QR / Passcode)** | No | Yes (Assigned courses only) | No | — |
| **Extend / Terminate Active Session** | No | Yes (Author only) | Yes (Emergency override) | Auto-TTL |
| **Submit Attendance Check-In** | Yes (Whitelisted only) | No | No | — |
| **Mark Student as `EXCUSED`** | No | Yes (Within 72h window) | Yes (Anytime) | — |
| **View Individual Attendance Metrics** | Self Only | Assigned Courses | Entire Department (Y1–Y5) | — |
| **Upload / Update Cohort Rosters (CSV/XLSX)** | No | No | Yes | — |
| **Trigger Unscheduled Sync / Report** | No | No | Yes | Yes |

---

## 4. Functional Requirements (FR)

### 4.1 Identity Verification & Single-Device Enforcement
* **FR-1.1 (Pre-Provisioned Whitelist Anchor):** The Department Head must upload a verified student and instructor roster containing: `Full Name`, `National / University ID`, `Normalized E.164 Phone Number`, and `Batch Year` (1 to 5).
* **FR-1.2 (Cryptographic Contact Handshake):** When a user sends `/start` to the Telegram bot:
  1. The bot shall request user phone number sharing via Telegram's native `KeyboardButtonRequestContact` button.
  2. The server must verify that `update.message.contact.user_id === update.message.from.id`.
  3. **Anti-Spoofing Rule:** If a user forwards another contact card or sends a manually constructed contact, the bot shall reject the message as a security violation.
* **FR-1.3 (Identity Binding & Device Locking):** Upon valid contact verification:
  1. If `phoneNumber` is present in the whitelist, bind `user.telegramId = update.message.from.id`.
  2. If `telegramId` is already claimed by another active user record, reject the request with `409 Conflict: Device already bound`.
  3. Subsequent interactions authenticate automatically via signed `Telegram.WebApp.initData` (Mini App) or `update.message.from.id` (Bot direct messages).
* **FR-1.4 (De-provisioning & Unbinding):** Only the Department Head can reset a student's bound `telegramId` (e.g., in cases of lost phone or SIM transfer) through the admin panel.

### 4.2 Instructor Session Lifecycle Management
* **FR-2.1 (Scope Restriction):** Instructors can only launch sessions for courses formally mapped to their `instructorId` via `CourseInstructor` table.
* **FR-2.2 (Session Initialization Payload):** When initializing a session, the instructor defines:
  * Course ID
  * Verification Mode: **Dynamic QR (Projector)**, **Rolling In-App Passcode (Low-tech/Outage)**, or **Dual-Mode**
  * Auto-Close Expiry (Default: 10 minutes; Range: 3–30 minutes)
* **FR-2.3 (Session State Machine):**
  ```
  [CREATED] ──> [ACTIVE] ──> [CLOSING / MATERIALIZING] ──> [TERMINATED]
                   │
                   └──> [EMERGENCY ABORT (Voided)]
  ```
* **FR-2.4 (Materialization of Absences):** Upon session termination (manual or timeout):
  1. The system shall query all active students enrolled in the course cohort (`batchYear`).
  2. Any student lacking an `AttendanceRecord` for that `sessionId` shall be batch-inserted as `status = ABSENT` inside an atomic Prisma transaction.
  3. Real-time session analytics are compiled and cached in Redis.

### 4.3 Anti-Proxy Verification Modes & Fraud Prevention

#### Mode A: Dynamic Projector QR Code
* **FR-3.1 (Time-Decaying Seed Rotation):**
  * The projector screen displays a QR code encoding a secure signed JWT payload:
    `{ sessionId: string, seed: string, exp: number, sig: string }`
  * The `seed` expires in Upstash Redis every **15 seconds** with a grace window of 5 seconds (total 20s validity) to prevent network transit rejections.
  * Capturing a photo and messaging it outside the hall fails because the token invalidates before remote recipients can render and submit it.
* **FR-3.2 (Telegram Mini App Scanner):** Students tap "Scan In-Class QR" inside the Telegram Bot, opening the Mini App camera scanner. The Mini App unpacks the token and posts to `/api/sessions/verify` with the student's signed `initData`.

#### Mode B: Rolling In-App Passcode (Classroom Outage Mode)
* **FR-3.3 (High-Contrast Cycling Passcode):** Designed for power outages, broken projectors, or off-grid lecture halls:
  * Instructor's mobile phone displays a large 6-character alphanumeric rolling token (e.g., `K7-94M`). *(Upgraded from 4-digit numeric to prevent remote guessing).*
  * Token refreshes every **20 seconds** via a Redis key `session:{sessionId}:passcode`.
  * The instructor shows the phone screen or writes it on the physical chalkboard.
* **FR-3.4 (Rate Limiting & Guess Defense):**
  * A student gets a maximum of **3 consecutive incorrect attempts**.
  * After 3 failures, the student's bot interactions are locked out for **90 seconds** using an Upstash sliding-window rate limit key `lockout:{studentId}`.

### 4.4 Absence Reconciliation & Excuse Tracking
* **FR-4.1 (State Definitions):**
  * `PRESENT`: Verified successfully during active session.
  * `ABSENT`: Did not check in before session termination.
  * `EXCUSED`: Documented medical, athletic, or bereavement absence approved by faculty.
* **FR-4.2 (Audit Trail for Overrides):** Any change of status from `ABSENT` to `EXCUSED` must log:
  * `reconciledById` (User ID of faculty or Dept Head)
  * `reconciledAt` (Timestamp)
  * `reasonNote` (Mandatory text, min 10 characters)
* **FR-4.3 (Analytics Exclusion):** Students with `EXCUSED` are counted in course attendance ratios as:
  $$\text{Attendance Rate} = \frac{\text{PRESENT}}{\text{TOTAL SESSIONS} - \text{EXCUSED}} \times 100$$
  This prevents excused absences from falsely triggering academic probation alerts.

### 4.5 Department Head Web Dashboard & Analytics
* **FR-5.1 (Cohort Matrix Overview):** Real-time departmental view partitioned into:
  * Year 1 (Freshman), Year 2 (Sophomore), Year 3 (Junior), Year 4 (Senior), Year 5 (Finalists/Interns).
* **FR-5.2 (Early Warning System / At-Risk Detection):**
  * Automated threshold tagging:
    * **Healthy:** $\ge 85\%$
    * **Warning (Yellow):** $75\% - 84.9\%$
    * **Critical Risk (Red / Exam Bar Risk):** $< 75\%$
* **FR-5.3 (Report Export Engine):**
  * Export student cohort breakdown directly into formatted Excel sheets (`.xlsx`) with automated styling, formulas, and department letterhead.
* **FR-5.4 (Automated Friday Executive Telegram Digest):**
  * Scheduled via Vercel Cron on **Fridays at 18:00 EAT (15:00 UTC)**:
  * Compiles:
    1. Weekly total attendance percentage per batch.
    2. Top 3 courses with highest absenteeism.
    3. List of students who dropped below the $75\%$ critical threshold during the current week.
  * Dispatches markdown-formatted executive briefing directly to the Department Head's Telegram account.

---

## 5. Non-Functional & Operational Requirements (NFR)

### 5.1 Performance & Latency Budgets
* **NFR-1.1 (Verification Latency):** Over the Telegram Mini App or Webhook, `/api/sessions/verify` must process, validate against Redis, and return an HTTP 200/400 response in **$\le 45\text{ms}$** (p95) excluding mobile cellular network latency.
* **NFR-1.2 (Concurrency Throughput):** The system must handle an arrival rate of **150 submissions/second** at class start without HTTP 504 timeouts or database connection drops.
* **NFR-1.3 (Serverless Cold Start Optimization):** Bundle sizes for `/api/bot` webhook and verification endpoints must stay under 5MB to ensure serverless cold starts on Vercel remain under 250ms.

### 5.2 Security, Cryptography, and Anti-Fraud
* **NFR-2.1 (Telegram Webhook Validation):** All incoming requests to `/api/bot` must validate the `X-Telegram-Bot-Api-Secret-Token` header against `process.env.TELEGRAM_WEBHOOK_SECRET`.
* **NFR-2.2 (Telegram Mini App Authentication):** All TMA API requests must submit the full query string `initData`. The server validates integrity using HMAC-SHA256 with the bot token according to Telegram Core specs.
* **NFR-2.3 (Zero Replay Tolerance):** Dynamic QR tokens encode a single-use random salt (nonce). When a student successfully checks in, Redis executes an atomic Lua script:
  ```lua
  if redis.call("HEXISTS", KEYS[1], ARGV[1]) == 1 then
      return 0
  else
      redis.call("HSET", KEYS[1], ARGV[1], ARGV[2])
      return 1
  end
  ```
  If returning 0, the token has already been spent.
* **NFR-2.4 (Database Connection Pool Guard):** Direct connections to PostgreSQL are forbidden in serverless handlers. All Prisma queries must use `DATABASE_URL` configured with `?pgbouncer=true&connection_limit=10`.

### 5.3 Reliability & Local Availability
* **NFR-3.1 (Dashboard Offline Degradation):** The Department Head dashboard shall synchronize fetched roster and historical attendance matrices into `IndexedDB`. If the campus internet drops, the dashboard functions in read-only analysis mode.
* **NFR-3.2 (Graceful Degradation for Outages):** If a lecture room has zero mobile reception for students, the instructor can switch the session to "Emergency Paper Roster Mode", generating a printable or exportable one-time sign-in roster ready for bulk upload.

---

## 6. Comprehensive Data Schema (Prisma)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

enum Role {
  STUDENT
  INSTRUCTOR
  DEPT_HEAD
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  EXCUSED
}

enum SessionMode {
  DYNAMIC_QR
  ROLLING_CODE
  HYBRID
}

model AcademicYear {
  id          String     @id @default(cuid())
  yearName    String     // e.g. "2025/2026"
  semester    Int        // 1 or 2
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean    @default(true)
  courses     Course[]
  createdAt   DateTime   @default(now())

  @@unique([yearName, semester])
  @@index([isActive])
}

model User {
  id             String             @id @default(cuid())
  phoneNumber    String             @unique // E.164 format (e.g. +251911223344)
  telegramId     BigInt?            @unique // Bound upon Telegram Contact Handshake
  fullName       String
  studentId      String?            @unique // Department ID (e.g. "UGR/1420/14")
  role           Role               @default(STUDENT)
  batchYear      Int?               // Academic Year (1 to 5)
  isActive       Boolean            @default(true)
  
  // Relations
  coursesTaught       CourseInstructor[]
  attendances         AttendanceRecord[]
  createdSessions     AttendanceSession[]  @relation("SessionInstructor")
  excusedAttendances  AttendanceRecord[]   @relation("ExcusedByFaculty")

  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt

  @@index([role, batchYear])
  @@index([telegramId])
}

model Course {
  id             String              @id @default(cuid())
  courseCode     String              // e.g. "SEng3112"
  title          String              // e.g. "Software Architecture"
  batchYear      Int                 // Cohort Year: 1, 2, 3, 4, 5
  academicYearId String
  academicYear   AcademicYear        @relation(fields: [academicYearId], references: [id], onDelete: Cascade)
  
  instructors    CourseInstructor[]
  sessions       AttendanceSession[]
  createdAt      DateTime            @default(now())

  @@unique([courseCode, academicYearId])
  @@index([batchYear])
}

model CourseInstructor {
  id           String     @id @default(cuid())
  courseId     String
  instructorId String
  course       Course     @relation(fields: [courseId], references: [id], onDelete: Cascade)
  instructor   User       @relation(fields: [instructorId], references: [id], onDelete: Cascade)

  @@unique([courseId, instructorId])
  @@index([instructorId])
}

model AttendanceSession {
  id          String             @id @default(cuid())
  courseId    String
  course      Course             @relation(fields: [courseId], references: [id], onDelete: Cascade)
  openedById  String
  openedBy    User               @relation("SessionInstructor", fields: [openedById], references: [id])
  mode        SessionMode        @default(DYNAMIC_QR)
  isClosed    Boolean            @default(false)
  expiresAt   DateTime
  closedAt    DateTime?
  createdAt   DateTime           @default(now())
  
  records     AttendanceRecord[]

  @@index([courseId, isClosed])
  @@index([openedById])
}

model AttendanceRecord {
  id             String             @id @default(cuid())
  sessionId      String
  session        AttendanceSession  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  studentId      String
  student        User               @relation(fields: [studentId], references: [id], onDelete: Cascade)
  status         AttendanceStatus   @default(PRESENT)
  markedAt       DateTime           @default(now())
  
  // Audit Trail for EXCUSED Reconciliation
  excuseReason   String?
  reconciledById String?
  reconciledBy   User?              @relation("ExcusedByFaculty", fields: [reconciledById], references: [id])
  reconciledAt   DateTime?

  @@unique([sessionId, studentId])
  @@index([studentId, status])
  @@index([sessionId, status])
}
```

---

## 7. Real-Time Token & Key-Space Architecture (Upstash Redis)

To achieve sub-30ms execution without transactional lock contention in PostgreSQL, ephemeral state lives in Upstash Redis.

| Key Pattern | Data Type | TTL | Purpose |
| :--- | :---: | :---: | :--- |
| `session:{sessionId}:meta` | Hash | 30 mins | Stores session status, instructor ID, mode, and allowed batch. |
| `session:{sessionId}:qr_seed` | String | 15 secs | Current random cryptoseed displayed on projector. |
| `session:{sessionId}:code` | String | 20 secs | Current 6-char rolling code for outage mode. |
| `session:{sessionId}:spent_tokens` | Set | 60 mins | Salt nonces already scanned to eliminate replay attacks. |
| `ratelimit:verify:{studentId}` | String | 1 sec | Sliding window rate limit (1 req/sec/student). |
| `lockout:failed_attempts:{studentId}` | Int (Counter) | 90 secs | Incremented on invalid OTP; locks out after 3 tries. |

---

## 8. API Specifications & Sequence Workflows

### 8.1 Verification Sequence Diagram (Dynamic QR Mode)

```
Student Phone (TMA)          Next.js Serverless API              Upstash Redis            Neon PostgreSQL
      │                                │                               │                        │
      ├────── 1. Post Scanned QR ─────>│                               │                        │
      │   (initData + seed + nonce)    ├──── 2. Rate-limit Check ─────>│                        │
      │                                │<─── Allowed (OK) ─────────────┤                        │
      │                                │                               │                        │
      │                                ├──── 3. Validate Seed & Nonce ─>│                        │
      │                                │<─── Valid & Unspent ──────────┤                        │
      │                                │                               │                        │
      │                                ├──── 4. Atomically Mark Token ─>│                        │
      │                                │                               │                        │
      │                                ├──── 5. Insert Record ─────────────────────────────────>│
      │                                │<─── Created (status=PRESENT) ──────────────────────────┤
      │                                │                               │                        │
      │<───── 6. 200 OK Confirmed ─────┤                               │                        │
```

### 8.2 Endpoints Definition

#### 1. Ingest Telegram Updates
* **Route:** `POST /api/bot`
* **Security:** Header `X-Telegram-Bot-Api-Secret-Token` validation
* **Behavior:** Processes `/start`, contact sharing, and direct text rolling-code entries.

#### 2. Projector Dynamic Token Stream
* **Route:** `GET /api/sessions/[sessionId]/stream`
* **Protocol:** Server-Sent Events (SSE)
* **Response Content:** `data: { "seed": "a9f8b2c4...", "expiresIn": 15 }\n\n`
* **Security:** Instructor JWT session bearer token.

#### 3. Student Check-in Verification
* **Route:** `POST /api/sessions/verify`
* **Body:**
  ```json
  {
    "sessionId": "cuid_xyz123",
    "tokenType": "DYNAMIC_QR" | "ROLLING_CODE",
    "payload": "k83hd9... (seed or 6-char OTP)",
    "nonce": "random_uuid_v4"
  }
  ```
* **Headers:** `X-Telegram-Init-Data: <raw_url_encoded_telegram_init_data>`
* **Responses:**
  * `200 OK`: `{"success": true, "markedAt": "..."}`
  * `400 Bad Request`: `{"error": "TOKEN_EXPIRED_OR_INVALID"}`
  * `409 Conflict`: `{"error": "ALREADY_CHECKED_IN"}`
  * `429 Too Many Requests`: `{"error": "RATE_LIMIT_EXCEEDED"}`

---

## 9. Next.js 15 Project File Tree & Implementation Blueprint

```
university-attendance/
├── .env.example
├── next.config.ts
├── package.json
├── tsconfig.json
├── vercel.json                              # Vercel Cron schedule configurations
├── prisma/
│   ├── schema.prisma                        # Production schema with driverAdapters
│   ├── migrations/                          # Automated SQL migration tracks
│   └── seed.ts                              # Sample department & batch seeder
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx               # Admin sidebar, session banner
│   │   │       ├── page.tsx                 # Executive metrics, Year 1-5 health indicators
│   │   │       ├── batches/
│   │   │       │   └── [batchYear]/page.tsx # Drill-down roster per academic batch
│   │   │       ├── courses/
│   │   │       │   └── [courseId]/page.tsx  # Course-level attendance & excuse logs
│   │   │       └── rosters/
│   │   │           └── page.tsx             # Bulk CSV/Excel parser & contact whitelister
│   │   ├── (faculty)/
│   │   │   └── instructor/
│   │   │       ├── page.tsx                 # Active courses launcher
│   │   │       └── session/
│   │   │           └── [sessionId]/
│   │   │               ├── page.tsx         # Responsive projector & mobile screen view
│   │   │               └── live-roster.tsx  # Real-time incoming attendance feed
│   │   ├── (student)/
│   │   │   └── mini-app/
│   │   │       ├── layout.tsx               # Telegram WebApp SDK initialization
│   │   │       └── page.tsx                 # Native camera QR scanner & status card
│   │   └── api/
│   │       ├── bot/
│   │       │   └── route.ts                 # GrammY Telegram webhook handler
│   │       ├── sessions/
│   │       │   ├── create/route.ts          # Session opener
│   │       │   ├── [sessionId]/stream/route.ts # SSE token streamer for projector
│   │       │   ├── verify/route.ts          # High-performance Upstash verification
│   │       │   ├── excuse/route.ts          # Medical/faculty absence override
│   │       │   └── close/route.ts           # Materialize absent records & terminate
│   │       └── cron/
│   │           └── weekly-digest/route.ts   # Friday 18:00 EAT Telegram dispatcher
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AttendanceHeatmap.tsx
│   │   │   ├── BatchCard.tsx
│   │   │   └── ExportReportModal.tsx
│   │   ├── instructor/
│   │   │   ├── DynamicQRCanvas.tsx          # Real-time SVG QR renderer
│   │   │   └── RollingPasscodeCard.tsx      # High-contrast 6-character code presenter
│   │   └── ui/                              # Radix-based accessible UI primitives
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── telegram.ts                  # initData HMAC validator & contact inspector
│   │   │   └── session.ts                   # Role verification guards
│   │   ├── bot/
│   │   │   ├── bot.ts                       # GrammY bot instance definition
│   │   │   └── handlers/                    # Command & Contact action handlers
│   │   ├── db/
│   │   │   └── prisma.ts                    # Singleton PrismaClient with Neon Pooler
│   │   ├── redis/
│   │   │   ├── client.ts                    # Upstash Redis client
│   │   │   └── rate-limiter.ts              # Upstash Sliding Window Limiter
│   │   └── export/
│   │       ├── excel.ts                     # SheetJS .xlsx builder with styling
│   │       └── pdf.ts                       # Tabular PDF roster formatter
│   └── types/
│       └── index.ts                         # Unified TypeScript models & API DTOs
```

---

## 10. Quality Assurance & Verification Criteria

| ID | Requirement | Verification Method | Acceptance Pass Criteria |
| :--- | :--- | :--- | :--- |
| **TC-01** | Anti-Proxy: Photo of QR shared remotely | Manual Security Test | QR code photographed on mobile phone and forwarded via chat fails verification within 15 seconds. |
| **TC-02** | Contact Spoofing Defense | Automated Unit Test | Telegram webhook payload with `contact.user_id !== from.id` triggers immediate `403 Forbidden` and security audit log. |
| **TC-03** | Concurrency Load Test | k6 Load Test Script | 150 concurrent check-in submissions over 15 seconds sustain 100% success with $p95 < 50\text{ms}$ on serverless edge. |
| **TC-04** | Class Absence Materialization | Integration Test | When an instructor closes a session with 60 enrolled students and 45 present, exactly 15 records are inserted as `ABSENT`. |
| **TC-05** | Power-Outage Resilience | Field Simulation | Instructor toggles to Rolling Code mode on cellular 3G; students manually enter 6-character code into Telegram; all valid check-ins persist. |
| **TC-06** | Friday Scheduled Digest | Simulated Cron Trigger | GET to `/api/cron/weekly-digest` with valid Bearer token triggers automated department KPI dispatch to Dept Head's chat ID. |
