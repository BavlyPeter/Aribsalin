# اريبصالين (Aribsalin) - Church Festival & Sunday School Management System
## Unified Master Technical Architecture & Developer Reference Manual

**System Version:** `2.3.0` (Servant Attendance Module, Smart QR Router, Developer God-Mode, Actionable Contacts, Dual-Login, Global Zustand Store)  
**Target Platform:** Mobile-First Responsive Web Application / PWA-Ready  
**Primary Language & Direction:** Arabic (`ar`) / Right-to-Left (`dir="rtl"`)  
**Parish / Organization:** Church of the Great Martyr St. Mina the Wonderworker & Pope Kyrillos VI - Aswan, Egypt  
**Documentation Path:** `PROJECT-DOCUMENTATION.md`  
**Last Updated:** September 2026  

---

## Table of Contents
- [اريبصالين (Aribsalin) - Church Festival \& Sunday School Management System](#اريبصالين-aribsalin---church-festival--sunday-school-management-system)
  - [Unified Master Technical Architecture \& Developer Reference Manual](#unified-master-technical-architecture--developer-reference-manual)
  - [Table of Contents](#table-of-contents)
  - [1. Project Idea \& Concept](#1-project-idea--concept)
    - [Executive Summary](#executive-summary)
    - [Core Business Problems Solved](#core-business-problems-solved)
  - [2. Features Overview](#2-features-overview)
    - [Core Features](#core-features)
    - [Registration \& Profiles](#registration--profiles)
    - [QR \& ID Card System](#qr--id-card-system)
    - [Points \& Marketplace](#points--marketplace)
    - [Financial Management](#financial-management)
  - [3. Tech Stack \& Tooling](#3-tech-stack--tooling)
  - [4. User Roles \& Workflows](#4-user-roles--workflows)
    - [RBAC Matrix](#rbac-matrix)
    - [Key Workflows](#key-workflows)
  - [5. Architecture \& State Management](#5-architecture--state-management)
    - [Database Schema Specification (Supabase PostgreSQL)](#database-schema-specification-supabase-postgresql)

---

## 1. Project Idea & Concept

### Executive Summary
**اريبصالين (Aribsalin)** is an enterprise-grade, mobile-first festival, Sunday school, and church ministry management system engineered specifically for the **Church of the Great Martyr St. Mina the Wonderworker & Pope Kyrillos VI in Aswan, Egypt**. Built as a reactive single-page application (SPA), the platform digitizes and unifies the operational lifecycle of summer deacon programs, spiritual festivals, and weekly youth services across all educational cohorts.

### Core Business Problems Solved
1. **Morning Arrival Bottlenecks:** Hardware camera and screenshot-based QR badge scanning that parses credentials and updates state in under 300ms.
2. **Attendance Fraud & Duplicate Claims:** Enforces atomic PostgreSQL unique constraints (`unique_daily_attendance`), strictly blocking duplicate check-in credits.
3. **Loss of Physical Badges:** Generates dynamic digital ID cards rendered client-side that can be downloaded as high-resolution PNGs or batch-processed PDF card decks.
4. **Disorganized Reward Economy:** Immutable, append-only double-entry points ledger (`points_transactions`) with strict balance validation preventing overdrafts.
5. **Decentralized Multi-Stage Management:** Granular Stage-scoped statistics and views for class supervisors.
6. **Financial Opacity:** Integrated Treasury Ledger linking financial records directly to stages and responsible servants.
7. **Servant Login Friction:** Dual-Login Mechanism seamlessly accepting either a Smart ID or an 11-digit Egyptian mobile phone number.
8. **Communication Gaps:** Actionable Contact Links directly into profile screens for native one-tap dialing (`tel:`) and instant WhatsApp chat opening (`https://wa.me/201...`).
9. **Servant Accountability & Tracking (v2.3.0):** An independent tracking module for Servants (`servant_attendance_logs`) capturing both "Class" and "Service Meeting" attendance without polluting student analytics.

---

## 2. Features Overview

### Core Features
- Complete festival management system for summer deacon school.
- Arabic RTL support throughout the application.
- Burgundy-gold color scheme (Coptic Orthodox Church branding).

### Registration & Profiles
- **Student Registration:** Dynamic fields based on 6 education stages, multiple contact numbers, and address collection.
- **Servant Onboarding:** Automatic Smart ID generation, pre-flight phone uniqueness checking, and pending status assignment.
- **Profiles:** Detailed views for students and servants showing attendance percentages, point gauges, and actionable contact buttons.

### QR & ID Card System
- **Smart Router QR Scanner:** Automatically distinguishes between Student IDs and Servant IDs in a single camera stream.
- **Multi-Mode Scanning:** Attendance, Market Deduction, Add Points, and View Details modes.
- **Offline-Safe ID Cards:** 350x550px downloadable PNGs with gender-based color theming and Level-H QR codes.

### Points & Marketplace
- Automatic +10 points on attendance.
- Overdraft-guarded marketplace checkout.
- Manual points adjustment via search modals with complete ledger tracking.

### Financial Management
- Complete treasury tracking for revenues and expenses.
- Recharts visualizations (Pie/Bar) isolated by education stage.

---

## 3. Tech Stack & Tooling

| Technology | Version | Architectural Purpose |
|---|---|---|
| **React** | `18.3.1` | Declarative UI and virtual DOM rendering. |
| **React Router v7** | `^7.18.3` | URL-based routing, route guards (`RoleGuard`), code-splitting. |
| **Zustand** | `^5.0.15` | Reactive global store (`useFestivalStore`) preventing re-render cascades. |
| **Vite** | `6.3.5` | Lightning-fast HMR and bundler. |
| **Tailwind CSS** | `4.1.12` | Modern CSS framework utilizing `@theme inline`. |
| **Supabase** | `^2.106.2` | PostgreSQL database, Auth, and Storage. |
| **html5-qrcode** | `^2.3.8` | Hardware video stream decoding. |
| **html2canvas / jsPDF** | `^1.4.1` | High-resolution rasterization and client-side document synthesis. |

---

## 4. User Roles & Workflows

### RBAC Matrix

| Capability | Student (`student`) | Normal Servant (`normal`) | Class Supervisor (`supervisor`) | Administrator (`admin`) | Developer (`developer`) |
|---|:---:|:---:|:---:|:---:|:---:|
| **Authentication** | Smart ID / QR | T-ID or Mobile | T-ID or Mobile | T-ID or Mobile | T-ID or Mobile |
| **QR Scanning** | No | Yes | Yes | Yes | Yes |
| **Manage Participants** | No | Read-Only | Yes (Stage Scoped) | Yes (All) | Yes (All) |
| **Servant Attendance** | No | No | Yes | Yes | Yes |
| **View Analytics** | No | No | Yes (Stage Scoped) | Yes (Global) | Yes (Global) |
| **Manage Finance** | No | No | No | Yes | Yes |
| **Stealth Mode** | No | No | No | No | **Yes (Hidden)** |
| **Universal Bypass** | No | No | No | No | **Yes** |

### Key Workflows

**Workflow A: Smart QR Routing (Student vs. Servant)**
1. Servant points scanner at a QR Code.
2. If `mode === 'attendance'`, the user selects meeting type: "Class" or "Service Meeting".
3. System decodes QR and searches local participant cache.
4. If found -> Registers Student Attendance, adds 10 points.
5. If not found -> Queries `servants` table in DB.
6. If Servant found -> Registers Servant Attendance in `servant_attendance_logs` under the selected meeting type (no points awarded).

**Workflow B: Manual Servant Attendance**
1. Admin navigates to `/teachers`.
2. Clicks the Calendar icon next to a Servant's name.
3. Selects the date and meeting type (Class / Service Meeting).
4. System checks for duplicates, then commits to `servant_attendance_logs`.

**Workflow C: Dual-Login Credential Resolution**
1. Servant enters identifier.
2. System detects if it's an 11-digit mobile number via Regex.
3. If Mobile -> Fetches `teacher_id` from DB.
4. Synthesizes email: `{teacher_id}@aribsalin.com` and logs into Supabase Auth.

---

## 5. Architecture & State Management

### Database Schema Specification (Supabase PostgreSQL)

```sql
-- 1. PARTICIPANTS TABLE
CREATE TABLE public.participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  participant_id text UNIQUE,
  full_name text NOT NULL,
  gender text CHECK (gender IN ('male', 'female')),
  educational_stage text NOT NULL,
  points_balance integer DEFAULT 0,
  -- ... other demographic fields
  CONSTRAINT participants_pkey PRIMARY KEY (id)
);

-- 2. SERVANTS TABLE
CREATE TABLE public.servants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text CHECK (role IN ('normal', 'supervisor', 'admin', 'developer')),
  mobile_personal text UNIQUE,
  status text DEFAULT 'approved' CHECK (status IN ('pending', 'approved')),
  -- ... other demographic fields
  CONSTRAINT servants_pkey PRIMARY KEY (id),
  CONSTRAINT servants_auth_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. STUDENT ATTENDANCE LOGS
CREATE TABLE public.attendance_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL,
  attendance_date date DEFAULT CURRENT_DATE,
  scanned_at timestamp with time zone DEFAULT now(),
  servant_id uuid,
  CONSTRAINT unique_daily_attendance UNIQUE (participant_id, attendance_date)
);

-- 4. SERVANT ATTENDANCE LOGS (New)
CREATE TABLE public.servant_attendance_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  servant_id uuid NOT NULL,
  scanned_by uuid,
  meeting_type text NOT NULL CHECK (meeting_type IN ('class', 'service_meeting')),
  attendance_date date DEFAULT CURRENT_DATE,
  scanned_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_servant_daily_attendance UNIQUE (servant_id, attendance_date, meeting_type)
);

-- 5. POINTS & FINANCIAL TRANSACTIONS
-- (Standard double-entry ledgers mapping to participants and finance tables)
6. Folder Structure & Deep Dive
Key Files
src/components/auth/RoleGuard.tsx: Implements RBAC. Contains the "God Mode" bypass condition if (userRole !== 'developer' && !allowedRoles.includes(userRole)).

src/pages/TeachersPage.tsx: Servant directory. Implements "Stealth Mode" by actively filtering out Developers (.neq('role', 'developer')). Houses the Manual Servant Attendance Modal.

src/components/shared/QRScanner.tsx: The Smart Router. Contains isolated #file-qr-reader canvas for image uploads, and logic to branch scans between Students and Servants.

src/components/shared/IDCard.tsx: Polymorphic digital badge rendering component supporting both Student and Servant properties.

7. ID Card Component Specifications
Dimensions: 350x550px (~2:3 ratio).

Backgrounds:

Male: Blue gradient (#3B82F6 → #2563EB)

Female: Pink gradient (#EC4899 → #DB2777)

Servant/Default: Purple gradient

Image Import Strategy (CRITICAL):
Always use static ES module imports. NEVER use dynamic new URL(...) for bundled assets.

TypeScript
import churchLogo from '../../assets/images/church logo.png';
<img src={churchLogo} alt="Church" />
Rendering Engine: Uses html2canvas at scale: 2 with useCORS: true for high-resolution PNG extraction.

8. Developer Guide & Architectural Invariants
Smart ID Gap-Filling Scheme:
IDs are generated by finding the first missing integer in a sequenced array (e.g., P301, P302, missing P303, P304 -> generates P303). Never use plain auto-increments.

Dual-Login Mobile Resolution:
Phone numbers are strictly 11-digits and validated as UNIQUE pre-flight in SignupPage.

Developer God-Mode Bypass:
The developer role must never be restricted from UI views in RoleGuard.tsx, nor should it appear in standard roster queries.

Actionable Contact Formatting:
Always render phone numbers with href="tel:${mobile}" and WhatsApp with href="https://wa.me/2${mobile}". Include the 2 country code prefix.

Smart QR Routing:
The QRScanner component must handle fallbacks. If an ID is not in the participants cache, it MUST query the servants table before rejecting the scan.

PostgREST Chunking:
Bulk deletions (like macro session wipes) must chunk ID arrays into batches of 200 to prevent HTTP 414 URI Too Long errors.

9. Troubleshooting Guide
Logos Not Displaying on ID Cards: You used new URL(). Change it to a static import.

ID Card Download Failing: Ensure the wrapper div has id="id-card" and useCORS: true is enabled in html2canvas.

Arabic Text Backwards: Ensure the container has dir="rtl".

iOS Safari Camera Freezing: Do not use navigator.vibrate(). It crashes the MediaStreamTrack on Apple devices.

Camera Permission Denied: Ensure the app is served over HTTPS or localhost. HTTP is blocked by browsers.

10. System Changelog
[2.3.0] - Current Version
Added: Servant Attendance Module (servant_attendance_logs table).

Added: Smart QR Router supporting both Student and Servant badge scanning.

Added: Manual Servant Attendance tracking via TeachersPage.

Added: Developer "God Mode" (Stealth Mode + Universal Bypass).

Added: Polymorphic IDCard component supporting Servants.

Added: Actionable contact links (tel: and WhatsApp) across all profiles.

[1.6.1] - 2026-06-17
Fixed: Signup Session Fix and Path Normalization.

Fixed: ID Card Download Stability across browsers.

[1.5.0] - 2026-06-05
Added: Isolated File Scanner for QR image uploads.

Fixed: iOS Safari Camera Freeze by removing vibration APIs.

Fixed: Blurry QR Edges via canvas normalization without smoothing.

[1.1.0] - 2026-05-24
Added: ID Card Component and high-resolution PNG generation.

Fixed: CRITICAL Logo Display Issue by enforcing static ES imports.

[1.0.0] - 2026-05-00
Initial Release. Core features, mock data, basic dashboard, and points economy.