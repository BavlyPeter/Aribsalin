# Changelog

All notable changes to the Festival Management System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.5.0] - 2026-06-05

### Added
- **Isolated File Scanner:** Added a hidden div (`#file-qr-reader`) and independent `Html5Qrcode` instance for file uploads to prevent concurrency crashes with the live camera.
- **Lossless PNG Normalization:** Implemented a custom canvas-based normalization flow that saves strictly as PNG to avoid JPEG compression artifacts.
- **Small Image Scaling:** Automatic upscaling for small uploaded images to improve recognition rates.

### Fixed
- **iOS Safari Camera Freeze:** Removed `navigator.vibrate` from the scan success flow to prevent video track suspension.
- **Unresponsive Invalid Scans:** Added logic to clear `lastScannedCodeRef` on invalid codes so the camera remains responsive for retries of the same code.
- **Blurry QR Edges:** Disabled `imageSmoothingEnabled` during canvas normalization for sharp QR code modules.

### Changed
- Refactored `handleFileUpload` into a robust two-step approach (direct scan → lossless fallback).
- Updated `handleScanSuccess` for better mobile responsiveness.

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
