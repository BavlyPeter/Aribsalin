# اريبصالين - Summer Festival Management System
## Complete Technical Documentation

**Current Version:** 1.6.0 (Registration Approval & Servant Profiles)  
**Last Updated:** June 12, 2026

---

## 📚 Documentation Index

This is the main technical documentation file. For specific topics, see:

| Document | Description |
|----------|-------------|
| **[DOCUMENTATION.md](DOCUMENTATION.md)** | 📖 This file - Complete system documentation |
| **[ID_CARD_DOCUMENTATION.md](ID_CARD_DOCUMENTATION.md)** | 🆔 ID card component guide (NEW in v1.1.0) |
| **[RECENT_UPDATES.md](RECENT_UPDATES.md)** | 🎉 Latest changes and new features |
| **[CHANGELOG.md](CHANGELOG.md)** | 📝 Version history and release notes |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | 🔧 Common issues and solutions |
| **[FEATURES.md](FEATURES.md)** | ✨ Feature descriptions |
| **[ATTRIBUTIONS.md](ATTRIBUTIONS.md)** | 📄 Third-party licenses and credits |

**Quick Links:**
- **New to the project?** Start with [RECENT_UPDATES.md](RECENT_UPDATES.md)
- **ID card issues?** Check [ID_CARD_DOCUMENTATION.md](ID_CARD_DOCUMENTATION.md)
- **Bugs or problems?** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Complete history?** Review [CHANGELOG.md](CHANGELOG.md)

---

## 🆕 What's New in v1.6.0 (June 12, 2026)

This release introduces the servant registration approval system, detailed servant profiles, and enhanced navigation gating.

- **Servant Registration Approval Flow:** Added `RegistrationRequestsPage` for admins to review, approve, or reject new servant signups. This ensures a managed onboarding process and data integrity.
- **Detailed Servant Profiles:** Introduced `ServantProfile` component to display comprehensive servant information, including personal, educational, and contact details, along with profile photo support.
- **Smart ID Enhancement:** Servant IDs are now displayed upon signup completion to facilitate immediate login.
- **Profile Photo Support:** Integrated `uploadHelper.ts` with Supabase Storage (`profiles` bucket) to allow servants to upload and display profile pictures.
- **Navigation & Gating:** Enhanced `AppMain.tsx` with robust routing and view gating, supporting distinct flows for Admins, Supervisors, and regular Servants.
- **Education Stage Normalization:** Added `stageHelpers.ts` to unify education stage labels and handle complex stage-year mapping (e.g., splitting Primary stage into 1-2, 3-4, 5-6).
- **Arabic Text Utilities:** Added `textUtils.ts` for consistent Arabic string normalization and formatting across the app.

---

## 🆕 What's New in v1.5.0 (June 5, 2026)

This release focuses on hardening the QR scanner for mobile devices, fixing iOS-specific camera freezes, and improving the reliability of QR code image uploads with lossless normalization.

- **iOS Safari Camera Freeze Fix:** Removed `navigator.vibrate` from the scan success flow. On iOS Safari, vibration triggers were suspending the video track, causing the camera feed to go black.
- **Isolated File Scanning:** Introduced a dedicated hidden div (`#file-qr-reader`) and an independent `Html5Qrcode` instance for file uploads. This prevents concurrency crashes that occurred when attempting to scan a file while the live camera was active.
- **Lossless PNG Normalization:** The file upload flow now uses a two-step process: it first attempts a direct scan of the original file, then falls back to a custom canvas normalizer that saves strictly as **PNG**. This avoids JPEG compression artifacts that previously blurred sharp QR edges.
- **Sharp Edge Preservation:** Disabled `imageSmoothingEnabled` in the canvas context during normalization to ensure QR code modules remain crisp and readable by the decoder.
- **Improved UI Responsiveness:** Added logic to clear the "last scanned code" memory on invalid scans. This prevents the scanner from appearing "frozen" when a user tries to scan the same invalid code multiple times without moving the camera.
- **Small Image Scaling:** Added logic to automatically scale up small uploaded images (under 300px) to at least 400px, significantly improving recognition rates for low-res screenshots.

---

## 🆕 What's New in v1.4.0 (May 31, 2026)

This release focuses on removing the remaining React white-screen crashes in the analytics view, hardening the attendance timeline chart, and making attendance data loading resilient when Supabase joins fail.

- **Statistics page crash-proofing:** `StatisticsPage` now builds all summary and leaderboard data inside a safe `useMemo` result object so the page never returns `null` and no chart or list depends on an unguarded array.
- **Safe leaderboard rendering:** Top participants and top attendance lists now render from precomputed arrays with fallback values, avoiding direct `.map()` access on potentially missing data.
- **Attendance rate fixes:** The attendance statistics block now reads from memoized stats fields only, removing reference errors that were crashing the page during render.
- **Stage-specific attendance rankings:** The bottom leaderboard now computes the “Top 10 by Attendance” per education stage instead of reusing the global attendance ranking.
- **Attendance timeline zero-line fallback:** When no attendance records exist yet, the line chart now renders a zero-value point for today so the Recharts chart still displays a baseline instead of disappearing.
- **Chart binding hardening:** The attendance line chart now uses safe `name/value` data keys and a zero-based Y axis domain so it remains visible and consistent even with empty data.
- **Supabase attendance fetch resilience:** `AppMain` no longer relies on the broken `attendance_logs` join; participants and attendance logs are fetched separately and merged in memory to avoid schema-cache / PostgREST join failures.
- **Teachers route prop fix:** The teachers page wiring was aligned with the real `TeachersPageProps` interface so the app shell no longer throws on that route.

Files touched in this release (not exhaustive):
- `src/pages/StatisticsPage.tsx` — crash-proof stats object, safe leaderboards, attendance timeline fallback, safe chart bindings
- `src/components/layout/AppMain.tsx` — separate participants/logs fetch and in-memory attendance merge
- `src/pages/TeachersPage.tsx` / route wiring — prop alignment for the teachers page

---

Files touched in this release (not exhaustive):
- `src/pages/Dashboard.tsx` — compact servant info card and logout confirmation
- `src/components/shared/ParticipantsList.tsx` — tolerant search + unified filters
- `src/components/modals/ManualPointsModal.tsx` — tolerant search parity
- `src/pages/StudentProfile.tsx` — participant ID display uses `participant_id`
- `src/components/shared/IDCard.tsx` — participant ID badge uses `participant_id`
- `src/types/index.ts` — participant type updated to include `participant_id`
- `src/utils/textUtils.ts` — Arabic normalization helper

Files touched in this release (not exhaustive):
- `src/types/index.ts` — centralized types and `area` addition
- `src/app/components/layout/AppMain.tsx` — view gating, `viewerRole`, `currentServant`, login/signup wiring
- `src/pages/SignupPage.tsx` — Smart ID generation, Supabase signup and DB insert
- `src/lib/supabase.ts` — Supabase client creation
- `src/vite-env.d.ts` — Vite env typings for Supabase keys
- `src/pages/LoginPage.tsx` — switched to `teacherId` login flow
- `src/pages/StudentPortalLogin.tsx` — student portal entry page
- `src/pages/StudentProfile.tsx` — area + address display and Participant typing
- `src/pages/Dashboard.tsx` — welcome banner and `currentServant` prop
- `MD/ARIBSALIN-DOCUMENTATION.md` — this file updated with release notes

---

## 🔧 Detailed Change Log (Full list of code updates applied in this cycle)

This section enumerates concrete code changes, file-by-file, made during the recent development session so the repo history is easy to review.

### v1.6.0 (June 12, 2026)
- `src/pages/RegistrationRequestsPage.tsx`: Implemented admin-only view for reviewing and approving servant signup requests. Includes logic for toggling roles (admin/servant) and managing servant status in Supabase.
- `src/pages/ServantProfile.tsx`: Created a detailed profile view for servants, displaying full personal and educational data, contact info, and profile pictures.
- `src/lib/uploadHelper.ts`: Added utility for uploading profile images to Supabase Storage (`profiles` bucket) with automatic filename generation and public URL retrieval.
- `src/app/utils/stageHelpers.ts`: Centralized education stage logic, providing Arabic labels and normalizing complex stage/year combinations for consistent UI display.
- `src/utils/textUtils.ts`: Added helpers for Arabic text normalization, specifically handling different forms of Alif and Teh Marbuta to improve search and display consistency.
- `src/components/shared/ImageWithFallback.tsx`: Created a robust image component that handles loading errors by displaying a themed placeholder or initials.
- `src/app/components/layout/AppMain.tsx`: Enhanced routing logic to support the new servant profile and registration request views, along with improved auth session handling.
- `src/pages/SignupPage.tsx`: Updated to display the generated Smart ID upon successful signup, enabling immediate user feedback.

- `src/types/index.ts`: Extracted and unified shared interfaces (`StudentData`, `TeacherData`, `Participant`), added `area: string` for split address fields and added `teacherId` to teacher shape.
- `src/lib/supabase.ts`: Added and exported a Supabase client initialized from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- `src/app/components/layout/AppMain.tsx`: Centralized router/auth hub changes:
  - Implemented session persistence using `supabase.auth.getSession()` on mount and `supabase.auth.onAuthStateChange` subscription.
  - Added `handleLogout` calling `supabase.auth.signOut()` and clearing local auth state.
  - Rewrote QR attendance handler (`handleScanSuccess`) to be DB-backed: verify participant by `participant_id`, insert into `attendance_logs`, update `participants.points_balance`, insert `points_transactions`, and update local participants state.
  - Wired DB-backed implementations for market and add-points flows (deduct/add points and record transactions).

- `src/pages/SignupPage.tsx`:
  - Implemented Smart ID generation logic including admin prefixes (A01/A02 pattern) and existing-role logic.
  - Uses `supabase.auth.signUp` for servant signup and inserts servant record into `servants` with `class_stage` set to `null` for admin roles.
  - Added password visibility toggle and real-time phone input sanitization (`onChange` strips non-digits) with `maxLength={11}`.
  - Hid class-stage selector when `role === 'admin'` and ensured initial `formData` includes `teacherId` to satisfy types.

- `src/pages/LoginPage.tsx`: Updated login to use `teacherId` as credential (email synthesized as `teacherId@aribsalin.com`), signs in via `supabase.auth.signInWithPassword`, then fetches servant profile and calls `onLogin`.

- `src/pages/Dashboard.tsx`: Replaced metrics with a personalized welcome banner; safe role/stage rendering using `roleLabels` and `stageLabels`; logout button wired to `onLogout`.

- `src/components/forms/RegistrationForm.tsx`:
  - Implemented `generateParticipantSmartId` and used it on registration.
  - Sanitized phone inputs on typing (`replace(/\D/g, '')`) and set `maxLength={11}`.
  - Made parents' mobile fields optional and removed required asterisks, made address details optional where requested.
  - `handleSubmit` validates 11-digit phone numbers, formats `class_or_job` from `universityName`/`collegeName` when needed, and inserts participant record into `participants` table.

- `src/app/components/QRScanner.tsx`: Multi-mode scanner supports `attendance`, `market`, `addPoints`, `viewDetails` flows; camera permission fallback UI preserved.

- `src/app/components/EnhancedDashboard.tsx` and `src/app/components/EnhancedRegistrationForm.tsx`: UI wiring to open scanner modes and registration flow; adjusted to new types and to call DB-backed handlers in `AppMain`.

- `src/app/components/MarketModal.tsx`, `AddPointsModal.tsx`, `ManualPointsModal.tsx`:
  - Inputs validate positive integers only (block `-`, `.`, `e`, `E` keys), preview remaining balance, and call DB-backed handlers that update `participants.points_balance` and add `points_transactions` rows.

- `src/pages/StudentPortalLogin.tsx`: Normalizes entered IDs (`trim().toUpperCase()`) and routes to `StudentProfile` on success.

- `src/pages/StudentProfile.tsx`: Shows `area` + `address` fields, QR download helper, and attendance/points stats.

- `src/app/components/QRScanner.tsx`:
  - **Mobile Stability Fix:** Removed `navigator.vibrate` to prevent camera feed suspension on iOS Safari.
  - **Isolated Scanning:** Added a dedicated hidden div (`#file-qr-reader`) and independent `Html5Qrcode` instance for file uploads to prevent concurrency crashes with the live camera.
  - **Sharp PNG Normalization:** Implemented a two-step upload flow (direct scan → lossless PNG fallback) with `imageSmoothingEnabled: false` for maximum QR readability.
  - **Responsiveness:** Added `lastScannedCodeRef` clearing on invalid scans to prevent the "frozen" camera illusion.
  - **Scaling:** Added automatic upscaling for small uploaded images.

- `src/pages/StatisticsPage.tsx`:
  - Replaced fragile render-time calculations with a safe memoized stats object that always returns arrays for charts and leaderboards.
  - Added `topAttendance` and used safe fallbacks for `topParticipants`, `genderData`, `stageData`, and all attendance metrics.
  - Moved attendance timeline grouping into `useMemo`, added a zero-line fallback point for days with no attendance, and bound the line chart to `name/value` data.
  - Hardened per-stage “Top 10 by Attendance” and attendance-rate statistics to prevent React render crashes.

- `src/components/layout/AppMain.tsx`:
  - Replaced the broken joined attendance query with separate participant and attendance-log fetches.
  - Merged logs into participant state in memory so the dashboard continues to work even if the Supabase schema cache or join metadata is stale.
  - Fixed the teachers route prop wiring to match `TeachersPageProps`.

- `MD/ARIBSALIN-DOCUMENTATION.md`: This file updated (you are reading it) — added this detailed change log and release notes.

Additional notes about behavior and verification:
- Real-time phone UX: all mobile inputs now strip non-numeric characters while typing and limit entry to 11 digits (`maxLength={11}`), plus `handleSubmit` still enforces 11-digit validation.
- Parents' mobile fields in the participant form were made optional per the latest UX request.
- All DB writes that affect points create a `points_transactions` record and update `participants.points_balance`.
- Build & checks: modified files were validated with TypeScript checks during the session; `StatisticsPage.tsx` and `AppMain.tsx` were rechecked after each crash fix.

Latest stability notes:
- The attendance timeline now always has at least one point to render, so the chart remains visible even before the first check-in.
- The app shell no longer depends on the Supabase join path that was crashing the UI.
- The statistics page now guards all `.map()` calls and attendance count references that were causing React render failures.

If you want, I can also:
- Produce a compact `CHANGELOG.md` with the same entries formatted as release notes.
- Create Git-friendly commit messages for each logical change to help review.


Notes & next steps:
- To test the Smart ID signup flow end-to-end, supply the Supabase environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and validate the `servants` table schema includes `teacher_id`.
- Consider adding server-side RLS/RBAC rules for the `servants` table before production use.


## 📋 Project Overview

**Project Name:** اريبصالين (Arribsalin)  
**Type:** Summer Festival Management System for Coptic Orthodox Church  
**Church:** Church of the Great Martyr St. Mina the Wonderworker and Pope Kyrillos VI - Aswan  
**Technologies:** React 18.3.1 + TypeScript + Tailwind CSS v4  
**Language:** Arabic (RTL)  
**Platform:** Mobile-First Web Application  
**Current Version:** 1.2.0 (Architecture & Portal Update - May 28, 2026)

---

## 🛠️ Tools & Workflow

### Development Tools
- **Vite:** Next-generation frontend tooling for fast development and optimized builds.
- **TypeScript:** Ensuring type safety and code quality across the entire codebase.
- **Tailwind CSS v4:** Utility-first styling with modern CSS variables and high performance.
- **Lucide React:** Consistent and beautiful icon system.
- **Supabase:** Backend-as-a-Service for Authentication, Database (PostgreSQL), and File Storage.
- **Sonner:** High-quality toast notifications for user feedback.

### Project Workflow
1. **Feature Implementation:** Components are designed with a mobile-first approach using Tailwind CSS.
2. **Type Safety:** All data models and component props are defined in `src/types/index.ts`.
3. **Database Integration:** Direct Supabase client interaction for real-time data persistence.
4. **Auth & Gating:** View-based routing in `AppMain.tsx` handles role-based access (Admin, Servant, Student).
5. **RTL Support:** Global RTL direction for Arabic language support, integrated into layout components.
6. **Deployment:** Optimized for Vercel or similar static hosting platforms, with Supabase handling the backend.

---

## 🎨 Color System & Design

### Primary Colors (Coptic Orthodox Color Scheme)

The application uses a traditional Coptic Orthodox color palette with burgundy and gold as the primary colors.

```css
--primary: #8B1538        /* Burgundy - Main primary color */
--primary-foreground: #ffffff

--secondary: #C9A961      /* Gold - Secondary accent color */
--secondary-foreground: #3D2817

--background: #FAF7F2     /* Off-white beige - Page backgrounds */
--foreground: #3D2817     /* Dark brown - Main text color */

--card: #ffffff           /* White - Card backgrounds */
--card-foreground: #3D2817

--border: rgba(139, 21, 56, 0.15)  /* Semi-transparent borders */
--muted: #E8DCC8          /* Muted beige */
--muted-foreground: #6B5744

--destructive: #d4183d    /* Red for destructive actions */
--ring: #C9A961           /* Focus ring color (gold) */
```

### Additional Colors Used

- **Green:** `#10B981` - Used for adding points (إضافة نقاط)
- **Blue:** `#3B82F6` - Used for viewing details (عرض التفاصيل)
- **Red:** `#EF4444` - Used for expenses and deletions
- **Pink:** `#EC4899` - Used for female gender in charts

---

## 🏗️ Project Structure

Complete file tree with detailed component descriptions:

```
src/
├── app/
│   ├── App.tsx                   # Main App entry (renders AppMain)
│   └── utils/
│       └── stageHelpers.ts       # Education stage normalization and labeling
├── assets/
│   └── images/                   # Branded logos and fallback images
├── components/
│   ├── forms/
│   │   └── RegistrationForm.tsx  # Participant registration form
│   ├── layout/
│   │   └── AppMain.tsx           # Router, Auth gate, and global state management
│   ├── modals/
│   │   ├── AddPointsModal.tsx    # Modal for adding bonus points
│   │   ├── ManualPointsModal.tsx # Manual points assignment (search-based)
│   │   └── MarketModal.tsx       # Point deduction for market purchases
│   ├── shared/
│   │   ├── IDCard.tsx            # Branded participant ID card component
│   │   ├── ImageWithFallback.tsx # Image component with error handling
│   │   ├── ParticipantsList.tsx  # Searchable participant list
│   │   ├── QRScanner.tsx         # Multi-mode QR scanner (camera + file)
│   │   ├── TestQRCode.tsx        # Dev-only QR code display for testing
│   │   └── WelcomeScreen.tsx     # Animated welcome screen
│   └── ui/                       # shadcn UI primitives (radix-based)
├── lib/
│   ├── supabase.ts              # Supabase client and auth initialization
│   └── uploadHelper.ts          # Utility for profile image uploads to storage
├── pages/
│   ├── Dashboard.tsx            # Main management hub for servants
│   ├── FinancePage.tsx          # Revenue/Expense tracking and analytics
│   ├── LoginPage.tsx            # Servant login entry
│   ├── RegistrationRequestsPage.tsx # Admin view for approving new servants
│   ├── RoleSelectionPage.tsx     # Initial landing (Servant vs Student)
│   ├── ServantProfile.tsx       # Detailed profile view for servants
│   ├── SignupPage.tsx            # Servant registration with Smart ID
│   ├── StatisticsPage.tsx       # Comprehensive festival analytics
│   ├── StudentPortalLogin.tsx    # Student entry (ID entry or QR scan)
│   ├── StudentProfile.tsx        # Student/Participant detailed profile
│   └── TeachersPage.tsx          # Servant organization by stage
├── styles/
│   ├── theme.css                # Primary burgundy/gold color system
│   ├── fonts.css                # Arabic typography (Tajawal, Cairo)
│   ├── tailwind.css             # Tailwind v4 main entry
│   └── globals.css              # Global styles and resets
├── types/
│   └── index.ts                 # Centralized TypeScript interfaces
└── utils/
    └── textUtils.ts             # Arabic normalization and string helpers
```

---

## 🔤 Typography & Fonts

### Arabic Font System

```css
/* Primary Arabic Fonts */
font-family: 'Tajawal', 'Cairo', sans-serif;
```

**Font Stack:**
- **Tajawal:** Primary font (weights: 400, 500, 700) - Clean and modern Arabic typeface
- **Cairo:** Fallback font (weights: 400, 600, 700) - Geometric Arabic font

**Font Weights:**
```css
--font-weight-normal: 400  /* Regular text */
--font-weight-medium: 500  /* Medium emphasis */
--font-weight-bold: 700    /* Strong emphasis */
```

**Font Import Location:** All font imports are added to `/src/styles/fonts.css` file only. Never add font imports to other CSS files.

---

## 📱 Pages & Components Documentation

### 1. LoginPage Component

**File Path:** `src/app/components/LoginPage.tsx`

**Purpose:** Teacher authentication page for accessing the festival management system.

**UI Components:**
- **Simple Header with Logos:**
  - Church logo (positioned right) - `new-church-logo.png`
  - Festival logo (positioned center) - `Arebsalin-1.png`
  - Spacer div for perfect centering
- **Login Form Card:**
  - Email input field (البريد الإلكتروني)
  - Password input field (كلمة المرور)
  - Submit button (تسجيل الدخول)
- **Signup Link:** Link to teacher registration page (سجل كخادم جديد)

**Styling Classes:**
```css
Header: bg-card, border-b-2 border-primary/20, py-4, px-4
Form Card: bg-card, rounded-2xl, shadow-lg, p-6
Submit Button: bg-primary, text-primary-foreground, rounded-xl, py-3, active:scale-[0.98]
```

**State Management:** None (mock login - always successful)

**Navigation:** Redirects to dashboard after login

---

### 2. SignupPage Component

**File Path:** `src/app/components/SignupPage.tsx`

**Purpose:** Teacher registration form with comprehensive data collection. This form is specifically for teachers (خدام) - differs from student registration.

**Form Sections:**

#### Basic Information (البيانات الأساسية)
- **Full Name** (الإسم رباعي) * - Text input, required
- **Gender** (النوع) * - Toggle buttons (ذكر/أنثى), required
- **Date of Birth** (تاريخ الميلاد) * - Date picker, required
- **Confession Father** (أب الإعتراف) * - Text input, required

#### Educational Information (البيانات التعليمية)
- **Education Stage** (المرحلة الدراسية) * - Dropdown, required
  - Options: Secondary (ثانوي), University (جامعي), Graduate (خريجين) only
- **Education Year** (السنة الدراسية) * - Dynamic dropdown based on stage, required
- **Stage-Specific Fields:**
  - **For Secondary:** School name (المدرسة) * - Text input, required
  - **For University:** 
    - University name (اسم الجامعة) * - Text input, required
    - College name (الكلية) * - Text input, required
  - **For Graduate:**
    - Job title (المسمى الوظيفي) - Text input, optional
    - Workplace (مكان العمل) - Text input, optional

#### Contact Numbers (أرقام التواصل)
- **Mobile Number** (رقم الموبايل) * - Tel input, required (single number only)

#### Address (العنوان)
- **Area (الحي / المنطقة)** - Dropdown select (قائمة مناطق أسوان، مثل: خور-النيل، المنشية، كرنك...) - required
- **Detailed Address (العنوان بالتفصيل)** * - Textarea (3 rows), required

**Education Stages for Teachers:**
```typescript
const educationStages = {
  'secondary': 'ثانوي',    // Secondary school
  'university': 'جامعي',   // University
  'graduate': 'خريجين'     // Graduates
};

const educationYears = {
  'secondary': [
    'الصف الأول الثانوي',   // 1st year secondary
    'الصف الثاني الثانوي',  // 2nd year secondary
    'الصف الثالث الثانوي'   // 3rd year secondary
  ],
  'university': [
    'الفرقة الأولى' through 'الفرقة السابعة'  // Year 1-7
  ]
};
```

**Data Interface:**
```typescript
export interface TeacherData {
  fullName: string;
  gender: 'male' | 'female' | '';
  educationStage: string;
  educationYear: string;
  studyOrWorkPlace: string;
  universityName?: string;
  collegeName?: string;
  jobTitle?: string;
  confessionFather: string;
  mobile: string;              // Single mobile number
  address: string;             // Single address field
  dateOfBirth: string;
}
```

**Form Behavior:**
- Dynamic fields that change based on education stage selection
- Resets dependent fields when stage changes
- Fixed submit button at bottom
- Sticky header with back button

---

### RoleSelectionPage

**File Path:** `src/pages/RoleSelectionPage.tsx`

**Purpose:** Initial landing page that asks the user to choose their role: `Servant` (خادم) or `Student` (طالب). This determines the next step in the flow (teacher login/signup vs student portal).

**Behavior:**
- Two large buttons: `خادم` and `طالب`.
- Choosing `خادم` navigates to the existing `LoginPage` (teacher login).
- Choosing `طالب` navigates to `StudentPortalLogin` (student ID entry / scanner).

---

### StudentPortalLogin

**File Path:** `src/pages/StudentPortalLogin.tsx`

**Purpose:** Lightweight student entry point that allows students to access their profile using a numeric/printed ID or by scanning a QR code.

**UI Components:**
- Text input for Student ID (supports loose formatting; IDs are normalized on lookup)
- Button to submit ID and view profile
- Optional QR scanner button that opens `QRScanner` in quick-scan mode

**Behavior:**
- Normalizes the entered ID (trim + toUpperCase) before searching participants.
- If a matching participant is found, navigates to the `StudentProfile` view.
- If no match, shows a friendly Arabic fallback message and a back button.

---


### RegistrationRequestsPage

**File Path:** `src/pages/RegistrationRequestsPage.tsx`

**Purpose:** Admin dashboard for managing new servant signup requests. This view allows administrators to vet new accounts before they gain access to the system.

**UI Components:**
- **Requests List:** Displays pending servant registrations with:
  - Name and generated Teacher ID
  - Education stage and year
  - Role toggle (Servant/Admin)
  - Approval/Rejection buttons
- **Empty State:** Friendly message when no pending requests exist.

**Behavior:**
- **Approve:** Updates servant status to `approved` in Supabase, granting them access to the dashboard.
- **Reject:** Removes the pending request from the database.
- **Role Toggle:** Allows admins to promote a new signup to `admin` role during the approval process.

---

### ServantProfile

**File Path:** `src/pages/ServantProfile.tsx`

**Purpose:** Detailed personal profile page for servants (خدام), accessible to the servant themselves and to administrators.

**UI Components:**
- **Profile Header:** Sticky header with back button and servant name.
- **Profile Image Section:**
  - Displays uploaded profile photo from Supabase Storage.
  - Fallback to initials if no photo is available.
  - "Update Photo" button (integrated with `uploadHelper`).
- **Statistics Grid:**
  - Role badge (Admin/Servant)
  - Class stage identifier
  - Contact shortcut (direct mobile link)
- **Detailed Info Sections:**
  - **Basic Info:** Name, Age, Gender, Confession Father.
  - **Educational Info:** Stage, Year, School/University/Work.
  - **Contact Info:** Mobile number.
  - **Location Info:** Area and detailed address.

**Behavior:**
- Fetches real-time profile data from Supabase.
- Allows photo uploads via the browser file picker, updating the `photo_url` in the database.

---

### 3. EnhancedDashboard Component

**File Path:** `src/app/components/EnhancedDashboard.tsx`

**Purpose:** Main dashboard and navigation hub for all festival management features.

**Header:**
- Sticky header with shadow (stays visible on scroll)
- Church logo (positioned right)
- Festival logo (positioned center)
- Spacer for perfect centering

**Statistics Cards:**
- **Total Participants** (إجمالي المشاركين) - Shows total count with Users icon
- **Today's Attendance** (الحضور اليوم) - Shows attendance count with CheckSquare icon

**Primary Action Buttons:**

1. **Attendance Registration** (تسجيل الحضور) - Full width, burgundy background
   - Opens QR scanner in 'attendance' mode
   - Awards +10 points automatically

2. **Three-Column Grid:**
   - **Market Scan** (مسح السوق) - Gold color, opens scanner in 'market' mode
   - **Add Points** (إضافة نقاط) - Green color, opens scanner in 'addPoints' mode
   - **View Details** (عرض التفاصيل) - Blue color, opens scanner in 'viewDetails' mode

**Secondary Action Buttons:**
- **Register New Participant** (تسجيل مشارك جديد) - Opens student registration form
- **Manual Points Management** (إدارة النقاط يدوياً) - Manage points without QR scanning
- **Financial Management** (الإدارة المالية) - Opens finance page
- **Festival Statistics** (إحصائيات المهرجان) - Opens statistics page
- **Teachers Management** (إدارة الخدام) - Opens teachers page

**Participants List:**
- Searchable list of all participants
- Shows name and points for each participant
- Click on participant to open their profile
- ParticipantsList component integrated

**Test QR Codes Section:**
- Displays first 3 participants for testing
- Button for each participant to show their QR code
- Useful for development and testing scanner functionality

**Props Interface:**
```typescript
interface EnhancedDashboardProps {
  onNavigate: (view: 'scanner' | 'registration' | 'market' | 'addPoints' | 
                     'manualPoints' | 'profile' | 'viewDetails' | 
                     'finance' | 'statistics' | 'teachers') => void;
  onViewProfile: (participantId: string) => void;
  totalParticipants: number;
  todayAttendance: number;
  participants?: Array<{ id: string; name: string; points: number; attended: boolean }>;
}
```

---

### 4. EnhancedRegistrationForm Component

**File Path:** `src/app/components/EnhancedRegistrationForm.tsx`

**Purpose:** Comprehensive student/participant registration form. This differs from SignupPage (which is for teachers) by including ALL education stages and multiple contact numbers.

**Form Sections:**

#### Basic Information (البيانات الأساسية)
- **Full Name** (الإسم رباعي) * - Text input, required
- **Gender** (النوع) * - Toggle buttons (ذكر/أنثى), required
- **Date of Birth** (تاريخ الميلاد) * - Date picker, required
- **Confession Father** (أب الإعتراف) * - Text input, required

#### Educational Information (البيانات التعليمية)
- **Education Stage** (المرحلة الدراسية) * - Dropdown, required
  - All 6 stages available: KG (حضانة), Primary (ابتدائي), Preparatory (إعدادي), Secondary (ثانوي), University (جامعي), Graduate (خريجين)
- **Education Year** (السنة الدراسية) * - Dynamic dropdown, required (except for graduates)
- **Stage-Specific Fields:**
  - **For KG/Primary/Prep/Secondary:** School name (المدرسة) * - Required
  - **For University:** 
    - University name (اسم الجامعة) * - Required
    - College name (الكلية) * - Required
  - **For Graduate:**
    - Job title (المسمى الوظيفي) - Optional
    - Workplace (مكان العمل) - Optional

#### Contact Numbers (أرقام التواصل)
- **Personal Mobile** (رقم الموبايل الشخصي) - Tel input
- **Father's Mobile** (رقم موبايل الأب) * - Tel input, required
- **Mother's Mobile** (رقم موبايل الأم) * - Tel input, required

#### Address (العنوان)
- **Area (الحي / المنطقة)** - Dropdown select (قائمة مناطق أسوان) - required
- **Detailed Address (العنوان بالتفصيل)** * - Textarea (3 rows), required

**Education Stages for Students:**
```typescript
const educationStages = {
  'kg': 'حضانة',           // Kindergarten
  'primary': 'ابتدائي',    // Primary school
  'preparatory': 'إعدادي', // Preparatory school
  'secondary': 'ثانوي',    // Secondary school
  'university': 'جامعي',   // University
  'graduate': 'خريجين'     // Graduates
};

const educationYears = {
  'kg': ['Baby Class', 'KG1', 'KG2'],
  'primary': [
    'الصف الأول الابتدائي' through 'الصف السادس الابتدائي'  // Grades 1-6
  ],
  'preparatory': [
    'الصف الأول الإعدادي' through 'الصف الثالث الإعدادي'  // Grades 1-3
  ],
  'secondary': [
    'الصف الأول الثانوي' through 'الصف الثالث الثانوي'  // Grades 1-3
  ],
  'university': [
    'الفرقة الأولى' through 'الفرقة السابعة'  // Years 1-7
  ]
};
```

**Data Interface:**
```typescript
export interface StudentData {
  fullName: string;
  gender: 'male' | 'female' | '';
  educationStage: string;
  educationYear: string;
  studyOrWorkPlace: string;
  universityName?: string;
  collegeName?: string;
  jobTitle?: string;
  confessionFather: string;
  personalMobile: string;    // Student's own number
  fatherMobile: string;      // Required
  motherMobile: string;      // Required
  address: string;
  dateOfBirth: string;
}
```

**Key Differences from SignupPage:**
- Includes all 6 education stages (vs 3 for teachers)
- Has 3 mobile number fields (vs 1 for teachers)
- Used for festival participants/students (vs teachers/servants)

---

### 5. StudentProfile Component

**File Path:** `src/app/components/StudentProfile.tsx`

**Purpose:** Detailed participant profile page with QR code, attendance records, and complete personal information.

**UI Components:**

1. **Header:** Sticky header with back button and participant name
2. **Large QR Code:** Downloadable QR code (600x600 PNG)
   - QRCode component from 'qrcode.react'
   - Download button with Download icon
3. **Statistics Cards Grid (3 columns):**
   - **Attendance Percentage** - Circular progress indicator
   - **Days Attended** (أيام الحضور) - Count of attendance days
   - **Available Points** (النقاط المتاحة) - Current points balance
4. **Attendance Details:**
   - Section title: تفاصيل الحضور
   - List of all attendance dates formatted as `YYYY-MM-DD`
   - Displays "لا يوجد حضور بعد" if no attendance
5. **Complete Personal Information:**
   - Name (الإسم), Age (العمر), Gender (النوع)
   - Education stage and year (المرحلة الدراسية)
   - School/University/Work (حسب المرحلة)
   - Confession Father (أب الإعتراف)
   - All contact numbers (personal, father, mother)
   - Complete address (العنوان)

**QR Code Download Function:**
```typescript
const downloadQRCode = () => {
  const svg = qrRef.current?.querySelector('svg');
  if (!svg) return;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 600;  // High resolution
  const ctx = canvas.getContext('2d');
  
  // Convert SVG to image
  const svgData = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  
  img.onload = () => {
    ctx?.drawImage(img, 0, 0, 600, 600);
    canvas.toBlob((blob) => {
      if (blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `QR_${student.name}_${student.id}.png`;
        link.click();
      }
    });
    URL.revokeObjectURL(url);
  };
  
  img.src = url;
};
```

**Calculations:**
- Age: Calculated from `dateOfBirth`
- Attendance Percentage: `(attendanceDays.length / totalDays) * 100`
- Assuming 15 total festival days for percentage calculation

---

### 6. QRScanner Component

**File Path:** `src/app/components/QRScanner.tsx`

**Purpose:** Multi-mode QR code scanner using device camera or image upload.

**Scanner Modes:**
```typescript
type ScanMode = 'attendance' | 'market' | 'addPoints' | 'viewDetails';
```

**Mode-Specific Colors:**
- `attendance` → Burgundy `var(--primary)` - For checking in participants
- `market` → Gold `var(--secondary)` - For deducting points at market
- `addPoints` → Green `#10B981` - For adding bonus points
- `viewDetails` → Blue `#3B82F6` - For viewing participant profile

**Features:**

1. **Camera Controls:**
   - Toggle flashlight/torch (if supported)
   - Stop/start scanning
   - Request camera permission

2. **Error Handling:**
   - Catches `NotAllowedError` for permission denied
   - Displays fallback UI when camera access is denied

3. **Fallback UI (when camera permission denied):**
   - "Request Permission Again" button (طلب الإذن مرة أخرى)
   - "Upload QR Image" button (رفع صورة QR) - File input
   - Instructions for enabling camera in browser settings

4. **Scan Frame:**
   - Four colored corners (color changes based on mode)
   - Centered instruction text
   - Border color matches mode

**Library Used:** `html5-qrcode` for scanning functionality

**Props Interface:**
```typescript
interface QRScannerProps {
  onBack: () => void;
  onScanSuccess: (decodedText: string) => void;
  mode: 'attendance' | 'market' | 'viewDetails' | 'addPoints';
}
```

---

### 7. Points Management Modals

#### MarketModal - Point Deduction

**File Path:** `src/app/components/MarketModal.tsx`

**Purpose:** Deduct points when participants make purchases at the market.

**UI Elements:**
- Display current points balance (الرصيد الحالي)
- Input field for points to deduct (النقاط المراد خصمها)
- Display remaining balance after deduction (الرصيد المتبقي)
- Gold-colored submit button
- Validation: Cannot deduct more than available points

**Props:**
```typescript
interface MarketModalProps {
  participant: { id: string; name: string; points: number } | null;
  onClose: () => void;
  onConfirm: (participantId: string, points: number) => void;
}
```

---

#### AddPointsModal - Point Addition

**File Path:** `src/app/components/AddPointsModal.tsx`

**Purpose:** Add bonus points to participants (triggered by QR scan).

**UI Elements:**
- Display current points balance (الرصيد الحالي)
- Input field for points to add (النقاط المراد إضافتها)
- Display new balance after addition (الرصيد الجديد)
- Green-colored submit button
- No upper limit validation

---

#### ManualPointsModal - Manual Points Management

**File Path:** `src/app/components/ManualPointsModal.tsx`

**Purpose:** Manage participant points without QR scanning - search by name and add/deduct points.

**UI Elements:**
- Search input to find participants (البحث عن مشارك)
- List of matching participants
- Operation type toggle: Add (إضافة) or Deduct (خصم)
- Points input field
- Preview of result before confirmation
- Color-coded buttons based on operation type

**Workflow:**
1. Search for participant by name
2. Select participant from results
3. Choose operation (add or deduct)
4. Enter points amount
5. Preview shows current → new balance
6. Confirm to apply

---

### Input Validation for All Points Modals

**Positive Integers Only:** All point input fields enforce the following validation:

```typescript
// Only accept positive integers (no negatives, decimals, or scientific notation)
onChange={(e) => {
  const value = e.target.value;
  // Allow empty string or positive integers only
  if (value === '' || (parseInt(value) > 0 && !value.includes('-') && !value.includes('.'))) {
    setPoints(value);
  }
}}

// Prevent typing invalid characters
onKeyDown={(e) => {
  // Block -, +, ., e, E keys
  if (e.key === '-' || e.key === '+' || e.key === '.' || e.key === 'e' || e.key === 'E') {
    e.preventDefault();
  }
}}

// Ensure number input type
type="number"
min="1"
step="1"
```

**This validation is applied to:**
- MarketModal (deduction input)
- AddPointsModal (addition input)
- ManualPointsModal (points input)

---

### 8. FinancePage Component

**File Path:** `src/app/components/FinancePage.tsx`

**Purpose:** Comprehensive financial management system to track all festival expenses and revenues.

**Transaction Data Model:**
```typescript
interface Transaction {
  id: string;                  // Unique transaction ID (e.g., 'T001')
  type: 'expense' | 'revenue'; // Transaction type
  title: string;               // Transaction title/description
  amount: number;              // Amount in currency
  date: string;                // Date in YYYY-MM-DD format
  educationStage: string;      // 'all' or specific stage (kg, primary, etc.)
  personName: string;          // Name of person involved
  description?: string;        // Optional additional notes
}
```

**Page Components:**

#### 1. Financial Summary Cards (3-column grid)
- **Total Revenue** (إجمالي الإيرادات)
  - Green background (#10B981)
  - TrendingUp icon
  - Sum of all revenue transactions
  
- **Total Expenses** (إجمالي المصروفات)
  - Red background (#EF4444)
  - TrendingDown icon
  - Sum of all expense transactions
  
- **Current Balance** (الرصيد الحالي)
  - Green if positive, red if negative
  - DollarSign icon
  - Calculation: `totalRevenue - totalExpense`

#### 2. Charts Section

**Pie Chart - Revenue vs Expense Ratio:**
```typescript
const pieData = [
  { id: 'revenue', name: 'الإيرادات', value: totalRevenue, color: '#10B981' },
  { id: 'expense', name: 'المصروفات', value: totalExpense, color: '#EF4444' }
];
```
- Shows percentage distribution
- Custom label with amount and percentage
- Legend positioned at bottom

**Bar Chart - By Education Stage:**
```typescript
// Groups transactions by educationStage
// Displays side-by-side bars for revenue and expense per stage
<Bar dataKey="إيرادات" fill="#10B981" key="revenue-bar" />
<Bar dataKey="مصروفات" fill="#EF4444" key="expense-bar" />
```
- X-axis: Education stages (حضانة, ابتدائي, إعدادي, ثانوي, جامعي, خريجين, الكل)
- Y-axis: Amount
- Tooltip shows exact values

#### 3. Filter Controls
- **Transaction Type Filter:**
  - All (الكل)
  - Revenue only (إيرادات)
  - Expenses only (مصروفات)
  
- **Education Stage Filter:**
  - Dropdown with all stages + "All Stages" option

#### 4. Transactions List
- Filtered list based on selected filters
- Each transaction card shows:
  - Title (العنوان)
  - Amount with type badge (إيراد/مصروف)
  - Date (التاريخ)
  - Person name (الشخص)
  - Education stage (المرحلة)
  - Description if available
- Color-coded badges: Green for revenue, Red for expense
- Empty state message when no transactions match filters

#### 5. Add Transaction Form (Modal/Expandable)
**Form Fields:**
- **Transaction Type** (نوع المعاملة) - Toggle buttons: Revenue/Expense
- **Title** (العنوان) - Text input, required
- **Amount** (المبلغ) - Number input, required, positive only
- **Date** (التاريخ) - Date picker, required
- **Education Stage** (المرحلة الدراسية) - Dropdown with all stages + "All"
- **Person Name** (اسم الشخص) - Text input, required
- **Description** (وصف إضافي) - Textarea, optional

**Form Validation:**
- All fields except description are required
- Amount must be positive number
- Date cannot be in future (optional validation)

**Fixed Add Button:**
- Positioned at bottom of screen
- Plus icon with "إضافة معاملة جديدة" text
- Opens add transaction modal

**Education Stage Labels:**
```typescript
const educationStageLabels: Record<string, string> = {
  'kg': 'حضانة',
  'primary': 'ابتدائي',
  'preparatory': 'إعدادي',
  'secondary': 'ثانوي',
  'university': 'جامعي',
  'graduate': 'خريجين',
  'all': 'جميع المراحل'
};
```

---

### 9. StatisticsPage Component

**File Path:** `src/app/components/StatisticsPage.tsx`

**Purpose:** Comprehensive analytics dashboard displaying festival statistics, charts, and leaderboards.

**Page Sections:**

#### 1. Overall Summary Cards (4-column grid)

- **Total Participants** (إجمالي المشاركين)
  - Count of all registered participants
  - Users icon, primary color
  
- **Total Attendance** (إجمالي الحضور)
  - Sum of all attendance records across all days
  - CheckSquare icon
  
- **Average Daily Attendance** (متوسط الحضور اليومي)
  - Calculated from attendance data
  - Calendar icon
  
- **Average Points** (متوسط النقاط)
  - Mean points across all participants
  - Award icon

#### 2. Charts and Visualizations

**Gender Distribution Pie Chart:**
```typescript
const genderData = [
  { 
    id: 'male', 
    name: 'ذكور',  // Males
    value: maleCount, 
    color: '#3B82F6'  // Blue
  },
  { 
    id: 'female', 
    name: 'إناث',  // Females
    value: femaleCount, 
    color: '#EC4899'  // Pink
  }
];
```
- Displays percentage and count for each gender
- Custom labels with percentages
- Legend at bottom

**Participants by Education Stage Bar Chart:**
```typescript
// Stacked or grouped bar chart
<Bar dataKey="ذكور" fill="#3B82F6" key="male-bar" />
<Bar dataKey="إناث" fill="#EC4899" key="female-bar" />
```
- X-axis: Education stages (حضانة through خريجين)
- Y-axis: Participant count
- Shows gender breakdown per stage
- Includes data table below chart

**Attendance Timeline Line Chart:**
```typescript
// Shows attendance over time
<Line 
  type="monotone" 
  dataKey="attendance" 
  stroke="var(--primary)" 
  strokeWidth={2}
  key="attendance-line"
/>
```
- X-axis: Dates
- Y-axis: Attendance count
- Shows attendance trend over festival duration
- Helps identify peak attendance days

**Points Distribution Bar Chart:**
```typescript
const pointsRanges = [
  { range: '0-50', count: 0 },
  { range: '51-100', count: 0 },
  { range: '101-150', count: 0 },
  { range: '151-200', count: 0 },
  { range: '200+', count: 0 }
];
```
- Shows how many participants fall in each points range
- Helps understand points distribution
- Primary color bars

#### 3. Attendance Percentage Statistics

Grid of 4 cards showing:
- **Average Attendance Percentage** (متوسط نسبة الحضور)
  - Mean of all participants' attendance percentages
  
- **High Attendance Participants** (مشاركين بحضور عالي)
  - Count of participants with 80%+ attendance
  
- **Total Attendance Days Recorded** (إجمالي أيام الحضور)
  - Sum of all attendance records
  
- **Total Points Distributed** (إجمالي النقاط الموزعة)
  - Sum of all participants' points

#### 4. Per-Class Statistics

For **each education stage** (حضانة, ابتدائي, إعدادي, ثانوي, جامعي, خريجين):

**Points Statistics Grid (4 cards):**
- **Total Points** (إجمالي النقاط) - Sum for this stage
- **Average Points** (متوسط النقاط) - Mean for this stage
- **Highest Points** (أعلى نقاط) - Max for this stage
- **Lowest Points** (أقل نقاط) - Min for this stage

**Top 10 in Points Leaderboard:**
```typescript
// Sorted by points descending, limited to 10
participants
  .filter(p => p.data.educationStage === stageKey)
  .sort((a, b) => b.points - a.points)
  .slice(0, 10)
  .map((participant, index) => {
    // Show rank, name, points
    // Medal icon for top 3
  })
```

**Medal System:**
- **1st Place:** Gold medal `#FFD700` / `bg-yellow-500` / Trophy icon
- **2nd Place:** Silver medal `#C0C0C0` / `bg-gray-400` / Medal icon
- **3rd Place:** Bronze medal `#CD7F32` / `bg-amber-600` / Award icon
- **4th-10th:** No medal, primary color Award icon

**Top 10 in Attendance Leaderboard:**
```typescript
// Sorted by attendance days descending, limited to 10
participants
  .filter(p => p.data.educationStage === stageKey)
  .sort((a, b) => b.attendanceDays.length - a.attendanceDays.length)
  .slice(0, 10)
  .map((participant, index) => {
    // Show rank, name, attendance days, percentage
  })
```
- Shows attendance count and percentage
- Same medal system as points leaderboard
- Percentage calculated as: `(attendanceDays.length / 15) * 100`

**Education Stage Labels:**
```typescript
const educationStageLabels: Record<string, string> = {
  'kg': 'حضانة',
  'primary': 'ابتدائي',
  'preparatory': 'إعدادي',
  'secondary': 'ثانوي',
  'university': 'جامعي',
  'graduate': 'خريجين'
};
```

**Key Features:**
- Each stage section is collapsible/expandable
- Empty states when no participants in a stage
- Responsive grid layouts
- Color-coded visualizations
- Interactive charts with tooltips

---

### 10. TeachersPage Component

**File Path:** `src/app/components/TeachersPage.tsx`

**Purpose:** Organize and display all teachers/servants (خدام) by education stages with supervisor designation.

**Data Models:**
```typescript
interface Teacher {
  id: string;              // Teacher ID (e.g., 'T001')
  name: string;            // Full name
  mobile: string;          // Mobile number
  email: string;           // Email address
  isSupervisor?: boolean;  // Is stage supervisor flag
}

interface ClassData {
  stage: string;           // Stage key (e.g., 'kg', 'primary')
  stageLabel: string;      // Arabic label (e.g., 'حضانة')
  supervisor: Teacher | null;  // Stage supervisor (one per stage)
  teachers: Teacher[];     // List of teachers in this stage
}
```

**Page Components:**

#### 1. Summary Card
Displays overview statistics:
- **Total Teachers** (إجمالي الخدام)
  - Sum of all supervisors and teachers across all stages
  - Users icon
  
- **Number of Stages** (مراحل دراسية)
  - Count of education stages (always 6)
  - Secondary color

#### 2. Stages List (Expandable/Collapsible)

For each education stage, display an expandable section:

**Stage Header (Clickable to expand/collapse):**
- Education stage name (e.g., حضانة, ابتدائي)
- Total teachers count for this stage (includes supervisor)
- Users icon
- Expand/collapse indicator (▼ when expanded, ◄ when collapsed)
- Hover effect on button

**Expanded Content:**

**Supervisor Section** (if supervisor exists):
```typescript
// Distinguished with special styling
<div className="bg-secondary/10 border-2 border-secondary/30">
  <Crown icon /> المشرف  // "Supervisor" label with crown icon
  // Supervisor details:
  // - Name
  // - Mobile
  // - Email
</div>
```
- Gold/secondary background (`bg-secondary/10`)
- Gold border (`border-secondary/30`)
- Crown icon in secondary color
- Label "المشرف" (Supervisor)

**Teachers List Section:**
- Section title: "الخدام" (Teachers)
- List of all teachers in this stage
- Each teacher card shows:
  - Name
  - Mobile number
  - Email
- Muted background (`bg-muted/30`)
- Compact card design

**Available Education Stages:**
```typescript
const educationStageLabels: Record<string, string> = {
  'kg': 'حضانة',           // Kindergarten
  'primary': 'ابتدائي',    // Primary
  'preparatory': 'إعدادي', // Preparatory
  'secondary': 'ثانوي',    // Secondary
  'university': 'جامعي',   // University
  'graduate': 'خريجين'     // Graduates
};
```

**State Management:**
```typescript
const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

const toggleStage = (stage: string) => {
  const newExpanded = new Set(expandedStages);
  if (newExpanded.has(stage)) {
    newExpanded.delete(stage);
  } else {
    newExpanded.add(stage);
  }
  setExpandedStages(newExpanded);
};
```

**Mock Data Structure:**
Each stage has:
- 1 supervisor (designated teacher with `isSupervisor: true`)
- 2-3 regular teachers
- Total of 22 teachers across 6 stages

**Key Features:**
- Collapsible sections to reduce screen clutter
- Clear visual distinction for supervisors (gold theme)
- Contact information readily available
- Organized by education stage
- Total teacher count per stage displayed in header

---

## 🔄 Data Flow & Navigation

### View System

The application uses a view-based routing system managed by state in `AppMain.tsx`:

```typescript
type View = 'login' | 'signup' | 'dashboard' | 'registration' | 
            'scanner' | 'market' | 'addPoints' | 'manualPoints' | 
            'profile' | 'finance' | 'statistics' | 'teachers';
```

**View States:**
- `login` - Teacher login page
- `signup` - Teacher registration page  
- `dashboard` - Main dashboard (default after login)
- `registration` - Student registration form
- `scanner` - QR code scanner (multi-mode)
- `market` - Market scanner view
- `addPoints` - Add points scanner view
- `manualPoints` - Manual points management modal
- `profile` - Student profile page
- `finance` - Financial management page
- `statistics` - Statistics and analytics page
- `teachers` - Teachers management page

**Initial Entry & Role Gate:**
- The application now starts at `RoleSelectionPage` which asks the user to choose `Servant` or `Student`.
- When `Student` is selected the app navigates to `StudentPortalLogin` and students may view their profile without passing the servant authentication gate.
- The main auth gate in `AppMain.tsx` now explicitly allows student flows: `if (!isAuthenticated && viewerRole !== 'student') { /* block */ }`.

### Scanner Mode System

The QR scanner component supports multiple operational modes:

```typescript
type ScanMode = 'attendance' | 'market' | 'addPoints' | 'viewDetails';
```

**Mode Behaviors:**
- `attendance` - Register attendance (+10 points automatically)
- `market` - Deduct points for purchases
- `addPoints` - Add bonus points
- `viewDetails` - View participant profile

### User Flow Scenarios

#### Scenario 1: Register Attendance
```
Dashboard 
  → Click "تسجيل الحضور" button
  → Scanner (mode: 'attendance')
  → Scan participant QR code
  → System checks if already attended today
  → If not attended: Add +10 points, record date, show success toast
  → If already attended: Show info toast
  → Return to Dashboard
```

#### Scenario 2: Deduct Points at Market
```
Dashboard 
  → Click "مسح السوق" button
  → Scanner (mode: 'market')
  → Scan participant QR code
  → MarketModal opens showing current points
  → Enter points to deduct
  → Validate: points ≤ current balance
  → Confirm deduction
  → Update participant points
  → Show success toast
  → Return to Dashboard
```

#### Scenario 3: Add Bonus Points
```
Dashboard 
  → Click "إضافة نقاط" button
  → Scanner (mode: 'addPoints')
  → Scan participant QR code
  → AddPointsModal opens showing current points
  → Enter points to add
  → Confirm addition
  → Update participant points
  → Show success toast
  → Return to Dashboard
```

#### Scenario 4: View Participant Profile (via QR)
```
Dashboard 
  → Click "عرض التفاصيل" button
  → Scanner (mode: 'viewDetails')
  → Scan participant QR code
  → Navigate to StudentProfile page
  → Display full participant information
  → Back button returns to Dashboard
```

**Alternative Path (via List):**
```
Dashboard 
  → Scroll to participants list
  → Search or browse participants
  → Click on participant
  → Navigate to StudentProfile page
```

#### Scenario 5: Manual Points Management
```
Dashboard 
  → Click "إدارة النقاط يدوياً" button
  → ManualPointsModal opens
  → Search for participant by name
  → Select participant from results
  → Choose operation: Add (إضافة) or Deduct (خصم)
  → Enter points amount
  → Preview shows current → new balance
  → Confirm operation
  → Update participant points
  → Show success toast
  → Modal closes
```

#### Scenario 6: Register New Student
```
Dashboard 
  → Click "تسجيل مشارك جديد" button
  → EnhancedRegistrationForm opens
  → Fill all required fields (dynamic based on education stage)
  → Submit form
  → Generate unique participant ID
  → Create participant record with 0 points, empty attendance
  → Show success toast
  → Return to Dashboard
```

#### Scenario 7: View Financial Reports
```
Dashboard 
  → Click "الإدارة المالية" button
  → FinancePage opens
  → View summary cards (revenue, expense, balance)
  → View charts (pie chart, bar chart by stage)
  → Apply filters (type, stage)
  → Add new transaction via form
  → Back button returns to Dashboard
```

#### Scenario 8: View Statistics
```
Dashboard 
  → Click "إحصائيات المهرجان" button
  → StatisticsPage opens
  → View summary cards (total participants, attendance, etc.)
  → View charts (gender distribution, stage breakdown, attendance timeline, points distribution)
  → Scroll to per-class statistics
  → Expand education stage to see:
    - Points statistics
    - Top 10 in points (with medals)
    - Top 10 in attendance (with percentages)
  → Back button returns to Dashboard
```

#### Scenario 9: View Teachers
```
Dashboard 
  → Click "إدارة الخدام" button
  → TeachersPage opens
  → View summary (total teachers, stages count)
  → Click on education stage to expand
  → View supervisor (gold card with crown icon)
  → View list of teachers with contact info
  → Back button returns to Dashboard
```

#### Scenario 10: Servant Registration Approval (Admin Only)
```
Admin Dashboard 
  → Click "طلبات التسجيل" (if pending requests exist)
  → RegistrationRequestsPage opens
  → Review pending servant details
  → Optionally toggle role between 'servant' and 'admin'
  → Click "موافقة" (Approve) or "رفض" (Reject)
  → If approved: Servant status set to 'approved', they can now login
  → If rejected: Servant record deleted
  → Return to Dashboard
```

### Data Update Patterns

**Points Updates:**
```typescript
// Attendance: Always +10
handleAttendance(participantId) {
  if (!alreadyAttendedToday) {
    participant.points += 10;
    participant.attendanceDays.push(today);
  }
}

// Market deduction
handleMarketDeduction(participantId, amount) {
  if (amount <= participant.points) {
    participant.points -= amount;
  }
}

// Bonus addition
handlePointsAddition(participantId, amount) {
  participant.points += amount;
}
```

**Toast Notifications:**
Every user action that modifies data shows a toast notification:
- Success: Green toast with checkmark
- Info: Blue toast with info icon
- Error: Red toast with error icon

---

## 📊 Data Models & TypeScript Interfaces

### Participant Interface

Complete participant/student record with points and attendance tracking:

```typescript
interface Participant {
  id: string;                  // Unique ID (format: 'P001', 'P002', etc.)
  name: string;                // Full name (duplicated from data.fullName for quick access)
  area: string;                // Participant's area/region (kept for quick access)
  points: number;              // Current points balance (integer, ≥ 0)
  attended: boolean;           // Attended today flag (boolean)
  attendanceDays: string[];    // Array of attendance dates (format: 'YYYY-MM-DD')
  data: StudentData;           // Complete student information
}
```

**Field Details:**
- `id` - Unique identifier, auto-generated, sequential (P001, P002, ...)
- `name` - Cached from `data.fullName` for performance
- `points` - Starts at 0, increases with attendance/bonuses, decreases with market purchases
- `attended` - Resets daily, used to prevent duplicate attendance
- `attendanceDays` - Historical record of all attendance dates
- `data` - Full StudentData object (see below)

---

### StudentData Interface

Comprehensive student information collected during registration:

```typescript
export interface StudentData {
  // Basic Information
  fullName: string;            // Full name (4 parts) - required
  gender: 'male' | 'female' | '';  // Gender selection - required
  dateOfBirth: string;         // Date in YYYY-MM-DD format - required
  confessionFather: string;    // Confession father name - required
  
  // Educational Information
  educationStage: string;      // One of: kg, primary, preparatory, secondary, university, graduate
  educationYear: string;       // Dynamic based on stage - required (except graduate)
  studyOrWorkPlace: string;    // School/workplace name - conditional required
  universityName?: string;     // University name - required if stage = 'university'
  collegeName?: string;        // College name - required if stage = 'university'
  jobTitle?: string;           // Job title - optional, only for 'graduate'
  
  // Contact Information
  personalMobile: string;      // Student's mobile number
  fatherMobile: string;        // Father's mobile - required
  motherMobile: string;        // Mother's mobile - required

  // Location
  area: string;                // Selected area/region (e.g., Aswan neighborhoods)
  
  // Address
  address: string;             // Detailed address (street, building, additional notes) - required
}
```

**Stage-Specific Field Requirements:**
- **KG/Primary/Prep/Secondary:** `studyOrWorkPlace` = school name (required)
- **University:** `universityName` + `collegeName` (both required)
- **Graduate:** `jobTitle` + `studyOrWorkPlace` (both optional)

---

### TeacherData Interface

Teacher/servant registration data (differs from StudentData):

```typescript
export interface TeacherData {
  // Basic Information
  fullName: string;            // Full name (4 parts) - required
  gender: 'male' | 'female' | '';  // Gender selection - required
  dateOfBirth: string;         // Date in YYYY-MM-DD format - required
  confessionFather: string;    // Confession father name - required
  
  // Educational Information
  educationStage: string;      // Limited to: secondary, university, graduate only
  educationYear: string;       // Dynamic based on stage - required
  studyOrWorkPlace: string;    // School/workplace name - conditional
  universityName?: string;     // University name - required if stage = 'university'
  collegeName?: string;        // College name - required if stage = 'university'
  jobTitle?: string;           // Job title - optional, only for 'graduate'
  
  // Contact Information
  mobile: string;              // Single mobile number - required
  
  // Location
  area: string;                // Selected area/region (e.g., Aswan neighborhoods)
  
  // Address
  address: string;             // Detailed address (street, building, additional notes) - required
  
}
```

**Key Differences from StudentData:**
- Only 3 education stages allowed (secondary, university, graduate)
- Single mobile number field (vs 3 for students)
- Single address field (vs detailed for students)
- Used in SignupPage (vs EnhancedRegistrationForm for students)

---

### Transaction Interface

Financial transaction record for revenue and expenses:

```typescript
interface Transaction {
  id: string;                  // Unique transaction ID (format: 'T001', 'T002', etc.)
  type: 'expense' | 'revenue'; // Transaction type
  title: string;               // Transaction title/description - required
  amount: number;              // Amount (positive number) - required
  date: string;                // Transaction date (YYYY-MM-DD) - required
  educationStage: string;      // Stage or 'all' - required
  personName: string;          // Person who paid/received - required
  description?: string;        // Additional notes - optional
}
```

**Usage:**
- `type: 'expense'` - Money spent (red in UI)
- `type: 'revenue'` - Money received (green in UI)
- `educationStage` - Can be specific stage key or 'all' for general expenses/revenue
- `amount` - Always positive, type determines if it's added or subtracted from balance

---

### Teacher Interface (for TeachersPage)

```typescript
interface Teacher {
  id: string;                  // Teacher ID (format: 'T001', 'T002', etc.)
  name: string;                // Full name
  mobile: string;              // Mobile number
  email: string;               // Email address
  isSupervisor?: boolean;      // True if this teacher is the stage supervisor
}
```

---

### ClassData Interface (for TeachersPage)

```typescript
interface ClassData {
  stage: string;               // Stage key (e.g., 'kg', 'primary')
  stageLabel: string;          // Arabic label (e.g., 'حضانة', 'ابتدائي')
  supervisor: Teacher | null;  // One designated supervisor per stage
  teachers: Teacher[];         // Array of teachers in this stage
}
```

---

### Education Stage Keys

Consistent stage keys used throughout the application:

```typescript
type EducationStage = 'kg' | 'primary' | 'preparatory' | 'secondary' | 'university' | 'graduate';

const educationStageLabels: Record<EducationStage, string> = {
  'kg': 'حضانة',           // Kindergarten
  'primary': 'ابتدائي',    // Primary school
  'preparatory': 'إعدادي', // Preparatory school
  'secondary': 'ثانوي',    // Secondary school
  'university': 'جامعي',   // University
  'graduate': 'خريجين'     // Graduates
};
```

These keys are used in:
- StudentData.educationStage
- TeacherData.educationStage (subset: secondary, university, graduate)
- Transaction.educationStage (+ 'all' option)
- Statistics and filtering throughout the app

---

## 🎯 Key Features

### 1. Points Management System

Comprehensive points system with multiple earning and spending mechanisms:

**Earning Points:**
- **Attendance Rewards:** Automatic +10 points when checking in daily
  - Prevents duplicate check-ins for same day
  - Points awarded immediately upon successful QR scan
  
- **Bonus Points:** Teachers can award additional points via:
  - QR scan + AddPointsModal (quick bonus assignment)
  - Manual points modal (search by name, no scan required)
  - No upper limit on bonus points
  
**Spending Points:**
- **Market Purchases:** Deduct points via QR scan
  - Shows current balance before deduction
  - Validates sufficient balance
  - Shows remaining balance after deduction
  
- **Manual Deduction:** Teachers can deduct points without scanning
  - Search participant by name
  - Enter amount to deduct
  - Preview before confirming

**Validation & Security:**
- All point inputs accept positive integers only
- Prevents negative numbers, decimals, scientific notation
- Keyboard input blocking for invalid characters (-, +, ., e, E)
- Market deduction cannot exceed available balance
- Points balance cannot go negative

---

### 2. Attendance Tracking System

Complete attendance management with historical records:

**Check-In Process:**
- QR code scan in 'attendance' mode
- Automatic date recording (YYYY-MM-DD format)
- Automatic +10 points award
- Duplicate prevention (one check-in per day per participant)

**Attendance Records:**
- `attendanceDays` array stores all attendance dates
- Attendance percentage calculation: `(days attended / total festival days) * 100`
- Assuming 15 total festival days for percentage
- Historical view in participant profile

**Attendance Analytics:**
- Daily attendance count on dashboard
- Attendance timeline chart (line graph)
- Per-participant attendance percentage
- High attendance identification (80%+ threshold)
- Top 10 attendance leaderboard per education stage

---

### 3. QR Code System

Multi-functional QR code system for various operations:

**QR Code Generation:**
- Each participant gets unique QR code based on their ID
- Uses `qrcode.react` library
- QR code contains participant ID only (e.g., "P001")
- High-quality SVG rendering

**QR Code Scanning:**
- Uses `html5-qrcode` library
- Camera access with permission handling
- Flash/torch control (if device supports)
- Fallback to image upload if camera denied
- Four operational modes (see below)

**QR Code Download:**
- Export QR as PNG image (600x600 pixels)
- Filename format: `QR_{ParticipantName}_{ID}.png`
- SVG to Canvas to PNG conversion
- High resolution for printing

**Scanner Modes:**
1. **Attendance Mode** (تسجيل الحضور)
   - Burgundy border/UI
   - Registers attendance + awards points
   
2. **Market Mode** (مسح السوق)
   - Gold border/UI
   - Opens deduction modal
   
3. **Add Points Mode** (إضافة نقاط)
   - Green border/UI
   - Opens bonus points modal
   
4. **View Details Mode** (عرض التفاصيل)
   - Blue border/UI
   - Opens participant profile

---

### 4. Advanced Statistics & Analytics

Comprehensive analytics dashboard with interactive visualizations:

**Overview Statistics:**
- Total participants count
- Total attendance records
- Average daily attendance
- Average points per participant

**Charts & Visualizations:**
- **Gender Distribution Pie Chart:** Male vs Female percentages
- **Stage Distribution Bar Chart:** Participants by education stage with gender breakdown
- **Attendance Timeline Line Chart:** Track attendance over festival duration
- **Points Distribution Bar Chart:** Participants grouped by point ranges

**Per-Class Analytics:**
For each education stage (حضانة through خريجين):
- Points statistics (total, average, max, min)
- **Top 10 Leaderboards:**
  - Top 10 in Points (with medal icons for 1st/2nd/3rd place)
  - Top 10 in Attendance (with percentages)

**Attendance Insights:**
- Average attendance percentage across all participants
- Count of high-attendance participants (80%+)
- Total attendance days recorded
- Total points distributed

**Interactive Features:**
- Recharts library for interactive charts
- Tooltips on hover
- Responsive chart sizing
- Color-coded visualizations

---

### 5. Financial Management

Complete financial tracking system for festival budget:

**Transaction Types:**
- **Revenue** (إيرادات) - Money received (green)
- **Expense** (مصروفات) - Money spent (red)

**Transaction Details:**
- Title, amount, date, person name
- Education stage association (or 'all' for general)
- Optional description field

**Financial Overview:**
- **Total Revenue:** Sum of all revenue transactions
- **Total Expenses:** Sum of all expense transactions
- **Current Balance:** Revenue - Expenses (color-coded: green if positive, red if negative)

**Financial Analytics:**
- **Pie Chart:** Revenue vs Expense ratio
- **Bar Chart:** Revenue and expenses by education stage
- Visual comparison of spending across different classes

**Filtering & Search:**
- Filter by transaction type (all/revenue/expense)
- Filter by education stage
- Transactions list updates based on filters

---

### 6. Teachers Management

Organize and manage all festival teachers/servants:

**Organization Structure:**
- Teachers organized by education stages (6 stages)
- Each stage has one designated supervisor (المشرف)
- Multiple teachers per stage

**Supervisor System:**
- Visual distinction with gold background and crown icon
- One supervisor per education stage
- `isSupervisor: true` flag

**Teacher Information:**
- Full name
- Mobile number
- Email address
- Stage assignment

**UI Features:**
- Expandable/collapsible stage sections
- Summary card with total teachers count
- Contact information readily available
- Clear supervisor designation

---

### 7. Student Registration

Comprehensive registration form with dynamic fields:

**Dynamic Form Behavior:**
- Form fields change based on education stage selection
- Different required fields for each stage
- Resets dependent fields when stage changes

**Data Collection:**
- Basic info: Name, gender, DOB, confession father
- Educational info: Stage, year, school/university/work
- Contact info: Personal + father + mother mobile numbers
- Complete address

**Stage-Specific Fields:**
- KG/Primary/Prep/Secondary: School name required
- University: University + College names required
- Graduate: Job title + workplace optional

---

### 8. RTL Support & Arabization

Complete Arabic language support:

**Text Direction:**
- Right-to-left (RTL) text direction
- RTL layout for all UI components
- RTL-aware flexbox and grid layouts

**Arabic Typography:**
- Arabic font stack (Tajawal, Cairo)
- Proper Arabic font weights
- Arabic numerals (Western 1,2,3 not Eastern ١٢٣)

**UI Components:**
- Toast notifications with RTL support
- Form inputs with RTL text alignment
- Charts with RTL-friendly labels

---

### 9. Responsive Mobile-First Design

Optimized for mobile devices:

**Mobile Optimization:**
- Touch-friendly button sizes
- Sticky headers for easy navigation
- Fixed action buttons at bottom
- Scrollable content areas

**Grid Layouts:**
- 2-column grids for statistics cards
- 3-column grids for action buttons
- Responsive breakpoints

**Performance:**
- Efficient re-renders
- Optimized image loading
- Lightweight bundle size

---

## 🔧 Libraries & Dependencies

### Core Framework
```json
{
  "react": "^18.3.1",        // React library for UI components
  "react-dom": "^18.3.1",    // React DOM renderer
  "typescript": "~5.6.2"     // TypeScript for type safety
}
```

**Why React 18.3.1:**
- Latest stable version with concurrent features
- Automatic batching for better performance
- Improved TypeScript support
- Modern hooks and state management

**Why TypeScript:**
- Type safety for all components and data models
- Better IDE support and autocomplete
- Compile-time error detection
- Self-documenting code

---

### Styling Framework
```json
{
  "tailwindcss": "^4.0.0"    // Utility-first CSS framework
}
```

**Tailwind CSS v4 Features Used:**
- CSS custom properties for theming (`--primary`, `--secondary`, etc.)
- Utility classes for rapid development
- Responsive design utilities
- RTL support
- No config file needed for v4 (theme in CSS)

**Custom Theme Variables:**
All colors defined in `/src/styles/theme.css` using CSS variables

---

### QR Code Libraries
```json
{
  "html5-qrcode": "latest",  // QR code scanning
  "qrcode.react": "latest"   // QR code generation
}
```

**html5-qrcode:**
- Uses device camera for scanning
- Supports file upload fallback
- Multiple scan modes
- Error handling for permissions
- Flashlight control

**qrcode.react:**
- SVG-based QR code generation
- High quality rendering
- Customizable size and colors
- Easy download capability

---

### Charts & Visualizations
```json
{
  "recharts": "latest"       // Composable charting library
}
```

**Chart Types Used:**
- **PieChart:** Gender distribution, revenue vs expense
- **BarChart:** Stage distribution, points distribution, financial by stage
- **LineChart:** Attendance timeline

**Features:**
- Responsive charts
- Interactive tooltips
- Customizable colors
- Legend support
- Accessibility features

**Usage Example:**
```typescript
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line } from 'recharts';
```

---

### Icons
```json
{
  "lucide-react": "latest"   // Icon library
}
```

**Icons Used Throughout Application:**
- **Navigation:** ArrowRight, Home
- **Actions:** Plus, Edit, Save, Download, Upload
- **Features:** Users, CheckSquare, ShoppingBag, UserPlus, QrCode
- **Finance:** Wallet, DollarSign, TrendingUp, TrendingDown
- **Statistics:** BarChart3, Calendar, Award
- **Management:** Crown, Settings, FileText

**Why Lucide:**
- Clean, consistent design
- Tree-shakeable (only import what you use)
- TypeScript support
- Customizable size and color
- Active maintenance

---

### Toast Notifications
```json
{
  "sonner": "latest"         // Toast notification library
}
```

**Configuration:**
```typescript
<Toaster 
  position="top-center"      // Center top position
  dir="rtl"                  // RTL support for Arabic
  toastOptions={{
    style: {
      fontFamily: 'Tajawal, Cairo, sans-serif'  // Arabic fonts
    }
  }}
/>
```

**Toast Types Used:**
- `toast.success()` - Green checkmark for successful operations
- `toast.info()` - Blue info icon for informational messages
- `toast.error()` - Red X for errors
- `toast()` - Default neutral toast

**Why Sonner:**
- Beautiful default styling
- RTL support
- Customizable
- Lightweight
- Good TypeScript support

---

### Font Loading
```css
/* Google Fonts via CSS import in fonts.css */
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&family=Cairo:wght@400;600;700&display=swap');
```

**Font Stack:**
- Tajawal (primary) - Modern, clean Arabic font
- Cairo (fallback) - Geometric Arabic font
- sans-serif (system fallback)

---

### Development Tools
```json
{
  "vite": "latest",          // Build tool and dev server
  "@vitejs/plugin-react": "latest",  // React plugin for Vite
  "postcss": "latest",       // CSS processor
  "autoprefixer": "latest"   // Vendor prefix automation
}
```

**Why Vite:**
- Lightning-fast HMR (Hot Module Replacement)
- Optimized production builds
- Native ES modules
- Excellent dev experience

---

### Package Management

**Package Manager:** pnpm (not npm)

**Installation Commands:**
```bash
# Install dependencies
pnpm install

# Add new package
pnpm add package-name

# Add dev dependency
pnpm add -D package-name

# Run dev server
pnpm dev
```

---

## 🎨 Styling Guidelines & Design System

### Component Styling Patterns

#### 1. Cards
Standard card component styling:
```css
className="bg-card rounded-xl p-5 shadow-sm border border-border"
```

**Usage:** Containers for grouped content (forms, statistics, information sections)

**Variations:**
- Statistics cards: Add colored backgrounds for visual distinction
- Clickable cards: Add `hover:bg-muted/50 transition-colors cursor-pointer`
- Highlighted cards: Use `bg-primary/10 border-primary` for emphasis

---

#### 2. Buttons

**Primary Button (Main actions):**
```css
className="w-full bg-primary text-primary-foreground rounded-xl py-4 
           shadow-lg active:scale-[0.98] transition-transform 
           flex items-center justify-center gap-2"
```
- Burgundy background
- White text
- Scale animation on tap
- Icon + text layout

**Secondary Button (Supporting actions):**
```css
className="w-full bg-card text-card-foreground rounded-xl p-4 
           shadow-sm border border-border active:scale-[0.98] 
           transition-transform hover:bg-muted/50"
```
- White background
- Bordered
- Hover effect
- Scale animation on tap

**Toggle/Selection Button (Gender, Type selection):**
```css
className={`py-3 rounded-lg border-2 transition-all ${
  selected 
    ? 'border-primary bg-primary/10 text-primary font-medium' 
    : 'border-border bg-input-background text-foreground'
}`}
```
- State-dependent styling
- Primary color when selected
- Muted when unselected
- Smooth transitions

**Icon Button (Small actions):**
```css
className="p-2 hover:bg-white/10 rounded-lg active:scale-95 transition-transform"
```
- Used in headers for back buttons
- Circular hit area
- Minimal styling

---

#### 3. Input Fields

**Text Input / Number Input:**
```css
className="w-full px-4 py-3 bg-input-background rounded-lg 
           border border-border focus:outline-none focus:ring-2 
           focus:ring-ring transition-all"
```

**Select Dropdown:**
```css
className="w-full px-4 py-3 bg-input-background rounded-lg 
           border border-border focus:outline-none focus:ring-2 
           focus:ring-ring appearance-none"
```

**Textarea:**
```css
className="w-full px-4 py-3 bg-input-background rounded-lg 
           border border-border focus:outline-none focus:ring-2 
           focus:ring-ring resize-none"
rows={3}
```

**Date Input:**
```css
className="w-full px-4 py-3 bg-input-background rounded-lg 
           border border-border focus:outline-none focus:ring-2 
           focus:ring-ring"
type="date"
```

---

#### 4. Headers

**Primary Page Header (with back button):**
```css
className="bg-primary text-primary-foreground p-4 
           sticky top-0 z-10 shadow-md"
```
- Burgundy background
- Sticky positioning (stays visible on scroll)
- Contains back button + title
- High z-index for layering

**Simple Header (login/signup pages):**
```css
className="bg-card border-b-2 border-primary/20 py-4 px-4 
           sticky top-0 z-10 shadow-sm"
```
- White background
- Subtle bottom border
- Contains logos only
- Sticky positioning

---

#### 5. Typography

**Headings:**
```css
/* Section Title */
h3: className="text-primary mb-4 font-medium"

/* Subsection Title */
h4: className="text-sm font-medium text-muted-foreground mb-2"

/* Label */
label: className="block mb-2 text-sm text-foreground"
```

**Body Text:**
```css
/* Regular text */
className="text-foreground"

/* Muted/secondary text */
className="text-muted-foreground text-sm"

/* Small text / captions */
className="text-xs text-muted-foreground"
```

---

#### 6. Layout Containers

**Full Screen Page:**
```css
className="min-h-screen bg-background pb-8"
```
- Minimum full viewport height
- Background color
- Bottom padding for fixed buttons

**Content Section:**
```css
className="p-4 space-y-4"
```
- Consistent padding
- Vertical spacing between children

**Form Container:**
```css
className="p-4 space-y-4 pb-24"
```
- Extra bottom padding for fixed submit button

---

#### 7. Spacing System

**Vertical Spacing (space-y-*):**
```css
Form sections: space-y-4    /* 16px between form fields */
Card grids: space-y-3       /* 12px between cards */
Statistics: space-y-6       /* 24px between major sections */
```

**Grid Gaps:**
```css
Statistics cards: gap-3     /* 12px gap */
Action buttons: gap-3       /* 12px gap */
Icon + text: gap-2          /* 8px gap */
```

**Padding:**
```css
Pages: p-4                  /* 16px padding */
Cards: p-5                  /* 20px padding */
Buttons: py-3 px-4          /* 12px vertical, 16px horizontal */
Inputs: py-3 px-4           /* 12px vertical, 16px horizontal */
```

---

#### 8. Fixed Elements

**Fixed Submit Button:**
```css
className="fixed bottom-0 left-0 right-0 p-4 
           bg-background border-t border-border 
           shadow-lg z-20"
```
- Spans full width
- Always visible at bottom
- Background to prevent overlap
- Top border for separation
- Shadow for depth

---

## 📱 Responsive Design

### Mobile-First Approach

All interfaces designed primarily for mobile devices (320px - 428px width):

**Design Principles:**
- Touch-friendly button sizes (minimum 44x44px)
- Single-column layouts
- Sticky headers for navigation
- Fixed action buttons for easy access
- Scrollable content areas
- Large, readable text

---

### Grid Layouts

**2-Column Grid (Statistics cards):**
```css
className="grid grid-cols-2 gap-3"
```
- Used for summary statistics
- Equal width columns
- Responsive to container

**3-Column Grid (Action buttons):**
```css
className="grid grid-cols-3 gap-3"
```
- Used for feature buttons (market, add points, view details)
- Equal width columns
- Maintains aspect ratio

**Responsive Grids:**
```css
/* 2 columns on mobile, 4 on larger screens */
className="grid grid-cols-2 md:grid-cols-4 gap-3"

/* 1 column on mobile, 2 on larger screens */
className="grid grid-cols-1 md:grid-cols-2 gap-4"
```

---

### Breakpoints

Tailwind default breakpoints used where needed:
- `sm`: 640px (small devices)
- `md`: 768px (tablets)
- `lg`: 1024px (laptops)
- `xl`: 1280px (desktops)

**Example Usage:**
```css
/* Hidden on mobile, visible on desktop */
className="hidden md:block"

/* Full width on mobile, 1/2 width on desktop */
className="w-full md:w-1/2"
```

---

## 🌐 RTL (Right-to-Left) Support

### Text Direction

All components use RTL layout for Arabic:

```css
/* Applied globally in theme.css */
html {
  direction: rtl;
}
```

**RTL Considerations:**
- Flexbox automatically reverses in RTL
- Grid columns flow right-to-left
- Text aligns right by default
- Icons position appropriately
- Margins/padding flip automatically

---

### Language & Localization

**Text Content:**
- All UI text in Arabic (العربية)
- Form labels in Arabic
- Error messages in Arabic
- Button text in Arabic
- Chart labels in Arabic

**Numerals:**
- Western Arabic numerals (1, 2, 3...) used
- Not Eastern Arabic numerals (١، ٢، ٣...)
- Consistent with modern Arabic UIs

**Date Formats:**
- Internal storage: YYYY-MM-DD (ISO format)
- Display: Depends on browser locale

---

## 💾 Local Storage

### Storage Keys Used

```javascript
// Welcome screen visit tracking
'arribsalin-visited' = 'true'  // Set after first visit
```

**Purpose:** Prevents welcome screen from showing on subsequent visits

**Usage:**
```typescript
const hasVisited = localStorage.getItem('arribsalin-visited');
if (!hasVisited) {
  setShowWelcome(true);
  localStorage.setItem('arribsalin-visited', 'true');
}
```

**Future Storage Considerations:**
- Could store recent participants for quick access
- Could cache statistics calculations
- Could save filter preferences
- Currently: Mock data in component state (not persisted)

---

## 🔔 Toast Notification System

### Sonner Configuration

```typescript
import { Toaster } from 'sonner';

<Toaster 
  position="top-center"     // Center top of screen
  dir="rtl"                 // Right-to-left for Arabic
  richColors                // Enhanced color schemes
  toastOptions={{
    style: {
      fontFamily: 'Tajawal, Cairo, sans-serif',  // Arabic fonts
    },
    duration: 3000,         // 3 seconds display time
  }}
/>
```

---

### Toast Usage Patterns

**Success Notifications:**
```typescript
toast.success('تم تسجيل الحضور بنجاح!', {
  description: `${participant.name} - تم إضافة 10 نقاط`
});
```
- Green color scheme
- Checkmark icon
- Used for: attendance registered, points added/deducted, data saved

**Info Notifications:**
```typescript
toast.info('تم تسجيل حضور هذا المشارك مسبقاً اليوم');
```
- Blue color scheme
- Info icon
- Used for: duplicate attendance, informational messages

**Error Notifications:**
```typescript
toast.error('حدث خطأ في المعالجة');
```
- Red color scheme
- X icon
- Used for: QR scan errors, validation errors, operation failures

**Custom Notifications:**
```typescript
toast('رسالة عادية', {
  description: 'تفاصيل إضافية',
  icon: <CustomIcon />
});
```

---

## 📸 Images & Assets

### Logos

**Church Logo:** `src/imports/new-church-logo.png`
- مارمينا logo (St. Mina)
- Used in headers (right position)
- Square aspect ratio
- Size: `w-14 h-14` (56x56px)

**Festival Logo:** `src/imports/Arebsalin-1.png`
- اريبصالين logo
- Used in headers (center position)
- Horizontal aspect ratio
- Size: `h-14` (auto width)

---

### Header Logo Layout Pattern

```typescript
<div className="flex items-center justify-between">
  {/* Church logo - right side */}
  <img 
    src={churchLogo} 
    alt="Church Logo" 
    className="w-14 h-14 object-contain" 
  />
  
  {/* Festival logo - center */}
  <img 
    src={festivalLogo} 
    alt="Festival Logo" 
    className="h-14 object-contain" 
  />
  
  {/* Spacer for perfect centering */}
  <div className="w-14" />
</div>
```

**Why spacer div:** Ensures festival logo is perfectly centered by balancing the church logo width

---

### Icon Usage

**Import Pattern:**
```typescript
import { 
  Users, CheckSquare, ShoppingBag, UserPlus, QrCode, 
  Plus, Settings, Wallet, BarChart3, ArrowRight, Save, 
  Crown, Calendar, Award, TrendingUp, TrendingDown, 
  DollarSign, Download, Upload, Edit, FileText
} from 'lucide-react';
```

**Sizing:**
```typescript
<Users className="w-5 h-5" />      // Small (20x20px)
<Users className="w-6 h-6" />      // Medium (24x24px)
<Users className="w-8 h-8" />      // Large (32x32px)
```

**Coloring:**
```typescript
<Users className="text-primary" /> // Primary color
<Users style={{ color: 'var(--secondary)' }} /> // Secondary via inline
```

---

## 📋 Mock Data Specifications

The application includes comprehensive mock data for demonstration and testing purposes.

### Participant Overview

**Total Participants:** 35 participants across all education stages

**Distribution by Education Stage:**
- **Kindergarten (حضانة):** 3 participants
- **Primary (ابتدائي):** 5 participants
- **Preparatory (إعدادي):** 5 participants
- **Secondary (ثانوي):** 7 participants
- **University (جامعي):** 7 participants
- **Graduate (خريجين):** 8 participants

---

### Points Distribution

Participants have varied points to demonstrate different scenarios:

**Points Ranges:**
- **0-50 points:** 5 participants (low activity)
- **51-100 points:** 4 participants (moderate activity)
- **101-150 points:** 7 participants (good activity)
- **151-200 points:** 9 participants (high activity)
- **200+ points:** 10 participants (very high activity)

**Top 3 by Points:**
1. **أبانوب رافت ميخائيل** (Abanoub Rafat Mikhail) - 270 points
2. **كيرلس ممدوح صادق** (Kyrillos Mamdouh Sadek) - 250 points
3. **إيريني حبيب جرجس** (Eirene Habib Gerges) - 240 points

---

### Attendance Distribution

Festival assumes 15 total days. Participants have varied attendance:

**Attendance Ranges:**
- **0 days:** 1 participant (not yet attended)
- **1-3 days:** 4 participants (low attendance)
- **4-7 days:** 8 participants (moderate attendance)
- **8-11 days:** 12 participants (good attendance)
- **12-15 days:** 10 participants (high attendance)

**Attendance Percentages:**
- 80%+ attendance: 10 participants
- 50-80% attendance: 12 participants
- Below 50%: 13 participants

**Top 3 by Attendance:**
1. **أبانوب رافت ميخائيل** (Abanoub Rafat Mikhail) - 15 days (100%)
2. **كيرلس ممدوح صادق** (Kyrillos Mamdouh Sadek) - 15 days (100%)
3. **إيريني حبيب جرجس** (Eirene Habib Gerges) - 14 days (93.3%)

---

### Gender Distribution

**Total by Gender:**
- Males (ذكور): ~18 participants (51%)
- Females (إناث): ~17 participants (49%)

**Balanced across all education stages**

---

### Sample Participant Data

**Example Participant Record:**
```typescript
{
  id: 'P001',
  name: 'أبانوب رافت ميخائيل',
  points: 270,
  attended: true,
  attendanceDays: [
    '2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05',
    '2026-05-06', '2026-05-07', '2026-05-08', '2026-05-09', '2026-05-10',
    '2026-05-11', '2026-05-12', '2026-05-13', '2026-05-14', '2026-05-15'
  ],
  data: {
    fullName: 'أبانوب رافت ميخائيل حنا',
    gender: 'male',
    educationStage: 'graduate',
    educationYear: '',
    studyOrWorkPlace: 'شركة تطوير البرمجيات',
    jobTitle: 'مهندس برمجيات',
    confessionFather: 'أبونا يوحنا',
    personalMobile: '01001234567',
    fatherMobile: '01101234567',
    motherMobile: '01201234567',
    address: 'أسوان - شارع الكورنيش - عمارة 15 - الدور الخامس',
    dateOfBirth: '2000-03-15'
  }
}
```

---

### Mock Teachers Data

**Total Teachers:** 22 teachers across 6 stages

**Organization:**
- Each stage has 1 supervisor + 2-3 teachers
- Supervisors marked with `isSupervisor: true`
- All have contact information (mobile, email)

**Sample Teacher:**
```typescript
{
  id: 'T001',
  name: 'مريم بطرس فهمي',
  mobile: '01012345678',
  email: 'mariam@example.com',
  isSupervisor: true
}
```

---

### Mock Financial Data

**Sample Transactions:**
```typescript
[
  {
    id: 'T001',
    type: 'revenue',
    title: 'رسوم الاشتراك',
    amount: 5000,
    date: '2026-05-01',
    educationStage: 'all',
    personName: 'أبونا يوحنا',
    description: 'رسوم اشتراك جميع المراحل'
  },
  {
    id: 'T002',
    type: 'expense',
    title: 'شراء مستلزمات',
    amount: 1500,
    date: '2026-05-02',
    educationStage: 'primary',
    personName: 'مريم بطرس',
    description: 'أدوات كتابية وأوراق'
  }
]
```

**Financial Summary:**
- Total Revenue: ~15,000
- Total Expenses: ~8,000
- Current Balance: ~7,000

---

### Data Generation Pattern

All mock data follows realistic patterns:

**Names:** Common Coptic/Egyptian Christian names
**Dates:** Recent dates within May 2026
**Contact Numbers:** Egyptian mobile format (01XXXXXXXXX)
**Addresses:** Aswan city locations
**Points:** Realistic distribution based on attendance
**Email:** Example.com domain for teachers

**Consistency Rules:**
- Points correlate with attendance (high attendance = more points)
- Each participant has complete, valid data
- All required fields populated
- Optional fields sometimes left empty for realism

---

## 🔐 Security & Validation

### Input Validation Strategies

#### 1. Points Input - Positive Integers Only

All points-related inputs enforce strict validation:

```typescript
// Accept only positive integers (no negatives, decimals, or scientific notation)
onChange={(e) => {
  const value = e.target.value;
  // Allow empty string or positive integers only
  if (value === '' || (parseInt(value) > 0 && !value.includes('-') && !value.includes('.'))) {
    setPoints(value);
  }
}}

// Prevent typing invalid characters
onKeyDown={(e) => {
  // Block -, +, ., e, E keys
  if (e.key === '-' || e.key === '+' || e.key === '.' || e.key === 'e' || e.key === 'E') {
    e.preventDefault();
  }
}}

// HTML5 validation
type="number"
min="1"
step="1"
```

**Applied to:**
- MarketModal (deduction input)
- AddPointsModal (bonus input)
- ManualPointsModal (points input)
- FinancePage (amount input)

---

#### 2. Duplicate Attendance Prevention

Prevents participants from checking in multiple times per day:

```typescript
// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

// Check if already attended today
if (participant.attendanceDays.includes(today)) {
  toast.info('تم تسجيل حضور هذا المشارك مسبقاً اليوم');
  return; // Abort attendance registration
}

// If not attended, proceed
participant.attendanceDays.push(today);
participant.points += 10;
participant.attended = true;
```

**Behavior:**
- Shows info toast if already checked in
- Prevents duplicate points award
- Maintains data integrity

---

#### 3. Balance Validation on Deduction

Prevents points balance from going negative:

```typescript
// In MarketModal
const handleConfirm = () => {
  const amount = parseInt(pointsToDeduct);
  
  if (amount > participant.points) {
    toast.error('النقاط المطلوبة أكبر من الرصيد المتاح');
    return; // Abort deduction
  }
  
  // Proceed with deduction
  onConfirm(participant.id, amount);
};
```

**UI Feedback:**
- Shows remaining balance preview
- Disables confirm if insufficient balance
- Error toast on invalid attempt

---

#### 4. Required Field Validation

All forms use HTML5 required attribute:

```typescript
<input
  type="text"
  required  // Browser validation
  value={formData.fullName}
  onChange={(e) => updateField('fullName', e.target.value)}
/>
```

**Validation Behavior:**
- Browser shows native validation messages
- Submit button disabled until valid
- Arabic error messages (browser dependent)

---

#### 5. Data Type Validation

TypeScript provides compile-time type safety:

```typescript
interface StudentData {
  fullName: string;           // Type enforced
  gender: 'male' | 'female' | '';  // Union type - only these values
  educationStage: string;
  // ... more fields
}
```

**Benefits:**
- Prevents invalid data assignments
- Autocomplete in IDE
- Compile-time error detection

---

### Security Considerations

**Current Implementation:**
- ✅ Client-side validation only (appropriate for mock data)
- ✅ Type safety via TypeScript
- ✅ Input sanitization for numbers
- ⚠️ No authentication (mock login always succeeds)
- ⚠️ No authorization (all teachers have full access)
- ⚠️ No data encryption (local state only)

**Production Recommendations:**
- Implement real authentication (JWT, OAuth, etc.)
- Add role-based access control
- Server-side validation (never trust client)
- API rate limiting
- SQL injection prevention (if using database)
- XSS prevention (React handles this mostly)
- HTTPS only in production

---

## 🎯 Future Features & Enhancements

### 1. Database Integration

**Recommended:** Supabase or Firebase

**Features to Add:**
- Real-time data synchronization
- Persistent storage (data survives refresh)
- Multi-device support
- Automatic backups
- Offline support with sync

**Implementation Steps:**
1. Set up Supabase/Firebase project
2. Define database schema (tables for participants, teachers, transactions)
3. Create API service layer
4. Replace local state with database calls
5. Add loading states and error handling

---

### 2. Reporting & Export

**PDF Reports:**
- Individual participant certificates
- Attendance reports by stage
- Financial statements
- Top performers certificates

**Excel Export:**
- Complete participant list
- Attendance records
- Points leaderboard
- Financial transactions

**Implementation:**
- Use `jsPDF` for PDF generation
- Use `xlsx` library for Excel export
- Add export buttons to relevant pages

---

### 3. Push Notifications

**Use Cases:**
- Remind teachers of daily tasks
- Notify participants of achievements
- Alert about upcoming events
- Point milestones reached

**Implementation:**
- Web Push API for browsers
- Firebase Cloud Messaging
- Service worker for background notifications

---

### 4. Rewards System

**Features:**
- Define reward tiers (e.g., 100, 200, 300 points)
- Automatic badge awards
- Printable certificates
- Prize redemption tracking
- Achievement history

---

### 5. SMS/WhatsApp Integration

**Use Cases:**
- Send QR codes to participants
- Notify parents of attendance
- Broadcast announcements
- Send reminders

**Implementation:**
- Twilio API for SMS
- WhatsApp Business API
- Message templates
- Opt-in/opt-out management

---

### 6. Advanced Analytics

**Additional Statistics:**
- Retention rate (day-to-day attendance)
- Peak attendance hours
- Demographic insights
- Predictive analytics (who might drop off)
- Comparative analysis (year over year)

---

## 🐛 Known Issues & Solutions

### 1. Camera Permission Error

**Error:** `NotAllowedError: Permission denied`

**When it Occurs:**
- User denies camera permission
- Browser blocks camera access
- Device doesn't have camera
- Camera in use by another app

**Solution Implemented:**
✅ Comprehensive fallback UI automatically displayed:
1. "Request Permission Again" button
2. Upload QR image option (file input)
3. Step-by-step instructions for enabling camera

**User Action Required:**
- Enable camera in browser settings
- OR use image upload feature
- OR manually enter participant ID

**This is Expected Behavior:** Not a bug, handled gracefully

---

### 2. Recharts Duplicate Key Warnings

**Issue:** Console warnings about duplicate keys in chart children

**Solution Applied:**
```typescript
// Add unique key prop to each chart child
<Bar dataKey="إيرادات" fill="#10B981" key="revenue-bar" />
<Bar dataKey="مصروفات" fill="#EF4444" key="expense-bar" />
<CartesianGrid strokeDasharray="3 3" key="grid" />
<XAxis dataKey="name" key="xaxis" />
<YAxis key="yaxis" />
<Tooltip key="tooltip" />
<Legend key="legend" />
```

**Status:** ✅ Fixed in all chart components

---

### 3. Date Display Format

**Issue:** Dates display in browser's locale format

**Current Behavior:**
- Internal storage: YYYY-MM-DD (ISO format)
- Display: Depends on user's browser/OS locale
- May show in English or Arabic numerals

**Potential Solution:**
- Use date formatting library (date-fns, dayjs)
- Force specific locale for consistency
- Display relative dates ("اليوم", "أمس", etc.)

**Status:** ⚠️ Minor, not affecting functionality

---

## 📚 References & Resources

### Official Documentation

**Core Technologies:**
- [React 18 Documentation](https://react.dev) - Official React docs
- [TypeScript Handbook](https://www.typescriptlang.org/docs) - TypeScript reference
- [Tailwind CSS v4](https://tailwindcss.com) - Utility-first CSS framework
- [Vite Guide](https://vitejs.dev/guide) - Build tool documentation

**Libraries:**
- [Recharts Documentation](https://recharts.org) - Charting library
- [Lucide Icons](https://lucide.dev) - Icon library
- [Sonner](https://sonner.emilkowal.ski) - Toast notifications
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) - QR scanner
- [qrcode.react](https://github.com/zpao/qrcode.react) - QR generator

**Fonts:**
- [Google Fonts - Tajawal](https://fonts.google.com/specimen/Tajawal)
- [Google Fonts - Cairo](https://fonts.google.com/specimen/Cairo)

**Learning Resources:**
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app)
- [Tailwind CSS Components](https://tailwindui.com)
- [RTL Styling Guide](https://rtlstyling.com)

---

## 📝 Important Notes

### Browser Compatibility

**Minimum Requirements:**
- Modern browser supporting:
  - ES6+ JavaScript features
  - CSS Grid and Flexbox
  - HTML5 getUserMedia API (for camera)
  - Web Storage API (localStorage)
  - SVG rendering

**Recommended Browsers:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile: iOS Safari 14+, Chrome Mobile 90+

**Not Supported:**
- Internet Explorer (any version)
- Very old mobile browsers

---

### Device Support

**Primary Target:** Mobile devices (320px - 428px width)
- Smartphones (iOS, Android)
- Optimized for portrait orientation

**Secondary Support:** Tablets and Desktop
- Responsive layouts adapt
- Better experience on larger screens
- All features functional

---

### Performance Considerations

**Optimization Techniques Applied:**
- Component-level state (not global)
- Minimal re-renders
- Efficient list rendering (keys on items)
- Lazy loading images
- SVG icons (scalable, small filesize)

**Performance Metrics (Estimated):**
- Initial load: ~2-3 seconds on 3G
- Time to interactive: ~3-4 seconds
- Bundle size: ~500KB (production)

**Future Optimizations:**
- Code splitting by route
- Image optimization/compression
- Service worker for offline support
- Memoization of expensive calculations

---

## 🎓 Developer Quick Start Guide

### Adding a New Page

Complete walkthrough for adding a feature page:

#### Step 1: Create Component File

```typescript
// src/app/components/NewPage.tsx
import { ArrowRight, IconName } from 'lucide-react';

interface NewPageProps {
  onBack: () => void;
  // Add other props as needed
}

export function NewPage({ onBack }: NewPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg active:scale-95 transition-transform">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h2 className="text-xl">عنوان الصفحة</h2>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Your page content here */}
      </div>
    </div>
  );
}
```

#### Step 2: Update AppMain.tsx

```typescript
// 1. Import the new component
import { NewPage } from './components/NewPage';

// 2. Add to View type union
type View = 'login' | 'signup' | 'dashboard' | 'registration' | 
            'scanner' | 'market' | 'addPoints' | 'manualPoints' | 
            'profile' | 'finance' | 'statistics' | 'teachers' | 
            'newpage';  // Add here

// 3. Add navigation handler in EnhancedDashboard props
interface EnhancedDashboardProps {
  onNavigate: (view: 'scanner' | 'registration' | 'market' | 'addPoints' | 
                     'manualPoints' | 'profile' | 'viewDetails' | 
                     'finance' | 'statistics' | 'teachers' | 
                     'newpage') => void;  // Add here
  // ... other props
}

// 4. Add route in render section
{currentView === 'newpage' && (
  <NewPage onBack={() => setCurrentView('dashboard')} />
)}
```

#### Step 3: Add Navigation Button in Dashboard

```typescript
// In EnhancedDashboard.tsx
<button
  onClick={() => onNavigate('newpage')}
  className="w-full bg-card text-card-foreground rounded-xl p-4 shadow-sm border border-border active:scale-[0.98] transition-transform hover:bg-muted/50"
>
  <div className="flex items-center justify-center gap-3">
    <IconName className="w-5 h-5 text-primary" />
    <span>اسم الصفحة الجديدة</span>
  </div>
</button>
```

---

### Adding a New Chart

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Prepare data
const data = [
  { name: 'Category 1', value: 100 },
  { name: 'Category 2', value: 200 },
];

// Render chart
<BarChart width={350} height={250} data={data}>
  <CartesianGrid strokeDasharray="3 3" key="grid" />
  <XAxis dataKey="name" key="xaxis" />
  <YAxis key="yaxis" />
  <Tooltip key="tooltip" />
  <Legend key="legend" />
  <Bar dataKey="value" fill="var(--primary)" key="bar" />
</BarChart>
```

---

## ✅ Deployment Checklist

Before launching to production:

**Testing:**
- [ ] Test all features on real devices (iOS, Android)
- [ ] Verify responsive design on multiple screen sizes
- [ ] Test QR scanner with real printed QR codes
- [ ] Validate all forms with various inputs
- [ ] Test error scenarios (no camera, network errors)
- [ ] Verify Arabic text displays correctly
- [ ] Check RTL layout on all pages
- [ ] Test with different browsers

**Code Quality:**
- [ ] Review all console warnings/errors
- [ ] Remove console.log statements
- [ ] Check for TODO comments
- [ ] Verify all TypeScript types are correct
- [ ] Run production build (`pnpm build`)
- [ ] Test production build locally

**Content:**
- [ ] Review all Arabic text for typos
- [ ] Verify church/festival logos display correctly
- [ ] Check all icon selections are appropriate
- [ ] Ensure color scheme consistency

**Data:**
- [ ] Replace mock data with real database
- [ ] Implement authentication system
- [ ] Set up backup strategy
- [ ] Configure environment variables
- [ ] Secure API keys

**Infrastructure:**
- [ ] Configure hosting (Vercel, Netlify, etc.)
- [ ] Set up custom domain
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure CDN for assets
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Analytics integration (optional)

**Documentation:**
- [ ] Update README.md with deployment instructions
- [ ] Document environment variables
- [ ] Create user guide for teachers
- [ ] Prepare training materials

---

## 📞 Support & Contact

**For Questions or Issues:**
1. Review this documentation file first
2. Check component source code
3. Search for similar issues in codebase

**Project Information:**
- **Last Updated:** May 2026
- **Version:** 1.0.0
- **Developer:** Claude Code Assistant
- **Church:** كنيسة الشهيد العظيم مارمينا العجايبي والقديس العظيم البابا كيرلس السادس - أسوان
- **Festival:** اريبصالين Summer Festival

---

## 🙏 Closing Note

This system was built to serve the Coptic Orthodox Church summer festival program. May it help organize and enhance the festival experience for all participants and servants.

**Arabic Blessing:**  
*ربنا يبارك خدمتكم ويثمر تعبكم* 🙏  
*(May the Lord bless your service and make your work fruitful)*

---

## 🆔 ID Card Component (NEW in v1.1.0)

### Quick Overview

A new **IDCard** component (`/src/app/components/IDCard.tsx`) has been added that generates professional, downloadable participant ID cards featuring:

- ✨ Dual logo display (church + festival)
- 🎨 Gender-based color theming (blue/pink/purple gradients)
- 📱 Integrated QR code for scanning
- 📥 Downloadable as high-resolution PNG (700x1100px)
- 🌐 Full RTL support for Arabic text
- 🎯 Professional church branding (burgundy-gold theme)

**Complete Documentation:** See [ID_CARD_DOCUMENTATION.md](/ID_CARD_DOCUMENTATION.md) for:
- Detailed component specifications
- Design breakdown and dimensions
- Image import strategy (critical fix for logo display)
- Download functionality implementation
- Troubleshooting guide
- Usage examples and code samples

### Recent Bug Fix (v1.1.0)

**Logo Display Issue - RESOLVED:**
- **Problem:** Church and festival logos not appearing in ID cards
- **Root Cause:** Dynamic URL construction instead of static ES imports
- **Solution:** Changed to direct ES module imports matching other components
- **Result:** ✅ Logos now display correctly in all environments

```typescript
// ✅ CORRECT (Now implemented)
import churchLogo from '../../imports/new-church-logo.png';
import festivalLogo from '../../imports/Arebsalin-1.png';
<img src={churchLogo} alt="Church Logo" />
```

---

## 📝 Version History
-
### v1.2.0 - Architecture & Student Portal Update (May 28, 2026)
- ✨ NEW: RoleSelectionPage and StudentPortalLogin (student portal)
- ✨ NEW: Centralized `src/types/index.ts` and `area` field added to participant types
- ♻️ REFACTOR: Reorganized `src/components` and `src/pages` layout; updated imports
- 🔧 FIX: Student ID normalization and profile fallback UI (fix blank-profile issue)
- 🧭 CHANGE: Auth gate adjusted to allow student profile access without servant auth

### v1.1.0 - ID Card Feature (May 24, 2026)
- ✨ NEW: IDCard component with professional design
- ✨ NEW: Downloadable ID cards (PNG export via html2canvas)
- ✨ NEW: Gender-based color theming
- 🐛 FIX: Logo display issues in ID card (static imports)
- 📚 NEW: Complete ID card documentation (ID_CARD_DOCUMENTATION.md)

### v1.0.0 - Initial Release (May 2026)
- ✅ Complete dashboard system
- ✅ QR scanning and generation
- ✅ Points management
- ✅ Attendance tracking
- ✅ Financial management
- ✅ Statistics and analytics
- ✅ Teachers management
- ✅ 35+ mock participants

---

## 📚 Documentation Files

This project includes multiple documentation files:

1. **DOCUMENTATION.md** (this file) - Main system documentation
2. **ID_CARD_DOCUMENTATION.md** - Complete IDCard component guide
3. **FEATURES.md** - Feature list and descriptions
4. **ATTRIBUTIONS.md** - Third-party licenses and credits

---

**End of Documentation**

**Last Updated:** May 30, 2026  
**Current Version:** 1.3.0  
**Church:** كنيسة الشهيد العظيم مارمينا العجايبي والقديس العظيم البابا كيرلس السادس - أسوان



# اريبصالين - نظام إدارة مهرجان الصيف

## الميزات المنفذة

### 1. تصميم الشعارات والهوية البصرية ✅
- إضافة شعار الكنيسة (مار مينا العجايبي)
- إضافة شعار المهرجان (اريبصالين)
- استخدام الألوان القبطية الأرثوذكسية:
  - اللون الأحمر الداكن (#8B1538)
  - اللون الذهبي (#C9A961)
  - خلفية دافئة (#FAF7F2)

### 2. نظام تسجيل الدخول والتسجيل للخدام ✅
تم إنشاء صفحات تسجيل الدخول والتسجيل للخدام مع الحقول التالية (من PDF):
- الإسم رباعي
- النوع (ذكر/أنثى)
- السنة الدراسية أو الوظيفة
- تاريخ الميلاد
- موبايل (رقمين)
- E-mail
- Facebook
- أب الإعتراف وكنيسته
- العنوان بالتفصيل (عمارة، شارع، دور، المنطقة، علامة مميزة)

### 3. تحديث حقل المرحلة الدراسية ✅
تم إضافة حقل "السنة الدراسية" المرتبط بالمرحلة:

1. **حضانة** → Baby Class, KG1, KG2
2. **ابتدائي** → الصف الأول إلى السادس الابتدائي
3. **إعدادي** → الصف الأول إلى الثالث الإعدادي
4. **ثانوي** → الصف الأول إلى الثالث الثانوي
5. **جامعي** → الفرقة الأولى إلى السابعة
6. **خريجين** → الوظيفة (مع حقل اختياري للمسمى الوظيفي)

### 4. حقول الدراسة/العمل ✅
تم إضافة حقول مرتبطة بالمرحلة الدراسية:
- **حضانة/ابتدائي/إعدادي/ثانوي** → المدرسة (إجباري)
- **جامعي** → الجامعة والكلية (إجباري)
- **خريجين** → مكان العمل (اختياري)

### 5. حقل تاريخ الميلاد ✅
- تم إضافة حقل تاريخ الميلاد في نموذج التسجيل
- يتم حساب العمر تلقائياً في صفحة الملف الشخصي

### 6. صفحة الملف الشخصي للمشارك ✅
صفحة شاملة تعرض:
- كود QR الخاص بالمشارك
- البيانات الشخصية الكاملة
- نسبة الحضور المئوية
- عدد أيام الحضور
- تواريخ أيام الحضور
- النقاط المتاحة
- جميع معلومات الاتصال والعنوان

### 7. تحديث قسم "مسح السوق" ✅
- يمكن الآن إدخال عدد النقاط المراد خصمها
- عرض الرصيد الحالي والرصيد بعد الخصم
- التحقق من عدم تجاوز الرصيد المتاح

### 8. قسم "إضافة نقاط" ✅
- زر جديد في الشاشة الرئيسية لإضافة النقاط
- مسح QR لإضافة النقاط للمشارك
- عرض الرصيد الحالي والرصيد الجديد بعد الإضافة

### 9. إدارة النقاط يدوياً ✅
- واجهة لإضافة أو خصم النقاط بدون مسح QR
- البحث عن المشاركين بالاسم أو الرقم
- اختيار نوع العملية (إضافة أو خصم)
- إدخال عدد النقاط المطلوب
- معاينة النتيجة قبل التأكيد

## المكونات الرئيسية

### صفحات المصادقة
- `LoginPage.tsx` - صفحة تسجيل الدخول
- `SignupPage.tsx` - صفحة التسجيل للخدام

### الشاشة الرئيسية
- `EnhancedDashboard.tsx` - لوحة التحكم مع جميع الإحصائيات والأزرار

### نماذج التسجيل
- `EnhancedRegistrationForm.tsx` - نموذج تسجيل المشاركين المحدث

### إدارة النقاط
- `MarketModal.tsx` - نافذة خصم النقاط من السوق
- `AddPointsModal.tsx` - نافذة إضافة النقاط
- `ManualPointsModal.tsx` - نافذة إدارة النقاط يدوياً

### الملفات الشخصية
- `StudentProfile.tsx` - صفحة الملف الشخصي للمشارك

### ماسح QR
- `QRScanner.tsx` - واجهة مسح QR مع دعم الفلاش

### مكونات إضافية
- `WelcomeScreen.tsx` - شاشة الترحيب
- `ParticipantsList.tsx` - قائمة المشاركين مع البحث
- `TestQRCode.tsx` - مولد QR للاختبار

## تدفق العمل

1. **تسجيل الدخول** → الخادم يسجل دخول بحسابه
2. **الشاشة الرئيسية** → عرض الإحصائيات والأزرار الرئيسية
3. **تسجيل مشارك جديد** → إدخال بيانات المشارك الكاملة
4. **تسجيل الحضور** → مسح QR + إضافة 10 نقاط تلقائياً
5. **مسح السوق** → مسح QR + خصم النقاط
6. **إضافة نقاط** → مسح QR + إضافة نقاط
7. **إدارة يدوية** → إضافة/خصم نقاط بدون مسح
8. **عرض الملف الشخصي** → الضغط على المشارك لعرض ملفه

## التقنيات المستخدمة

- React + TypeScript
- Tailwind CSS v4
- Html5-qrcode للمسح
- qrcode.react لتوليد الأكواد
- Sonner للإشعارات
- Lucide React للأيقونات
- خطوط Tajawal و Cairo للعربية

## الألوان والتصميم

```css
--primary: #8B1538 (أحمر داكن)
--secondary: #C9A961 (ذهبي)
--background: #FAF7F2 (بيج فاتح)
--foreground: #3D2817 (بني داكن)
```

## ملاحظات مهمة

- جميع النصوص بالعربية مع دعم RTL
- التصميم متجاوب ومحسّن للموبايل
- الشعارات متضمنة في الهيدر والصفحات
- نظام النقاط يعمل تلقائياً (10 نقاط للحضور)
- نسبة الحضور تحسب تلقائياً من أيام الحضور الفعلية



# ID Card Component - Complete Documentation

**Version:** 1.1.0  
**Date:** May 24, 2026  
**Component:** `/src/app/components/IDCard.tsx`

---

## 📋 Overview

The IDCard component is a new addition to the festival management system (v1.1.0) that generates professional, downloadable digital ID cards for participants. Each card features church branding, participant information, and an integrated QR code for quick scanning.

---

## 🎨 Component Specifications

### Props Interface

```typescript
interface IDCardProps {
  student: {
    id: string;              // Participant ID (e.g., 'P001')
    name: string;            // Full participant name
    data: {
      educationStage: string;      // Stage key (kg, primary, preparatory, etc.)
      educationYear: string;       // Year within stage
      gender: 'male' | 'female' | '';  // Gender for color theming
    };
  };
}
```

### Card Dimensions

- **Width:** 350px
- **Height:** 550px
- **Aspect Ratio:** ~2:3 (standard ID card proportions)
- **Background:** White (#ffffff)
- **Shadow:** shadow-2xl
- **Border Radius:** 16px (rounded-2xl)
- **Font Family:** 'Tajawal, Cairo, sans-serif'

---

## 🏗️ Card Structure

### 1. Header Section (140px height)

```typescript
<div className="h-[140px] relative" 
     style={{ background: 'linear-gradient(135deg, #8B1538 0%, #C9A961 100%)' }}>
```

**Features:**
- **Background:** Linear gradient (135°) from burgundy (#8B1538) to gold (#C9A961)
- **Church Logo:**
  - Position: Absolute top-3 right-3
  - Size: 56x56px (w-14 h-14)
  - File: `new-church-logo.png`
  - Import: `import churchLogo from '../../imports/new-church-logo.png';`
  
- **Festival Logo:**
  - Position: Absolute top-3, horizontally centered
  - Height: 56px, auto width
  - File: `Arebsalin-1.png`
  - Import: `import festivalLogo from '../../imports/Arebsalin-1.png';`

---

### 2. Profile Picture Section

```typescript
<div className="flex justify-center" style={{ marginTop: '-50px' }}>
  <div className="w-[120px] h-[120px] rounded-full" 
       style={{ border: '4px solid #ffffff', ...getGradientStyle(student.data.gender) }}>
    <span className="text-4xl font-bold text-white">
      {getInitials(student.name)}
    </span>
  </div>
</div>
```

**Gender-Based Gradients:**
```typescript
const getGradientStyle = (gender: string) => {
  if (gender === 'male') {
    return { background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }; // Blue
  } else if (gender === 'female') {
    return { background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)' }; // Pink
  }
  return { background: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)' }; // Purple
};
```

**ID Badge (below profile):**
- Position: Absolute, -bottom-2, horizontally centered
- Background: White with 2px burgundy border (20% opacity)
- Content: Participant ID in burgundy color
- Border-radius: Full (pill shape)

---

### 3. Student Information Section

**Name Display:**
```typescript
<h2 className="text-xl font-bold mb-1" style={{ color: '#8B1538' }} dir="rtl">
  {student.name}
</h2>
```

**Class Information Card:**
```typescript
<div className="rounded-lg px-4 py-3 mb-4"
     style={{
       backgroundColor: 'rgba(201, 169, 97, 0.1)',
       border: '1px solid rgba(201, 169, 97, 0.2)'
     }}>
  <div className="text-xs mb-1" style={{ color: '#6B5744' }}>
    المرحلة الدراسية
  </div>
  <div className="text-base font-medium" style={{ color: '#C9A961' }} dir="rtl">
    {educationStageLabels[student.data.educationStage]}
    {student.data.educationYear && ` - ${student.data.educationYear}`}
  </div>
</div>
```

---

### 4. QR Code Section

```typescript
<div className="flex justify-center mb-3">
  <div className="bg-white p-3 rounded-xl shadow-md"
       style={{ border: '2px solid rgba(139, 21, 56, 0.2)' }}>
    <QRCodeSVG
      value={student.id}
      size={140}
      level="H"              // High error correction (30% recovery)
      includeMargin={false}
    />
  </div>
</div>

<div className="text-xs" style={{ color: '#6B5744' }}>
  امسح الكود للحضور والنقاط
</div>
```

**QR Specifications:**
- Size: 140x140px
- Error Correction: Level H (30% recovery)
- Value: Participant ID only
- Border: 2px burgundy with 20% opacity
- Padding: 12px around QR code

---

### 5. Footer Decoration

```typescript
<div className="absolute bottom-0 left-0 right-0 h-2"
     style={{ 
       background: 'linear-gradient(90deg, #8B1538 0%, #C9A961 50%, #8B1538 100%)' 
     }}>
</div>
```

- Height: 8px
- Gradient: Horizontal - Burgundy → Gold → Burgundy

---

## 🔧 Helper Functions

### Get Initials

```typescript
const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0];
  }
  return name.substring(0, 2);
};
```

**Examples:**
- "محمد أحمد علي حسن" → "مأ"
- "يوسف" → "يو"

### Education Stage Labels

```typescript
const educationStageLabels: Record<string, string> = {
  'kg': 'حضانة',
  'primary': 'ابتدائي',
  'preparatory': 'إعدادي',
  'secondary': 'ثانوي',
  'university': 'جامعي',
  'graduate': 'خريجين'
};
```

---

## 💾 Download Functionality

### Implementation in StudentProfile

```typescript
import html2canvas from 'html2canvas';

const downloadIDCard = async () => {
  const idCardElement = document.getElementById('id-card');
  if (!idCardElement) return;

  try {
    const canvas = await html2canvas(idCardElement, {
      scale: 2,              // 2x resolution for print quality
      backgroundColor: null,
      logging: false,
      useCORS: true
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ID_Card_${student.name}_${student.id}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  } catch (error) {
    console.error('Failed to generate ID card:', error);
    toast.error('فشل تحميل البطاقة');
  }
};
```

**Download Features:**
- Format: PNG
- Resolution: 700x1100 pixels (2x scale)
- Filename: `ID_Card_{Name}_{ID}.png`
- Error handling with toast notification

---

## 🖼️ Image Import Strategy (CRITICAL)

### ✅ CORRECT Method

```typescript
// At top of file
import churchLogo from '../../imports/new-church-logo.png';
import festivalLogo from '../../imports/Arebsalin-1.png';

// In JSX
<img src={churchLogo} alt="Church Logo" className="..." />
<img src={festivalLogo} alt="Festival Logo" className="..." />
```

### ❌ INCORRECT Methods (Avoid)

```typescript
// ❌ Dynamic URL construction
const logoPath = new URL('../../imports/new-church-logo.png', import.meta.url).href;

// ❌ String path
<img src="../../imports/new-church-logo.png" alt="Logo" />

// ❌ ?url suffix
import logo from '../../imports/new-church-logo.png?url';

// ❌ require() syntax
const logo = require('../../imports/new-church-logo.png');
```

### Why Direct Import Works

- ✅ Vite processes import at build time
- ✅ Image is hashed and copied to dist folder
- ✅ Resolves to correct production path
- ✅ Works in dev and production
- ✅ Consistent with other components
- ✅ Type-safe with TypeScript

---

## 🎨 Color Scheme

| Element | Color | Usage |
|---------|-------|-------|
| Burgundy | #8B1538 | Headers, text, borders |
| Gold | #C9A961 | Accents, class info |
| Blue | #3B82F6 → #2563EB | Male gradient |
| Pink | #EC4899 → #DB2777 | Female gradient |
| Purple | #A855F7 → #9333EA | Default gradient |
| Muted Brown | #6B5744 | Labels, captions |
| White | #FFFFFF | Background, borders |

---

## 📱 Usage Examples

### In StudentProfile

```typescript
import { IDCard } from './IDCard';

<div className="mb-6">
  <IDCard student={participant} />
</div>

<button onClick={downloadIDCard} className="...">
  <Download className="w-5 h-5" />
  تحميل البطاقة
</button>
```

### Standalone

```typescript
<IDCard
  student={{
    id: 'P001',
    name: 'محمد أحمد علي حسن',
    data: {
      educationStage: 'primary',
      educationYear: 'الصف الرابع الابتدائي',
      gender: 'male'
    }
  }}
/>
```

---

## 🐛 Bug Fix History

### v1.1.0 - Logo Display Fix

**Problem:**
- Church and festival logos not displaying
- Error: `Failed to load: /src/imports/new-church-logo.png`

**Root Cause:**
- Used dynamic URL construction with `new URL()`
- Vite couldn't process dynamic imports

**Solution:**
```typescript
// Changed from dynamic URL to static import
import churchLogo from '../../imports/new-church-logo.png';
import festivalLogo from '../../imports/Arebsalin-1.png';
```

**Result:**
- ✅ Logos display correctly
- ✅ Consistent with other components
- ✅ Works in dev and production

---

## 🔍 Troubleshooting

### Logos Not Displaying

**Check:**
1. Images exist in `/src/imports/`
2. Using correct import syntax (static, not dynamic)
3. No typos in filenames
4. Correct relative path from component

**Solution:**
```typescript
import logo from '../../imports/logo.png';
<img src={logo} alt="Logo" />
```

---

### Low-Quality Download

**Problem:** Blurry or pixelated downloaded image

**Solution:**
```typescript
await html2canvas(element, { 
  scale: 2,  // For digital use
  scale: 3   // For printing
});
```

---

### Arabic Text Wrong Direction

**Problem:** Text displays left-to-right

**Solution:**
```typescript
<div dir="rtl">{arabicText}</div>
```

---

### QR Code Not Scanning

**Check:**
1. QR size at least 140px
2. Error correction level 'H'
3. Valid participant ID
4. Good lighting conditions
5. Download scale at least 2x

**Solution:**
```typescript
<QRCodeSVG
  value={student.id}
  size={140}
  level="H"
/>
```

---

## ♿ Accessibility Features

- Semantic HTML (proper heading hierarchy)
- Meaningful alt text for logos
- RTL support with `dir="rtl"`
- High color contrast (WCAG AA/AAA)
- Print-friendly design
- Clear, legible typography

---

## ⚡ Performance

- Instant render (no async operations)
- Fast QR generation (<10ms)
- Optimized image imports
- Minimal re-renders
- Efficient download process
- Memory cleanup with URL.revokeObjectURL()

---

## 🚀 Future Enhancements

### Planned Features

1. **Photo Upload**
   - Replace initials with actual photo
   - Camera capture or file upload
   - Image cropping

2. **Customizable Themes**
   - Different colors per education stage
   - Light/dark mode
   - Special event themes

3. **Batch Operations**
   - Download all cards as ZIP
   - Print-optimized PDF
   - Multiple cards per page

4. **Advanced QR**
   - Encrypted QR codes
   - Time-limited codes
   - Multi-data encoding

---

## 📚 Dependencies

```json
{
  "qrcode.react": "latest",
  "html2canvas": "^1.4.1",
  "lucide-react": "latest"
}
```

---

## 📞 Support

For questions or issues:
1. Review this documentation
2. Check component source code (`/src/app/components/IDCard.tsx`)
3. Verify image imports and paths
4. Test download functionality
5. Check console for errors

---

**Last Updated:** May 24, 2026  
**Version:** 1.1.0  
**Component File:** `/src/app/components/IDCard.tsx`  
**Church:** St. Mina and Pope Kyrillos VI - Aswan



# Documentation Overview - Festival Management System

**Version:** 1.1.0  
**Last Updated:** May 24, 2026

Welcome to the documentation for the اريبصالين (Arribsalin) Summer Festival Management System!

---

## 📚 All Documentation Files

### 1. 📖 [DOCUMENTATION.md](DOCUMENTATION.md)
**Main Technical Documentation** (3000+ lines)

The complete system documentation covering everything from architecture to implementation details.

**Includes:**
- Project overview and structure
- All components detailed breakdown
- Data models and interfaces
- Color system and design guidelines
- Libraries and dependencies
- RTL support and Arabic typography
- Responsive design patterns
- Mock data structure
- Security considerations

**Best for:**
- Understanding the entire system
- Learning component architecture
- Reference for data structures
- Design system guidelines

---

### 2. 🆔 [ID_CARD_DOCUMENTATION.md](ID_CARD_DOCUMENTATION.md)
**ID Card Component Guide** (NEW in v1.1.0)

Complete documentation for the new ID card feature with professional participant cards.

**Includes:**
- Component specifications and props
- Design breakdown with exact dimensions
- Gender-based color theming
- Helper functions explained
- Download functionality with html2canvas
- **Image import strategy** (CRITICAL for developers)
- QR code configuration
- Troubleshooting specific to ID cards
- Usage examples and code samples

**Best for:**
- Using or customizing ID cards
- Understanding logo import fix
- Implementing download feature
- Debugging ID card issues

---

### 3. 🎉 [RECENT_UPDATES.md](RECENT_UPDATES.md)
**What's New - Latest Changes**

Quick reference for the most recent update (v1.1.0).

**Includes:**
- What's new in v1.1.0 summary
- Critical bug fix explanation (logo display)
- New documentation added
- Developer migration notes
- Quick start guide for new features
- User guide for downloading ID cards

**Best for:**
- Quick overview of latest changes
- Understanding the logo fix
- Getting started with ID cards
- Seeing what's coming next

---

### 4. 📝 [CHANGELOG.md](CHANGELOG.md)
**Version History**

Detailed changelog following [Keep a Changelog](https://keepachangelog.com/) format.

**Includes:**
- v1.1.0 release notes (ID card feature)
- v1.0.0 initial release recap
- Added/Changed/Fixed categories
- Future roadmap (v1.2.0, v2.0.0, etc.)
- Versioning scheme explanation

**Best for:**
- Tracking all changes over time
- Understanding version differences
- Planning upgrades
- Seeing future features

---

### 5. 🔧 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
**Common Issues & Solutions**

Comprehensive troubleshooting guide for 10+ common issues.

**Includes:**
- Logo display issues (with solutions)
- ID card download problems
- QR code scanning issues
- Arabic text direction problems
- Low quality downloads
- Camera permission errors
- Points not updating
- Build errors
- Performance issues
- Toast notifications not showing

**Best for:**
- Fixing bugs and errors
- Debugging specific issues
- Step-by-step solutions
- General debugging tips

---

### 6. ✨ [FEATURES.md](FEATURES.md)
**Feature Descriptions**

High-level overview of all system features.

**Includes:**
- Dashboard features
- QR code system
- Points management
- Attendance tracking
- Financial management
- Statistics and analytics
- Teachers management
- Student registration

**Best for:**
- Understanding what the system can do
- Feature overview for stakeholders
- Quick reference

---

### 7. 📄 [ATTRIBUTIONS.md](ATTRIBUTIONS.md)
**Third-Party Licenses and Credits**

Attribution for libraries, fonts, and resources used.

**Includes:**
- Library licenses (React, Tailwind, etc.)
- Font attributions (Tajawal, Cairo)
- Icon licenses (Lucide)
- Chart library credits (Recharts)
- QR code library credits

**Best for:**
- Legal compliance
- Understanding dependencies
- Credit attribution

---

## 🚀 Quick Start by Role

### For Church Staff / Users

**Want to use ID cards?**
1. Start with [RECENT_UPDATES.md](RECENT_UPDATES.md) - "For Users" section
2. Learn how to download cards
3. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) if issues arise

**Want to understand the system?**
1. Read [FEATURES.md](FEATURES.md) for overview
2. Check [DOCUMENTATION.md](DOCUMENTATION.md) "User Flow Scenarios"
3. Explore the application hands-on

---

### For Developers

**New to the codebase?**
1. Read [RECENT_UPDATES.md](RECENT_UPDATES.md) first
2. Review [DOCUMENTATION.md](DOCUMENTATION.md) for architecture
3. Study component structure in `/src/app/components/`

**Working on ID cards?**
1. **Must read:** [ID_CARD_DOCUMENTATION.md](ID_CARD_DOCUMENTATION.md)
2. Pay special attention to "Image Import Strategy"
3. Reference [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues

**Fixing bugs?**
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) first
2. Review [CHANGELOG.md](CHANGELOG.md) for known issues
3. Search [DOCUMENTATION.md](DOCUMENTATION.md) for technical details

**Planning features?**
1. See [CHANGELOG.md](CHANGELOG.md) - "Unreleased" section
2. Review [DOCUMENTATION.md](DOCUMENTATION.md) - "Future Enhancements"
3. Check existing components for patterns

---

### For Project Managers

**Understanding progress?**
1. [CHANGELOG.md](CHANGELOG.md) - Version history
2. [FEATURES.md](FEATURES.md) - What's implemented
3. [RECENT_UPDATES.md](RECENT_UPDATES.md) - Latest changes

**Planning next steps?**
1. [CHANGELOG.md](CHANGELOG.md) - "Unreleased" section
2. [DOCUMENTATION.md](DOCUMENTATION.md) - "Future Roadmap"

**Reporting to stakeholders?**
1. [FEATURES.md](FEATURES.md) - Feature list
2. [RECENT_UPDATES.md](RECENT_UPDATES.md) - Latest achievements

---

## 🔍 Find What You Need

### Common Questions

| Question | Where to Look |
|----------|---------------|
| How do I download ID cards? | [RECENT_UPDATES.md](RECENT_UPDATES.md) - "For Users" |
| Why aren't logos showing? | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Issue #1 |
| What's new in v1.1.0? | [RECENT_UPDATES.md](RECENT_UPDATES.md) or [CHANGELOG.md](CHANGELOG.md) |
| How does the QR system work? | [DOCUMENTATION.md](DOCUMENTATION.md) - "QR Code System" |
| What are the color codes? | [DOCUMENTATION.md](DOCUMENTATION.md) - "Color System" |
| How to import images correctly? | [ID_CARD_DOCUMENTATION.md](ID_CARD_DOCUMENTATION.md) - "Image Import Strategy" |
| What's coming in v2.0? | [CHANGELOG.md](CHANGELOG.md) - "Unreleased" section |
| How to fix build errors? | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Issue #8 |
| What libraries are used? | [DOCUMENTATION.md](DOCUMENTATION.md) - "Libraries & Dependencies" |
| How to register students? | [DOCUMENTATION.md](DOCUMENTATION.md) - "EnhancedRegistrationForm" |

---

## 📊 Documentation Statistics

- **Total Documentation:** 7 files
- **Total Lines:** 10,000+ lines
- **Main Documentation:** 3,100+ lines
- **ID Card Guide:** 750+ lines
- **Troubleshooting:** 650+ lines
- **Changelog:** 550+ lines
- **Components Documented:** 15+
- **Issues Covered:** 10+
- **Code Examples:** 100+

---

## 🎯 Key Highlights

### New in v1.1.0 (May 24, 2026)

✨ **ID Card Feature**
- Professional participant ID cards
- Downloadable as PNG (700x1100px)
- Gender-based color themes
- Integrated QR codes

🐛 **Critical Bug Fix**
- Fixed logo display issue
- Improved image import strategy
- Better Vite asset handling

📚 **Documentation Expansion**
- 4 new documentation files
- Comprehensive troubleshooting guide
- Complete ID card specifications
- Version history tracking

---

## 💡 Documentation Best Practices

### For Reading
1. Start with the relevant file from the index above
2. Use Ctrl+F to search within files
3. Follow cross-references between documents
4. Check code examples for practical understanding

### For Contributing
1. Follow existing documentation style
2. Update version numbers when changing
3. Add new issues to TROUBLESHOOTING.md
4. Update CHANGELOG.md for all changes
5. Keep code examples up-to-date

### For Maintaining
- Update "Last Updated" dates when editing
- Increment version numbers appropriately
- Keep cross-references working
- Add new features to relevant documents

---

## 📞 Support Resources

### Technical Support
- **Documentation:** This directory
- **Source Code:** `/src/app/components/`
- **Issue Tracking:** TROUBLESHOOTING.md

### Project Information
- **Church:** St. Mina and Pope Kyrillos VI - Aswan
- **Festival:** اريبصالين Summer Deacon School
- **Version:** 1.1.0
- **Status:** Active Development

---

## 🔗 External Resources

### Libraries Documentation
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Vite](https://vitejs.dev/guide/)
- [Recharts](https://recharts.org/)
- [html5-qrcode](https://github.com/mebjas/html5-qrcode)
- [qrcode.react](https://github.com/zpao/qrcode.react)
- [html2canvas](https://html2canvas.hertzen.com/)

### Design Resources
- [Arabic Typography](https://arabictypography.com)
- [RTL Styling](https://rtlstyling.com)
- [Tajawal Font](https://fonts.google.com/specimen/Tajawal)
- [Cairo Font](https://fonts.google.com/specimen/Cairo)

---

## ✅ Documentation Checklist

Use this when reviewing or creating documentation:

- [ ] File listed in this README_DOCS.md
- [ ] Version number updated
- [ ] Last updated date current
- [ ] Cross-references working
- [ ] Code examples tested
- [ ] Screenshots included (if applicable)
- [ ] Troubleshooting section (if relevant)
- [ ] Arabic translations verified (if applicable)
- [ ] Follows existing format
- [ ] Table of contents (for long docs)

---

**Navigation Tip:** Use your editor's search function (Ctrl+F / Cmd+F) to quickly find topics across all documentation files.

---

**Last Updated:** May 24, 2026  
**Documentation Version:** 1.1.0  
**Total Files:** 7 documentation files  
**Maintained By:** Festival Development Team



# Recent Updates - Festival Management System

**Version:** 1.1.0  
**Release Date:** May 24, 2026  
**Update Type:** Feature Release + Critical Bug Fix

---

## 🎉 What's New in v1.1.0

### ✨ Major New Feature: ID Card Component

We've added a professional ID card generation system that creates downloadable, branded participant cards!

**Key Features:**
- 🎨 Beautiful design with church branding (burgundy-gold theme)
- 👤 Profile circle with gender-based color theming
- 📸 Participant initials display
- 📱 Integrated scannable QR code
- 📥 Downloadable as high-resolution PNG
- 🌐 Full Arabic RTL support
- 🏫 Education stage and year display

**Where to Find It:**
- Component: `/src/app/components/IDCard.tsx`
- Usage: Participant profile pages
- Documentation: [ID_CARD_DOCUMENTATION.md](ID_CARD_DOCUMENTATION.md)

**How to Use:**
1. Navigate to any participant's profile
2. Scroll to the ID card section
3. Click "تحميل البطاقة" (Download Card) button
4. Save the PNG file (700x1100px resolution)

---

## 🐛 Critical Bug Fix: Logo Display

### The Problem

Church and festival logos were not appearing on ID cards, showing this error:
```
❌ Festival logo failed to load: /src/imports/Arebsalin-1.png
❌ Church logo failed to load: /src/imports/new-church-logo.png
```

### The Solution

Changed image import strategy from dynamic URLs to static ES module imports:

**Before (Broken):**
```typescript
const churchLogoPath = new URL('../../imports/new-church-logo.png', import.meta.url).href;
const festivalLogoPath = new URL('../../imports/Arebsalin-1.png', import.meta.url).href;
<img src={churchLogoPath} alt="Church Logo" />
```

**After (Fixed):**
```typescript
import churchLogo from '../../imports/new-church-logo.png';
import festivalLogo from '../../imports/Arebsalin-1.png';
<img src={churchLogo} alt="Church Logo" />
<img src={festivalLogo} alt="Festival Logo" />
```

### Why This Matters

- ✅ Logos now display correctly in all environments
- ✅ Consistent with other components (EnhancedDashboard, LoginPage)
- ✅ Properly processed by Vite build system
- ✅ Works in both development and production
- ✅ No more broken image placeholders

---

## 📚 New Documentation

We've added comprehensive documentation for the ID card feature:

### 1. ID_CARD_DOCUMENTATION.md
Complete technical documentation including:
- Component specifications and props
- Design breakdown with exact dimensions
- Color schemes and theming
- Helper functions explained
- Download functionality implementation
- **Image import strategy** (critical for developers)
- Troubleshooting guide
- Usage examples

### 2. CHANGELOG.md
Detailed version history tracking:
- v1.1.0 changes (this release)
- v1.0.0 initial release recap
- Future planned features
- Versioning scheme explanation

### 3. RECENT_UPDATES.md
This file! Quick reference for:
- What's new
- Bug fixes
- Migration notes
- Quick start guide

### 4. Updated DOCUMENTATION.md
Main documentation updated with:
- ID card overview section
- Version history
- Reference to new documentation files

---

## 🔧 For Developers

### Files Modified
- `/src/app/components/IDCard.tsx` - Logo import fix

### Files Added
- `/ID_CARD_DOCUMENTATION.md` - Component documentation
- `/CHANGELOG.md` - Version history
- `/RECENT_UPDATES.md` - This file

### No Breaking Changes
- All existing functionality remains unchanged
- No API changes
- Backward compatible with v1.0.0 data

### Dependencies
No new dependencies added. The feature uses:
- `qrcode.react` (already installed)
- `html2canvas` (already installed)
- `lucide-react` (already installed)

### Testing Checklist
If you're working on this project, verify:
- [ ] Logos display on ID cards
- [ ] ID card download works
- [ ] QR code is scannable
- [ ] Arabic text displays RTL
- [ ] Gender colors apply correctly
- [ ] Download filename is correct

---

## 🚀 Quick Start Guide

### For Users

**Download a Participant ID Card:**
1. Login to the system
2. Click on any participant in the dashboard list
3. Scroll down to see the ID card preview
4. Click the "تحميل البطاقة" button
5. Save the PNG file to your device

**What You'll Get:**
- High-quality PNG image (700x1100 pixels)
- Filename: `ID_Card_{ParticipantName}_{ID}.png`
- Professional design with church logos
- Scannable QR code
- Ready to print or share digitally

### For Developers

**Use the IDCard Component:**

```typescript
import { IDCard } from './components/IDCard';

// In your component
<IDCard
  student={{
    id: 'P001',
    name: 'محمد أحمد علي حسن',
    data: {
      educationStage: 'primary',
      educationYear: 'الصف الرابع الابتدائي',
      gender: 'male'
    }
  }}
/>
```

**Import Images Correctly:**

```typescript
// ✅ ALWAYS use this pattern for images
import logo from '../../imports/logo.png';
<img src={logo} alt="Logo" />

// ❌ NEVER use dynamic URLs
const logo = new URL('path/to/image', import.meta.url).href;
```

---

## 💡 Tips & Best Practices

### For Using ID Cards

1. **Print Quality:**
   - Use the downloaded PNG (700x1100px)
   - Print at actual size for best QR scanning
   - Use color printer to preserve branding

2. **Digital Use:**
   - Share via WhatsApp, email, or messaging apps
   - Display on mobile devices for scanning
   - Store in participant records

3. **QR Scanning:**
   - Ensure good lighting when scanning
   - Hold steady at arm's length
   - QR code has 30% error correction (works even if partially damaged)

### For Developers

1. **Image Imports:**
   - Always use static imports, never dynamic URLs
   - Check other components for reference patterns
   - Test in both dev and production builds

2. **Component Usage:**
   - ID card requires `id="id-card"` for download functionality
   - Ensure student object has all required fields
   - Handle missing gender gracefully (defaults to purple)

3. **Customization:**
   - Modify colors in `getGradientStyle()` function
   - Adjust card dimensions in className
   - Update education stage labels as needed

---

## 📊 Impact Summary

### User Impact
- ✅ New feature: Professional ID card generation
- ✅ Better participant identification
- ✅ Downloadable cards for printing or digital use
- ✅ Improved visual branding

### Developer Impact
- ✅ Bug fix: Logo display issue resolved
- ✅ New component: IDCard.tsx
- ✅ Improved documentation (4 new/updated files)
- ✅ Consistent image import pattern established

### System Impact
- ✅ No breaking changes
- ✅ No new dependencies
- ✅ Backward compatible
- ✅ Performance: Instant render, fast download

---

## 🔮 What's Next?

### Coming in v1.2.0
- Photo upload support for ID cards
- Replace initials with actual participant photos
- Camera capture integration
- Image cropping tool

### Coming in v2.0.0
- Backend integration (Supabase/Firebase)
- Real-time data synchronization
- Persistent storage
- Real authentication system

### Coming Later
- Batch ID card generation
- Print-optimized PDF export
- Email/SMS notifications
- Progressive Web App (PWA)

---

## 📞 Support & Feedback

### Questions?
- Check [DOCUMENTATION.md](DOCUMENTATION.md) for general system info
- Check [ID_CARD_DOCUMENTATION.md](ID_CARD_DOCUMENTATION.md) for ID card details
- Review component source code in `/src/app/components/`

### Found a Bug?
1. Check the troubleshooting section in ID_CARD_DOCUMENTATION.md
2. Verify image import patterns
3. Check console for error messages
4. Review this file for known issues

### Want to Contribute?
- Follow existing code patterns
- Maintain RTL support for Arabic
- Update documentation for new features
- Test on mobile devices

---

## 📝 Summary

**What Changed:**
- ✨ Added ID card component with download feature
- 🐛 Fixed logo display bug (critical)
- 📚 Added comprehensive documentation
- 📖 Created version history tracking

**What Stayed the Same:**
- All existing features work as before
- No changes to data models
- No dependency updates
- Same color scheme and branding

**Upgrade Notes:**
- No migration needed
- No breaking changes
- Safe to update from v1.0.0

---

**Release Date:** May 24, 2026  
**Version:** 1.1.0  
**Type:** Feature Release + Bug Fix  
**Status:** Stable  
**Compatibility:** Fully compatible with v1.0.0

---

*For complete technical details, see [CHANGELOG.md](CHANGELOG.md)*  
*For ID card specifics, see [ID_CARD_DOCUMENTATION.md](ID_CARD_DOCUMENTATION.md)*  
*For system overview, see [DOCUMENTATION.md](DOCUMENTATION.md)*



# Troubleshooting Guide - Festival Management System

**Version:** 1.1.0  
**Last Updated:** May 24, 2026

---

## 🔍 Common Issues & Solutions

### 1. Logos Not Displaying on ID Cards

#### Symptoms
- Church logo (`new-church-logo.png`) not visible on ID card
- Festival logo (`Arebsalin-1.png`) not visible on ID card
- Broken image icon appears where logos should be
- Console error: `Failed to load: /src/imports/...`

#### Root Cause
Using dynamic URL construction instead of static ES module imports.

#### ✅ Solution

**Use static ES module imports:**

```typescript
// ✅ CORRECT - Do this
import churchLogo from '../../imports/new-church-logo.png';
import festivalLogo from '../../imports/Arebsalin-1.png';

<img src={churchLogo} alt="Church Logo" className="..." />
<img src={festivalLogo} alt="Festival Logo" className="..." />
```

**Avoid these patterns:**

```typescript
// ❌ WRONG - Don't do this
const logoPath = new URL('../../imports/new-church-logo.png', import.meta.url).href;

// ❌ WRONG - Don't do this
<img src="../../imports/new-church-logo.png" alt="Logo" />

// ❌ WRONG - Don't do this
import logo from '../../imports/new-church-logo.png?url';

// ❌ WRONG - Don't do this (not ES modules)
const logo = require('../../imports/new-church-logo.png');
```

#### Why This Works
- Vite processes static imports at build time
- Images are hashed and copied to dist folder
- Import resolves to correct production path
- Works in both development and production

#### Verification Steps
1. Check that images exist in `/src/imports/` directory
2. Verify import statement is at top of file (not inside function)
3. Ensure no typos in filename (case-sensitive)
4. Test in both dev (`pnpm dev`) and production (`pnpm build`)

---

### 2. ID Card Download Not Working

#### Symptoms
- Click "تحميل البطاقة" button but nothing happens
- Console error about `getElementById`
- Download starts but file is empty or corrupt
- Browser shows "Failed - Network error"

#### Possible Causes & Solutions

**A. Missing ID Attribute**

```typescript
// ❌ WRONG
<div className="...">  {/* No id attribute */}
  <IDCard student={participant} />
</div>

// ✅ CORRECT
<div id="id-card" className="...">  {/* id="id-card" required */}
  <IDCard student={participant} />
</div>
```

**B. html2canvas Not Installed**

```bash
# Check if installed
pnpm list html2canvas

# If not installed
pnpm add html2canvas
```

**C. CORS Issues with Images**

```typescript
// Ensure useCORS is true
await html2canvas(element, {
  scale: 2,
  useCORS: true,  // ← Important for cross-origin images
  backgroundColor: null
});
```

**D. Browser Blocking Downloads**

- Check browser's download settings
- Ensure pop-ups are allowed for the site
- Try a different browser (Chrome, Firefox, Edge)

---

### 3. QR Code Not Scanning

#### Symptoms
- QR scanner app can't read the code
- Code scans but shows wrong ID
- Works sometimes but not consistently
- Scanner shows "Invalid QR code"

#### Solutions

**A. Increase QR Size**

```typescript
// ❌ Too small (hard to scan)
<QRCodeSVG size={80} />

// ✅ Optimal size
<QRCodeSVG size={140} />

// ✅ Even better for printing
<QRCodeSVG size={200} />
```

**B. Use Higher Error Correction**

```typescript
// ❌ Low error correction
<QRCodeSVG level="L" />  // Only 7% recovery

// ✅ High error correction
<QRCodeSVG level="H" />  // 30% recovery - recommended
```

**C. Verify Participant ID**

```typescript
// ✅ CORRECT - Valid string ID
<QRCodeSVG value="P001" />
<QRCodeSVG value={student.id} />

// ❌ WRONG - Empty or undefined
<QRCodeSVG value="" />
<QRCodeSVG value={undefined} />
```

**D. Improve Download Resolution**

```typescript
// ❌ Low resolution (pixelated QR)
await html2canvas(element, { scale: 1 });

// ✅ Good resolution
await html2canvas(element, { scale: 2 });

// ✅ Best for printing
await html2canvas(element, { scale: 3 });
```

**E. Check Scanning Conditions**

- ✅ Good lighting (not too bright, not too dark)
- ✅ Steady hands (avoid motion blur)
- ✅ Clean screen/print (no smudges or fingerprints)
- ✅ Proper distance (6-12 inches / 15-30 cm)
- ✅ Flat surface (not curved or wrinkled)

---

### 4. Arabic Text Displaying Incorrectly

#### Symptoms
- Text appears left-to-right instead of right-to-left
- Text aligned to wrong side
- Numbers mixed with Arabic text incorrectly
- Characters disconnected or backwards

#### Solutions

**A. Add RTL Direction**

```typescript
// ❌ Missing RTL direction
<div>{arabicText}</div>

// ✅ With RTL direction
<div dir="rtl">{arabicText}</div>

// ✅ For headings
<h2 dir="rtl" className="...">{student.name}</h2>
```

**B. Check Global RTL Setting**

```css
/* In theme.css or globals.css */
html {
  direction: rtl;  /* ← Should be set globally */
}
```

**C. Verify Font Support**

```css
/* Ensure Arabic fonts are loaded */
font-family: 'Tajawal', 'Cairo', sans-serif;
```

**D. Check Text Alignment**

```typescript
// For RTL text, use appropriate alignment
<div className="text-right" dir="rtl">  {/* Right align for RTL */}
  {arabicText}
</div>
```

---

### 5. Low Quality Downloaded Images

#### Symptoms
- Downloaded ID card is blurry
- Text is hard to read
- QR code is pixelated
- Image looks low resolution

#### Solutions

**A. Increase Scale Factor**

```typescript
// ❌ Low quality (350x550px)
await html2canvas(element, { scale: 1 });

// ✅ Good quality (700x1100px)
await html2canvas(element, { scale: 2 });

// ✅ Best quality (1050x1650px)
await html2canvas(element, { scale: 3 });

// ⚠️ Very high (may cause memory issues on mobile)
await html2canvas(element, { scale: 4 });
```

**B. Check Image Format**

```typescript
// ✅ PNG for quality (recommended)
canvas.toBlob((blob) => {
  // ...save blob
}, 'image/png');

// ⚠️ JPEG has lower quality but smaller file
canvas.toBlob((blob) => {
  // ...save blob
}, 'image/jpeg', 0.95);  // 95% quality
```

**C. Verify Canvas Settings**

```typescript
await html2canvas(element, {
  scale: 2,
  backgroundColor: '#ffffff',  // White background
  logging: false,
  useCORS: true,
  allowTaint: false,
  removeContainer: true,
  imageTimeout: 0  // No timeout for image loading
});
```

---

### 6. Camera Permission Denied

#### Symptoms
- QR scanner shows "Camera access denied"
- Blank screen when opening scanner
- Browser doesn't ask for permission
- Console error about getUserMedia

#### Solutions

**A. Check Browser Permissions**

**Chrome:**
1. Click padlock icon in address bar
2. Click "Site settings"
3. Find "Camera" permission
4. Select "Allow"

**Firefox:**
1. Click shield/lock icon in address bar
2. Click arrow next to "Blocked" or "Allowed"
3. Find "Camera" permission
4. Select "Allow"

**Safari:**
1. Safari > Preferences > Websites
2. Select "Camera" from left sidebar
3. Find your site and select "Allow"

**B. Use HTTPS**

```
// ❌ Camera may not work on HTTP
http://localhost:5173

// ✅ Camera works on HTTPS or localhost
https://yourdomain.com
http://localhost:5173  // Exception for localhost
```

**C. Use Image Upload Fallback**

The QRScanner component includes a fallback:

```typescript
{/* When camera is denied */}
<input
  type="file"
  accept="image/*"
  onChange={handleImageUpload}
/>
```

Users can upload a screenshot of the QR code instead.

---

### 7. Points Not Updating

#### Symptoms
- Scan QR code but points don't change
- Manual points entry doesn't save
- Points show old value after update
- Attendance registered but no +10 points

#### Solutions

**A. Check State Update**

```typescript
// ❌ Direct mutation (won't trigger re-render)
participant.points += 10;

// ✅ Proper state update
setParticipants(prev => prev.map(p =>
  p.id === participantId
    ? { ...p, points: p.points + 10 }
    : p
));
```

**B. Verify Attendance Logic**

```typescript
// Check if already attended today
const today = new Date().toISOString().split('T')[0];
const alreadyAttended = participant.attendanceDays.includes(today);

if (!alreadyAttended) {
  // Add points and record attendance
}
```

**C. Check Points Validation**

```typescript
// Ensure points is a valid number
const pointsToAdd = parseInt(inputValue);
if (isNaN(pointsToAdd) || pointsToAdd <= 0) {
  toast.error('أدخل قيمة صحيحة');  // Invalid value
  return;
}
```

---

### 8. Build Errors

#### Symptoms
- `pnpm build` fails
- TypeScript errors during build
- Vite build errors
- Module not found errors

#### Solutions

**A. Clear Cache and Reinstall**

```bash
# Remove node_modules and cache
rm -rf node_modules pnpm-lock.yaml

# Reinstall dependencies
pnpm install

# Try build again
pnpm build
```

**B. Check TypeScript Errors**

```bash
# Run TypeScript check
pnpm tsc --noEmit

# Fix any type errors shown
```

**C. Verify Imports**

```typescript
// ✅ CORRECT - Named exports
import { IDCard } from './components/IDCard';
import { toast } from 'sonner';

// ❌ WRONG - Default import for named export
import IDCard from './components/IDCard';
```

**D. Check Asset Paths**

```typescript
// ✅ Relative paths from component location
import logo from '../../imports/logo.png';

// ❌ Absolute paths (don't work in production)
import logo from '/src/imports/logo.png';
```

---

### 9. Performance Issues

#### Symptoms
- App is slow or laggy
- Scrolling is not smooth
- Scanner takes long to start
- Download takes forever

#### Solutions

**A. Optimize Re-renders**

```typescript
// Use memo for expensive components
const IDCard = React.memo(({ student }) => {
  // component code
});

// Use callback for event handlers
const handleDownload = useCallback(() => {
  // download logic
}, [dependencies]);
```

**B. Optimize Images**

```bash
# Compress images before adding to /src/imports/
# Use tools like TinyPNG, ImageOptim, etc.
```

**C. Code Splitting**

```typescript
// Lazy load heavy components
const StatisticsPage = lazy(() => import('./components/StatisticsPage'));

// Use Suspense
<Suspense fallback={<div>Loading...</div>}>
  <StatisticsPage />
</Suspense>
```

**D. Reduce Download Scale**

```typescript
// For mobile devices, use scale: 2 instead of 3
const isMobile = window.innerWidth < 768;
await html2canvas(element, { 
  scale: isMobile ? 2 : 3 
});
```

---

### 10. Toast Notifications Not Showing

#### Symptoms
- Success/error messages don't appear
- Toast shows but disappears immediately
- Toast appears in wrong position
- Toast text is not Arabic

#### Solutions

**A. Verify Toaster Component**

```typescript
// Must be included in App.tsx or root component
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster 
        position="top-center"
        dir="rtl"  // ← Important for Arabic
        toastOptions={{
          style: {
            fontFamily: 'Tajawal, Cairo, sans-serif'
          }
        }}
      />
      {/* Rest of app */}
    </>
  );
}
```

**B. Check Toast Calls**

```typescript
// ✅ CORRECT
import { toast } from 'sonner';

toast.success('تم بنجاح');  // Success
toast.error('حدث خطأ');      // Error
toast.info('معلومة');        // Info

// ❌ WRONG - Wrong import
import toast from 'sonner';  // Should be named import
```

**C. Adjust Duration**

```typescript
// Show toast for longer
toast.success('تم الحفظ', {
  duration: 5000  // 5 seconds instead of default 3
});

// Keep visible until dismissed
toast.success('تم الحفظ', {
  duration: Infinity
});
```

---

## 🔧 General Debugging Tips

### Check Console

Always check browser console (F12) for errors:
- Red errors indicate critical issues
- Yellow warnings indicate potential problems
- Blue info messages are usually safe

### Verify Environment

```bash
# Check Node version (should be 16+)
node --version

# Check pnpm version
pnpm --version

# Check if dev server is running
# Should see: Local: http://localhost:5173
pnpm dev
```

### Test in Different Browsers

If something works in Chrome but not Safari:
- Check browser-specific CSS properties
- Verify JavaScript API compatibility
- Test camera/media API support

### Clear Browser Cache

Sometimes old cached files cause issues:
1. Open browser DevTools (F12)
2. Right-click on refresh button
3. Select "Empty cache and hard reload"
4. Or use Ctrl+Shift+Delete to clear all cache

---

## 📞 Still Need Help?

### Documentation Resources

1. **Main Documentation:** [DOCUMENTATION.md](DOCUMENTATION.md)
2. **ID Card Guide:** [ID_CARD_DOCUMENTATION.md](ID_CARD_DOCUMENTATION.md)
3. **Recent Changes:** [RECENT_UPDATES.md](RECENT_UPDATES.md)
4. **Version History:** [CHANGELOG.md](CHANGELOG.md)

### Code References

- Check component source code in `/src/app/components/`
- Look at working examples in EnhancedDashboard.tsx
- Review mock data in AppMain.tsx

### Search the Codebase

```bash
# Search for specific text in all files
grep -r "searchTerm" src/

# Find files by name
find src/ -name "*.tsx" | grep Component
```

---

**Last Updated:** May 24, 2026  
**Version:** 1.1.0  
**Maintained By:** Festival Development Team



**Add your own guidelines here**
<!--

System Guidelines

Use this file to provide the AI with rules and guidelines you want it to follow.
This template outlines a few examples of things you can add. You can add your own sections and format it to suit your needs

TIP: More context isn't always better. It can confuse the LLM. Try and add the most important rules you need

# General guidelines

Any general rules you want the AI to follow.
For example:

* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files.

--------------

# Design system guidelines
Rules for how the AI should make generations look like your company's design system

Additionally, if you select a design system to use in the prompt box, you can reference
your design system's components, tokens, variables and components.
For example:

* Use a base font-size of 14px
* Date formats should always be in the format “Jun 10”
* The bottom toolbar should only ever have a maximum of 4 items
* Never use the floating action button with the bottom toolbar
* Chips should always come in sets of 3 or more
* Don't use a dropdown if there are 2 or fewer options

You can also create sub sections and add more specific details
For example:


## Button
The Button component is a fundamental interactive element in our design system, designed to trigger actions or navigate
users through the application. It provides visual feedback and clear affordances to enhance user experience.

### Usage
Buttons should be used for important actions that users need to take, such as form submissions, confirming choices,
or initiating processes. They communicate interactivity and should have clear, action-oriented labels.

### Variants
* Primary Button
  * Purpose : Used for the main action in a section or page
  * Visual Style : Bold, filled with the primary brand color
  * Usage : One primary button per section to guide users toward the most important action
* Secondary Button
  * Purpose : Used for alternative or supporting actions
  * Visual Style : Outlined with the primary color, transparent background
  * Usage : Can appear alongside a primary button for less important actions
* Tertiary Button
  * Purpose : Used for the least important actions
  * Visual Style : Text-only with no border, using primary color
  * Usage : For actions that should be available but not emphasized
-->



# Changelog

All notable changes to the Festival Management System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-05-24

### Added

#### ID Card Component
- **New Component:** `/src/app/components/IDCard.tsx`
  - Professional ID card design with church branding
  - 350x550px dimensions (standard ID card proportions)
  - Dual logo display (church + festival logos)
  - Gender-based color theming:
    - Male: Blue gradient (#3B82F6 → #2563EB)
    - Female: Pink gradient (#EC4899 → #DB2777)
    - Default: Purple gradient (#A855F7 → #9333EA)
  - Burgundy-gold gradient header
  - Profile circle with participant initials
  - Education stage and year display
  - Integrated QR code (140x140px, Level H error correction)
  - Footer decoration strip

#### Download Functionality
- High-resolution PNG export (700x1100px at 2x scale)
- Integration with html2canvas library
- Filename format: `ID_Card_{Name}_{ID}.png`
- Error handling with Arabic toast notifications
- Memory cleanup with URL.revokeObjectURL()

#### StudentProfile Integration
- ID card preview in participant profile page
- Download button with Download icon
- Seamless integration with existing profile layout

#### Documentation
- **New File:** `ID_CARD_DOCUMENTATION.md`
  - Complete component specifications
  - Design breakdown with code examples
  - Helper functions documentation
  - Image import strategy guide
  - Troubleshooting section
  - Usage examples
  - Accessibility and performance notes
- Updated main DOCUMENTATION.md with ID card overview
- Added version history section
- Created this CHANGELOG.md file

### Fixed

#### Logo Display Issue (CRITICAL)
- **Problem:** Church logo (`new-church-logo.png`) and festival logo (`Arebsalin-1.png`) not displaying in ID card component
- **Error Message:** `❌ Festival logo failed to load: /src/imports/Arebsalin-1.png`
- **Root Cause:** Used dynamic URL construction with `new URL(path, import.meta.url).href` which resolved to source path instead of processed asset path
- **Solution:** Changed to static ES module imports matching pattern in EnhancedDashboard and LoginPage
  ```typescript
  // Before (broken)
  const churchLogoPath = new URL('../../imports/new-church-logo.png', import.meta.url).href;
  
  // After (fixed)
  import churchLogo from '../../imports/new-church-logo.png';
  import festivalLogo from '../../imports/Arebsalin-1.png';
  ```
- **Impact:** Logos now display correctly in development and production builds
- **Testing:** Verified consistency across all components using logos

### Changed
- Updated version number from 1.0.0 to 1.1.0
- Updated "Last Updated" date in documentation to May 24, 2026
- Improved image asset handling consistency across components

### Technical Details

#### Files Modified
- `/src/app/components/IDCard.tsx` - Logo import fix

#### Files Added
- `/ID_CARD_DOCUMENTATION.md` - New documentation
- `/CHANGELOG.md` - This file

#### Dependencies
No new dependencies added (html2canvas was already installed)

---

## [1.0.0] - 2026-05-00

### Added - Initial Release

#### Core Features
- Complete festival management system for summer deacon school
- Arabic RTL support throughout application
- Burgundy-gold color scheme (Coptic Orthodox Church branding)
- Mobile-first responsive design

#### Pages & Components

**Authentication:**
- LoginPage - Teacher login (mock authentication)
- SignupPage - Teacher registration form

**Dashboard:**
- EnhancedDashboard - Main navigation hub
  - Statistics cards (total participants, today's attendance)
  - QR scanner buttons (attendance, market, add points, view details)
  - Action buttons (register, manual points, finance, statistics, teachers)
  - Searchable participants list
  - Test QR codes section

**Registration:**
- EnhancedRegistrationForm - Student/participant registration
  - Dynamic fields based on education stage
  - 6 education stages support (KG through Graduate)
  - Multiple contact numbers (personal, father, mother)
  - Complete address collection

**Profile:**
- StudentProfile - Participant detail page
  - Large downloadable QR code (600x600px)
  - Statistics cards (attendance %, days attended, points)
  - Attendance history list
  - Complete personal information display

**QR System:**
- QRScanner - Multi-mode camera scanner
  - Attendance mode (burgundy theme)
  - Market mode (gold theme)
  - Add points mode (green theme)
  - View details mode (blue theme)
  - Camera permission handling
  - Flashlight control
  - Image upload fallback

**Points Management:**
- AddPointsModal - Add bonus points (via QR scan)
- MarketModal - Deduct points for purchases
- ManualPointsModal - Manual points management (no QR scan)
  - Search participants by name
  - Add or deduct points
  - Preview before confirmation

**Financial Management:**
- FinancePage - Complete financial tracking
  - Revenue and expense transactions
  - Summary cards (total revenue, expenses, balance)
  - Pie chart (revenue vs expense ratio)
  - Bar chart (by education stage)
  - Transaction filters (type, stage)
  - Add transaction form

**Statistics & Analytics:**
- StatisticsPage - Comprehensive analytics dashboard
  - Overall summary cards (participants, attendance, averages)
  - Gender distribution pie chart
  - Participants by stage bar chart (with gender breakdown)
  - Attendance timeline line chart
  - Points distribution bar chart
  - Per-class statistics (6 sections, one per education stage):
    - Points statistics (total, average, max, min)
    - Top 10 in points leaderboard (with medals for top 3)
    - Top 10 in attendance leaderboard (with percentages)

**Teachers Management:**
- TeachersPage - Staff organization
  - Teachers grouped by education stage
  - Supervisor designation (crown icon, gold theme)
  - Expandable/collapsible stage sections
  - Contact information (mobile, email)
  - Total teachers summary

#### Data Models

**Participant Interface:**
```typescript
interface Participant {
  id: string;
  name: string;
  points: number;
  attended: boolean;
  attendanceDays: string[];
  data: StudentData;
}
```

**StudentData Interface:**
- Full name, gender, date of birth, confession father
- Education stage and year
- School/university/workplace (conditional)
- Three mobile numbers (personal, father, mother)
- Complete address

**Transaction Interface:**
- Type (revenue/expense)
- Title, amount, date
- Education stage association
- Person name, optional description

**Teacher Interface:**
- ID, name, mobile, email
- Supervisor flag

#### Mock Data
- 35+ participants with varied data
- Distribution across all 6 education stages
- Balanced gender distribution
- Points range: 0-230+
- Attendance data: 0-14 days (out of 15 total)
- 15+ financial transactions
- 22 teachers (6 supervisors, 16 regular)

#### Features

**Points System:**
- Automatic +10 points on attendance
- Bonus points via QR scan
- Manual points add/deduct
- Market deduction with validation
- Positive integers only (no negatives, decimals)

**Attendance Tracking:**
- QR code check-in
- Duplicate prevention (one per day)
- Attendance percentage calculation
- Historical records
- Timeline visualization

**QR Code System:**
- Generation with qrcode.react
- Scanning with html5-qrcode
- Multiple operational modes
- High error correction (Level H)
- Download as PNG

**Charts & Visualizations:**
- Recharts library integration
- Interactive tooltips
- Responsive sizing
- Color-coded data
- Multiple chart types (pie, bar, line)

**RTL Support:**
- Complete Arabic language support
- Right-to-left layout
- Arabic fonts (Tajawal, Cairo)
- RTL-aware components

**Toast Notifications:**
- Sonner library
- RTL support
- Arabic messages
- Success/info/error types

#### Libraries & Dependencies

**Core:**
- React 18.3.1
- TypeScript ~5.6.2
- react-dom 18.3.1

**Styling:**
- Tailwind CSS 4.1.12
- Custom CSS variables for theming

**QR Code:**
- html5-qrcode latest
- qrcode.react ^4.2.0

**Charts:**
- recharts 2.15.2

**Icons:**
- lucide-react 0.487.0

**Notifications:**
- sonner 2.0.3

**Build Tools:**
- Vite 6.3.5
- @vitejs/plugin-react 4.7.0

**Other:**
- @mui/material 7.3.5 (with emotion dependencies)
- Various Radix UI components
- react-router 7.13.0
- motion 12.23.24

#### Color System

**Primary Colors:**
- Primary: #8B1538 (Burgundy)
- Secondary: #C9A961 (Gold)
- Background: #FAF7F2 (Off-white beige)
- Foreground: #3D2817 (Dark brown)

**Additional Colors:**
- Green: #10B981 (Add points)
- Blue: #3B82F6 (View details)
- Red: #EF4444 (Expenses, destructive)
- Pink: #EC4899 (Female statistics)

#### Typography
- Primary: Tajawal (400, 500, 700)
- Fallback: Cairo (400, 600, 700)
- System fallback: sans-serif

#### Education Stages
1. حضانة (KG)
2. ابتدائي (Primary)
3. إعدادي (Preparatory)
4. ثانوي (Secondary)
5. جامعي (University)
6. خريجين (Graduates)

### Security Notes

**Current Implementation:**
- Mock authentication (no real security)
- Client-side data storage only (component state)
- No backend/database integration
- No data encryption
- Suitable for prototyping and demonstration only
- **NOT production-ready** for real participant data

**Production Requirements (Future):**
- Real authentication with password hashing
- Backend database (Supabase/Firebase)
- Data encryption at rest and in transit
- HTTPS/TLS
- GDPR compliance
- Access control and audit logs

---

## [Unreleased]

### Planned Features (Future Versions)

#### v1.2.0 - Photo Support
- Photo upload for ID cards
- Camera capture integration
- Image cropping and optimization
- Fallback to initials if no photo

#### v1.3.0 - Batch Operations
- Download all ID cards as ZIP
- Print-optimized PDF export
- Multiple cards per page
- CSV export with QR codes

#### v2.0.0 - Backend Integration
- Supabase or Firebase backend
- Real-time data synchronization
- Persistent data storage
- Real authentication system
- Role-based access control

#### v2.1.0 - Advanced Reporting
- Excel export (attendance, points, finance)
- PDF reports (certificates, progress reports)
- Email notifications (daily summaries, alerts)
- SMS integration for attendance

#### v2.2.0 - Mobile Enhancements
- Progressive Web App (PWA)
- Offline functionality
- Push notifications
- Background sync
- Geolocation check-in

#### v2.3.0 - Advanced Features
- NFC card reading
- Encrypted QR codes
- Time-limited QR codes
- Biometric authentication
- Multi-language support (English/Arabic)

---

## Notes

### Versioning Scheme

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version (X.0.0): Incompatible API changes, major rewrites
- **MINOR** version (0.X.0): New features, backward-compatible
- **PATCH** version (0.0.X): Bug fixes, backward-compatible

### Change Categories

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be-removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes

### Documentation

For complete documentation, see:
- [DOCUMENTATION.md](DOCUMENTATION.md) - Main system documentation
- [ID_CARD_DOCUMENTATION.md](ID_CARD_DOCUMENTATION.md) - ID card component guide
- [FEATURES.md](FEATURES.md) - Feature descriptions
- [ATTRIBUTIONS.md](ATTRIBUTIONS.md) - Third-party credits

---

**Church:** Church of the Great Martyr St. Mina the Wonderworker and Pope Kyrillos VI - Aswan  
**Festival:** اريبصالين Summer Deacon School  
**Developer:** Claude Code Assistant  
**Maintained By:** Festival Development Team
