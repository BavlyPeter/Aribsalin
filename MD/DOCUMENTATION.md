# اريبصالين - Summer Festival Management System
## Complete Technical Documentation

**Current Version:** 1.1.0 (ID Card Feature Update)  
**Last Updated:** May 24, 2026

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

## 📋 Project Overview

**Project Name:** اريبصالين (Arribsalin)  
**Type:** Summer Festival Management System for Coptic Orthodox Church  
**Church:** Church of the Great Martyr St. Mina the Wonderworker and Pope Kyrillos VI - Aswan  
**Technologies:** React 18.3.1 + TypeScript + Tailwind CSS v4  
**Language:** Arabic (RTL)  
**Platform:** Mobile-First Web Application  
**Current Version:** 1.1.0 (ID Card Feature - May 24, 2026)

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
│   ├── App.tsx                    # Main entry point
│   ├── AppMain.tsx               # Main application router component
│   └── components/
│       ├── LoginPage.tsx         # Teacher login page
│       ├── SignupPage.tsx        # Teacher registration/signup page
│       ├── EnhancedDashboard.tsx # Main dashboard with navigation
│       ├── EnhancedRegistrationForm.tsx  # Student registration form
│       ├── StudentProfile.tsx    # Participant profile page with QR
│       ├── QRScanner.tsx         # QR code scanner component
│       ├── MarketModal.tsx       # Market point deduction modal
│       ├── AddPointsModal.tsx    # Add points modal (via QR scan)
│       ├── ManualPointsModal.tsx # Manual points management (no scan)
│       ├── FinancePage.tsx       # Financial management page
│       ├── StatisticsPage.tsx    # Statistics and analytics page
│       ├── TeachersPage.tsx      # Teachers management page
│       ├── WelcomeScreen.tsx     # Welcome screen (shown once)
│       ├── ParticipantsList.tsx  # Searchable participants list
│       └── TestQRCode.tsx        # QR code generator for testing
├── imports/
│   ├── new-church-logo.png            # Church logo
│   └── Arebsalin-1.png          # Festival logo
└── styles/
    ├── theme.css                # Color system and CSS variables
    ├── fonts.css                # Arabic fonts import
    └── globals.css              # Global styles and resets
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
- **Detailed Address** (العنوان بالتفصيل) * - Textarea (3 rows), required

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
- **Detailed Address** (العنوان بالتفصيل) * - Textarea (3 rows), required

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
  
  // Address
  address: string;             // Complete address - required
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
  
  // Address
  address: string;             // Complete address (single field) - required
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
- الريبساليين logo
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
- **Festival:** الريبساليين Summer Festival

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

**Last Updated:** May 24, 2026  
**Current Version:** 1.1.0  
**Church:** كنيسة الشهيد العظيم مارمينا العجايبي والقديس العظيم البابا كيرلس السادس - أسوان
