<!-- this a prompt to Update the `ARIBSALIN-DOCUMENTATION.md` file. -->

Act as an Expert Software Architect and Technical Writer. Your task is to deeply analyze the entire codebase of this workspace and Update a comprehensive, definitive master documentation file named `ARIBSALIN-DOCUMENTATION.md` in `MD/ARIBSALIN-DOCUMENTATION.md`.

This documentation must be exhaustive, serving as the ultimate guide for any new human developer or AI model joining the project. Do not hallucinate; base all your explanations strictly on the actual files, code, and configuration present in this workspace.

Please execute this task by following these steps:

### Step 1: Workspace Scanning
First, silently scan and read the following critical files and directories to understand the project's scope:
* `package.json`, `pnpm-workspace.yaml`,`vercel.json` and `vite.config.ts` (to determine the tech stack and tools).
* `src/app/App.tsx` or main router files (to understand routing and portals).
* `src/contexts/` (to understand global state management).
* `src/Lib/` (to understand shared utilities and helper functions).
* `src/pages/` and `src/components/` (to understand the UI structure).
* `src/types/` (to understand the TypeScript types and interfaces).
* `src/styles/` (to understand the styling approach and design system).
* `src/utils/` (to understand the utility functions and helper methods).
* `/MD` (to understand the documentation structure and Database Schema).

### Step 2: Update `ARIBSALIN-DOCUMENTATION.md`
Based on your analysis, Update a beautifully formatted Markdown file containing the following exact sections:

1. **Project Idea & Concept**
   - Provide a high-level executive summary of what this application is (e.g., a comprehensive multi-portal restaurant management, POS, and event reservation system).
   - Explain the core business problem it solves.

2. **Tech Stack & Tooling**
   - List the framework, build tools, package manager, and styling libraries (e.g., React 18, Vite, Tailwind CSS, Radix UI, Lucide React).
   - Explain *why* these tools are used based on how they are implemented in the code.

3. **User Roles & Workflows**
   - Break down exactly who can use this application. Detail the distinct portals (e.g., Customer, Admin, Cashier, Driver).
   - Detail the primary workflow for each role (e.g., "Customer books an event -> Pays via InstaPay -> Admin verifies WhatsApp -> Admin accepts order").

4. **Architecture & State Management**
   - Explain how data flows through the application.
   - Detail the purpose of each Context Provider (e.g., `EventContext`, `OrderContext`, `AuthContext`) and what global state they manage.

5. **Folder Structure & Deep Dive**
   - Generate an ASCII tree representation of the `src/` directory.
   - Provide a detailed explanation of what each major directory (`components`, `contexts`, `pages`, `services`) does, including notable key files inside them.

6. **Developer Guide: How to Work on This Project**
   - Provide instructions for a new developer or AI agent.
   - Mention the design system rules (e.g., "The Urban Omakase" aesthetic, use of `var(--primary)`, no 1px solid black borders, specific UI components).
   - Detail the steps to run the project locally (install commands, dev server commands).

Ensure the tone is highly technical, precise, and well-organized. Use tables for the tech stack and user roles if it improves scannability. Output the final result as the complete Markdown content.