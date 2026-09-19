<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# AGNOS CANDIDATE ASSIGNMENT - UNIFIED AGENT CONTEXT & ARCHITECTURE RULES

This file serves as the **single source of truth**, persistent memory, and operational guidelines for all AI agents (Antigravity, Claude Code, Cursor, Copilot, etc.) working in this repository.

---

## 1. Project Overview & Requirements
- **Goal:** Develop a responsive, real-time patient intake form and staff view system.
- **Interfaces:**
  1. **Patient Form (/patient):** Mobile-first responsive form for patient personal details:
     - First Name, Middle Name (optional), Last Name
     - Date of Birth, Gender
     - Phone Number, Email, Address
     - Preferred Language, Nationality
     - Emergency Contact (optional: name, relationship, phone)
     - Religion (optional)
     - Form validation (Zod + React Hook Form)
  2. **Staff View (/staff):** Desktop-optimized dashboard monitoring patient inputs in real-time.
     - Display each field in real-time as patient types.
     - Status indicators for patient presence: **Actively filling in**, **Inactive**, or **Submitted**.
  3. **Real-Time Sync:** Direct client-to-client synchronization using Supabase Realtime (Broadcast & Presence) with BroadcastChannel local fallback without database overhead.

---

## 2. Technology Stack & Exact Versions (2026 Latest)
- **Framework:** Next.js 16.3.5 (App Router, Turbopack)
- **UI Library:** React 19.3.0
- **Styling:** Tailwind CSS 4.3.3 + shadcn/ui
- **Form Handling:** React Hook Form 7.88.0
- **Validation:** Zod 4.6.5
- **State Management:** Zustand 5.0.15
- **Realtime:** Supabase JS @supabase/supabase-js 2.116.0
- **Icons:** Lucide React 1.47.0

---

## 3. Key Architecture & File Structure
```text
src/
├── app/
│   ├── patient/page.tsx      # Patient Form View
│   ├── staff/page.tsx        # Staff Dashboard View
│   ├── layout.tsx            # Root Layout
│   └── globals.css           # Tailwind v4 theme & CSS variables
├── components/
│   ├── ui/                   # shadcn/ui components (button, input, card, label, dialog)
│   ├── patient/              # Patient form step components
│   └── staff/                # Staff dashboard widgets & indicators
├── lib/
│   ├── supabase.ts           # Supabase client singleton
│   ├── realtime.ts           # Channel manager & broadcast helpers
│   ├── schemas.ts            # Zod validation schemas & shared domain helpers
│   └── utils.ts              # Styling utilities (cn helper)
├── hooks/                    # Shared custom React hooks (e.g., usePatientDraft, usePatientRealtime)
└── store/
    └── useStaffStore.ts      # Zustand store for incoming real-time patient data
```

---

## 4. Development & Coding Guidelines for Agent
1. **Preserve Next 16 & Tailwind 4 Compatibility:** Do NOT revert back to `tailwind.config.ts`. Tailwind v4 config lives in `@theme inline` inside `src/app/globals.css`.
2. **Real-time Synchronization Pattern:**
   - Use Supabase `channel('patient-room')`
   - Patient broadcasts form state using `.send({ type: 'broadcast', event: 'form-update', payload })` on keystrokes.
   - Patient tracks status using `.track({ status: 'typing' | 'idle' | 'submitted' })` via Presence.
   - Staff listens to broadcast and presence events and updates Zustand store `useStaffStore`.
3. **Validation UX:**
   - Validate `onBlur` or `onSubmit` using Zod to prevent aggressive premature errors while typing.
4. **Accessibility & Healthcare UX:**
   - Minimum 44x44px touch targets (`.touch-target` / `min-h-[44px]`).
   - 16px font size (`text-base`) on inputs to prevent iOS Safari auto-zoom.
   - Mobile-first stepper/wizard layout to reduce cognitive load down to 320px screens.

---

## 5. Issue Implementation Workflow & Branching Strategy
All agents working on issues in this repository MUST strictly adhere to the following workflow:

1. **Branch-per-Issue (Mandatory):**
   - Before starting implementation on any issue, **always create and switch to a new branch** from `main` (e.g. `feat/issue-<number>-<description>` or `fix/issue-<number>-<description>`).
   - NEVER commit directly to `main` while working on an issue.
2. **Issue Kickoff & Engineering Guidelines (Matt Pocock & Andrej Karpathy Skills):**
   - **Andrej Karpathy Guidelines (`karpathy-guidelines`):**
     - **Think Before Coding:** Explicitly surface assumptions, tradeoffs, and ambiguities before implementing. Never guess silently.
     - **Simplicity First:** Write the minimum code needed to solve the task. Avoid speculative abstractions, unnecessary configurability, markup bloat, or premature optimization.
     - **Surgical Changes:** Touch only what is strictly necessary. Never refactor unrelated code or touch surrounding lines unnecessarily.
     - **Goal-Driven Execution:** Establish verifiable success criteria upfront and loop until verified.
   - **Matt Pocock's Skills & Engineering Flow (`ask-matt`, `implement`, `tdd`, `codebase-design`):**
     - **Skill Routing (`/ask-matt`):** Consult `/ask-matt` to determine the best flow for the issue.
     - **Codebase Design (`/codebase-design`):** Design deep modules with small interfaces and clean seams.
     - **Implementation & TDD (`/implement`, `/tdd`):** Execute changes test-first where applicable, keeping a tight feedback loop with regular type-checking and tests.
3. **Implementation & Verification:**
   - Implement the required changes cleanly according to the Acceptance Criteria and the kickoff guidelines above.
   - Run type checks (`npx tsc --noEmit`) and build checks (`npm run build`) to ensure zero errors.
4. **Two-Axis Code Review (`/code-review`):**
   - Run the two-axis code review (Standards vs Spec) and resolve any feedback or smells before presenting.
5. **Frontend Live Preview & Verification:**
   - If changes affect the Frontend/UI, start the local dev server (`npm run dev`) and open the live preview.
   - Take screenshots to verify both Desktop and Mobile viewports and validate interaction states.
6. **Push Branch & Open Pull Request (PR):**
   - Push the feature branch to remote origin (`git push -u origin <branch-name>`).
   - Open a Pull Request pointing to `main` on GitHub with a clear description, summary of changes, evidence, and reference to the issue (e.g. `closes #<number>`).
7. **Strict User Approval & No Auto-Merge:**
   - Present the PR link, implementation summary, review findings, and UI preview to the USER for review.
   - Explicitly ask the USER for confirmation whether they are satisfied with the result.
   - **CRITICAL RULE: DO NOT merge the branch or PR back into `main` automatically.** Wait for the USER's explicit instruction/approval before performing any merge.
8. **Post-Merge Local Sync & Cleanup:**
   - Once the USER merges the PR on GitHub (or gives approval):
   - Switch back to `main`: `git checkout main`
   - Pull the latest changes from origin: `git pull origin main`
   - Delete the merged local branch: `git branch -d <branch-name>`
   - Prune remote tracking references: `git remote prune origin`
   - Verify the local working tree is clean (`git status`) before picking up the next issue.
