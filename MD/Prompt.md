<!-- this a prompt to Update the `PROJECT-DOCUMENTATION.md` file. -->

Act as an Expert Software Architect and Technical Writer. Your task is to deeply analyze the entire codebase and the current state of this workspace and update the comprehensive master documentation file named `@PROJECT-DOCUMENTATION.md` in `@MD/PROJECT-DOCUMENTATION.md`.

This documentation must serve as the definitive blueprint for any new human developer or AI model joining the project. Do not hallucinate; base all explanations strictly on the actual files, code, database schema, and configurations present in this workspace.

### Step 1: Workspace Scanning
Silently scan and read the following critical files and directories to map the current architecture:
* `@package.json`, `@pnpm-workspace.yaml`, `@vercel.json`, and `@vite.config.ts` (for the tech stack and build pipeline).
* `@src/app/App.tsx` and `@src/components/auth/RoleGuard.tsx` (for routing and RBAC).
* `@src/store/useFestivalStore.ts` (for the Zustand global state and data stitching).
* `@src/components/shared/QRScanner.tsx` and `@src/components/shared/IDCard.tsx` (to understand the Smart Router and digital badge logic).
* `@src/pages/` (specifically `@TeachersPage.tsx`, `@StudentProfile.tsx`, `@ServantProfile.tsx` for workflows and contact links).
* `@src/types/index.ts` and the Supabase SQL schema definitions (to understand the data models and relations, including `@servant_attendance_logs`).
* The existing `@PROJECT-DOCUMENTATION.md` (to preserve the Troubleshooting and Changelog sections).
* `@src/contexts/` (to understand global state management).
* `@src/Lib/` (to understand shared utilities and helper functions).
* `@src/types/` (to understand the TypeScript types and interfaces).
* `@src/utils/` (to understand the utility functions and helper methods).
* `@/MD` (to understand the documentation structure and Database Schema).


### Step 2: Update `PROJECT-DOCUMENTATION.md`
Generate a highly technical, beautifully formatted Markdown file containing the following exact sections. Retain the existing Troubleshooting and Changelog sections from the current document.

1. **Project Idea & Concept**
   - Provide an executive summary of Aribsalin as a Church Festival & Sunday School Management System.
   - Detail the core business problems solved (e.g., QR check-in bottlenecks, duplicate attendance fraud, Smart ID generation).

2. **Tech Stack & Tooling**
   - List the framework and tools (React 18, React Router v7, Zustand 5, Vite, Tailwind CSS v4, Supabase, html5-qrcode, html2canvas).
   - Explain *why* these specific tools are used based on their architectural implementation (e.g., why Zustand is used over Context to maintain 60 FPS in the scanner).

3. **User Roles & Workflows**
   - Provide an RBAC matrix for the 5 roles: `student`, `normal`, `supervisor`, `admin`, and the newly added `developer` (God Mode).
   - Detail the primary workflows (e.g., Smart QR Routing for Students vs. Servants, Dual-Login Credential Resolution, Compensating Point Rollbacks).

4. **Architecture & State Management**
   - Explain the end-to-end data flow.
   - Detail the database schema (focusing on `participants`, `servants`, `attendance_logs`, and the new `servant_attendance_logs`).

5. **Folder Structure & Deep Dive**
   - Generate an updated ASCII tree of the `src/` directory.
   - Explain the purpose of key directories and critical files.

6. **Developer Guide & Architectural Invariants**
   - Document the strict rules developers must follow.
   - Mention "The Coptic Heritage Palette" design system.
   - Detail the critical invariants: Smart ID Gap-Filling, iOS Safari Camera freeze prevention, actionable contact links (`tel:` and `wa.me`), and the Developer Stealth Mode.

7. **Troubleshooting Guide**
   - (Preserve this section from the existing documentation).

8. **System Changelog**
   - (Preserve this section from the existing documentation, ensuring version 2.3.0 notes are at the top).

Ensure the tone is authoritative and precise. Output the final result as the complete Markdown content.