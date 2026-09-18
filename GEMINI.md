# AGNOS CANDIDATE ASSIGNMENT - AGENT CONTEXT & ARCHITECTURE RULES

This file serves as persistent memory and instructions for Antigravity (and other AI agents) working in this workspace.

---

## 1. Project Overview & Requirements
- **Goal:** Develop a responsive, real-time patient input form and staff view system.
- **Interfaces:**
  1. **Patient Form (/patient):** Mobile-first responsive form for patient personal details:
     - First Name, Middle Name (optional), Last Name
     - Date of Birth, Gender
     - Phone Number, Email, Address
     - Preferred Language, Nationality
     - Emergency Contact (optional: name and relationship)
     - Religion (optional)
     - Form validation (Zod + React Hook Form)
  2. **Staff View (/staff):** Desktop-optimized dashboard monitoring patient inputs in real-time.
     - Display each field in real-time as patient types.
     - Status indicators for patient presence: **Actively filling in**, **Inactive**, or **Submitted**.
  3. **Real-Time Sync:** Direct client-to-client synchronization using Supabase Realtime (Broadcast & Presence) without database overhead.

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
`	ext
src/
├── app/
│   ├── patient/page.tsx      # Patient Form View
│   ├── staff/page.tsx        # Staff Dashboard View
│   ├── layout.tsx            # Root Layout
│   └── globals.css           # Tailwind v4 theme & CSS variables
├── components/
│   ├── ui/                   # shadcn/ui components (button, input, card, label)
│   ├── patient/              # Patient form step components
│   └── staff/                # Staff dashboard widgets & indicators
├── lib/
│   ├── supabase.ts           # Supabase client singleton
│   ├── schemas.ts            # Zod validation schema (PatientFormData)
│   └── utils.ts              # Styling utilities (cn helper)
└── store/
    └── useStaffStore.ts      # Zustand store for incoming real-time patient data
`

---

## 4. Development & Coding Guidelines for Agent
1. **Preserve Next 16 & Tailwind 4 Compatibility:** Do NOT revert back to 	ailwind.config.ts. Tailwind v4 config lives in @theme inline inside src/app/globals.css.
2. **Real-time Synchronization Pattern:**
   - Use Supabase channel('patient-room')
   - Patient broadcasts form state using .send({ type: 'broadcast', event: 'form-update', payload }) on keystrokes.
   - Patient tracks status using .track({ status: 'typing' | 'idle' | 'submitted' }) via Presence.
   - Staff listens to broadcast and presence events and updates Zustand store useStaffStore.
3. **Validation UX:**
   - Validate onBlur or onSubmit using Zod to prevent aggressive premature errors while typing.
4. **Accessibility & Healthcare UX:**
   - Minimum 44x44px touch targets.
   - Mobile-first stepper/wizard layout to reduce cognitive load.

---

## 5. Issue Implementation Workflow & Branching Strategy
All agents working on issues in this repository MUST strictly adhere to the following workflow:

1. **Branch-per-Issue (Mandatory):**
   - Before starting implementation on any issue, **always create and switch to a new branch** from `main` (e.g. `feat/issue-<number>-<description>` or `fix/issue-<number>-<description>`).
   - NEVER commit directly to `main` while working on an issue.
2. **Implementation & Verification:**
   - Implement the required changes cleanly according to the Acceptance Criteria.
   - Run type checks (`npx tsc --noEmit`) and build checks (`npm run build`) to ensure zero errors.
3. **Two-Axis Code Review (`/code-review`):**
   - Run the two-axis code review (Standards vs Spec) and resolve any feedback or smells before presenting.
4. **Frontend Live Preview & Verification:**
   - If changes affect the Frontend/UI, start the local dev server (`npm run dev`) and open the live preview.
   - Take screenshots to verify both Desktop and Mobile viewports and validate interaction states.
5. **Push Branch & Open Pull Request (PR):**
   - Push the feature branch to remote origin (`git push -u origin <branch-name>`).
   - Open a Pull Request pointing to `main` on GitHub with a clear description, summary of changes, evidence, and reference to the issue (e.g. `closes #<number>`).
6. **Strict User Approval & No Auto-Merge:**
   - Present the PR link, implementation summary, review findings, and UI preview to the USER for review.
   - Explicitly ask the USER for confirmation whether they are satisfied with the result.
   - **CRITICAL RULE: DO NOT merge the branch or PR back into `main` automatically.** Wait for the USER's explicit instruction/approval before performing any merge.
