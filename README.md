# Agnos Candidate Assignment - Real-Time Patient Intake & Staff Monitoring System

A responsive, real-time patient intake form and staff dashboard built with modern web technologies, designed to streamline patient intake and live data monitoring without server overhead.

---

## 🌐 Live Production Deployment

| Interface | Live URL | Description |
| :--- | :--- | :--- |
| **🚀 Dual Split-Screen Demo** | **[agnos-assignment-nine.vercel.app/split-view](https://agnos-assignment-nine.vercel.app/split-view)** | **Recommended for Evaluators:** Side-by-side Patient Form and Staff Monitor in a single tab |
| **📱 Patient Intake Form** | **[agnos-assignment-nine.vercel.app/patient](https://agnos-assignment-nine.vercel.app/patient)** | Mobile-first 3-step intake wizard for patients |
| **🖥️ Staff Dashboard** | **[agnos-assignment-nine.vercel.app/staff](https://agnos-assignment-nine.vercel.app/staff)** | Desktop-optimized real-time intake monitoring matrix |
| **🏠 Portal Home** | **[agnos-assignment-nine.vercel.app](https://agnos-assignment-nine.vercel.app/)** | Project landing page & evaluation protocol walkthrough |

---

## 📋 Table of Contents
- [Agnos Assignment Full Compliance Matrix](#-agnos-assignment-full-compliance-matrix)
- [Overview](#-overview)
- [Tech Stack & Exact Versions](#-tech-stack--exact-versions)
- [System Architecture & Planning](#-system-architecture--planning)
  - [1. Folder & Project Structure](#1-folder--project-structure)
  - [2. UI/UX Design Decisions](#2-uiux-design-decisions)
  - [3. Component Architecture](#3-component-architecture)
  - [4. Real-Time Synchronization Flow](#4-real-time-synchronization-flow)
- [Evaluator Quickstart & Verification](#-evaluator-quickstart--verification)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Bonus Features](#-bonus-features)

---

## 🏆 Agnos Assignment Full Compliance Matrix

Verification against each requirement specified in **`Candidate Assignment Agnos - Front-end developer.pdf`**:

| Requirement from Agnos PDF | Status | Verification & Code Evidence |
| :--- | :---: | :--- |
| **Patient Form: Personal Details** | | |
| • First Name | ✅ Pass | `personalInfoSchema.firstName`: required, trimmed, max 50 chars (`src/lib/schemas.ts`) |
| • Middle Name (optional) | ✅ Pass | `personalInfoSchema.middleName`: optional, soft `(Optional)` tag, inverse marking (`src/lib/schemas.ts`) |
| • Last Name | ✅ Pass | `personalInfoSchema.lastName`: required, trimmed, max 50 chars (`src/lib/schemas.ts`) |
| • Date of Birth | ✅ Pass | `personalInfoSchema.dateOfBirth`: validated via `isValidDateOfBirth` (no future dates, valid leap year calendar check, $\le 130$ yrs) |
| • Gender | ✅ Pass | `genderEnum`: `male`, `female`, `other`, `prefer_not_to_say` with localized display labels (`src/lib/schemas.ts`) |
| • Phone Number | ✅ Pass | `contactInfoSchema.phoneNumber`: regex-validated for Thai mobile (`06`, `08`, `09`), landline (`02`), `+66`, and international E.164 with smart hyphen formatting |
| • Email | ✅ Pass | `contactInfoSchema.email`: validated via Zod `email()` (`src/lib/schemas.ts`) |
| • Address | ✅ Pass | `contactInfoSchema.address`: required, max 300 characters (`src/lib/schemas.ts`) |
| • Preferred Language | ✅ Pass | `personalInfoSchema.preferredLanguage`: select with Thai, English, Chinese, Japanese, Other (`src/lib/schemas.ts`) |
| • Nationality | ✅ Pass | `personalInfoSchema.nationality`: required, default `Thai` (`src/lib/schemas.ts`) |
| • Emergency Contact (optional: name & relationship) | ✅ Pass | `emergencyContactSchema`: `contactName`, `relationship`, and `contactPhone` all optional, validated if entered |
| • Religion (optional) | ✅ Pass | `personalInfoSchema.religion`: optional, list of common religions + custom text input |
| **Form Validation & UX** | | |
| • Required fields, valid phone, valid email | ✅ Pass | Strict Zod schema + React Hook Form; `mode: "onBlur"` prevents premature keystroke errors |
| • Responsive design (mobile & desktop) | ✅ Pass | Mobile-first 3-step wizard ($320\text{px}$ to $480\text{px}$ mobile up to desktop) with 44px touch targets |
| **Staff View** | | |
| • Display each field in real-time as patient inputs | ✅ Pass | Real-time keystroke broadcast; `PatientOverviewCards` & `FieldDisplay` mirror each field instantly |
| • Responsive design for staff | ✅ Pass | Desktop-optimized 3-column layout ($1280\text{px}+$); responsive down to tablet & mobile |
| • Status indicators: submitted, actively filling, inactive | ✅ Pass | `StatusBadge`: `typing` (*Actively filling in*), `idle` (*Inactive* with elapsed timer), `submitted` (*Submitted* with timestamp) |
| **Real-Time Synchronization** | | |
| • WebSockets / suitable real-time technology | ✅ Pass | Direct client-to-client Supabase Realtime (Broadcast & Presence) with native `BroadcastChannel` local fallback |
| **Tech Stack Specified** | | |
| • Framework: Next.js | ✅ Pass | Next.js 16.3.5 (App Router, Turbopack) |
| • Styling: TailwindCSS | ✅ Pass | Tailwind CSS 4.3.3 (CSS-first theme in `@theme inline`) |
| • Real-Time: WebSockets / suitable | ✅ Pass | Supabase Realtime (`@supabase/supabase-js` 2.116.0) + browser `BroadcastChannel` |
| • Hosting: Vercel / Heroku / Netlify | ✅ Pass | Deployed on **Vercel**: [agnos-assignment-nine.vercel.app](https://agnos-assignment-nine.vercel.app/) |
| **Deliverables Specified** | | |
| • Code Repository (GitHub link + instructions) | ✅ Pass | [github.com/tarsandee78/agnos-assignment](https://github.com/tarsandee78/agnos-assignment) with full setup steps |
| • Deployed Application (Live link) | ✅ Pass | [agnos-assignment-nine.vercel.app](https://agnos-assignment-nine.vercel.app/) |
| • Readme File (overview, setup, bonus features) | ✅ Pass | Documented in this `README.md` |
| • Development Planning Documentation: | | |
|   - Project Structure | ✅ Pass | Detailed in [PLANNING.md](./PLANNING.md) and Section 1 below |
|   - Design decisions for screen sizes | ✅ Pass | Detailed in [PLANNING.md](./PLANNING.md), [DESIGN.md](./DESIGN.md), and Section 2 below |
|   - Component Architecture | ✅ Pass | Detailed in [PLANNING.md](./PLANNING.md) and Section 3 below |
|   - Real-Time Synchronization Flow | ✅ Pass | Detailed with sequence diagram in [PLANNING.md](./PLANNING.md) and Section 4 below |

---

## 🎯 Overview

This system consists of two synchronized, real-time clinical interfaces:
1. **Patient Form (`/patient`):** A mobile-first, 3-step intake wizard allowing outpatients to submit personal details with immediate feedback and accessible 44px touch targets.
2. **Staff Dashboard (`/staff`):** A desktop-optimized medical monitoring dashboard that reflects each field in real-time as the patient types, along with live presence status indicators (*Actively filling in*, *Inactive*, *Submitted*).
3. **Split-Screen Demo (`/split-view`):** A dedicated evaluator workspace providing simultaneous side-by-side evaluation in a single tab.

---

## 🛠 Tech Stack & Exact Versions

This project is built using the latest 2026 bleeding-edge production stack:

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | 16.3.5 (App Router, Turbopack) | Optimized React server framework and routing |
| **React** | 19.3.0 | UI rendering engine |
| **Tailwind CSS** | 4.3.3 | Modern CSS-first atomic styling engine (`@theme inline`) |
| **shadcn/ui** | 4.21.0 | Accessible UI primitives based on `@base-ui/react` |
| **Zod** | 4.6.5 | Type-safe schema validation |
| **React Hook Form** | 7.88.0 | High-performance form state management |
| **Supabase JS** | 2.116.0 | Ultra-low-latency Realtime Broadcast & Presence |
| **Zustand** | 5.0.15 | Granular client state management for staff view |
| **Lucide React** | 1.47.0 | Clean healthcare iconography |
| **ESLint** | 9.39.5 | Flat Config code quality linting |

---

## 📐 System Architecture & Planning

Comprehensive planning documentation is available in [PLANNING.md](./PLANNING.md) and design tokens in [DESIGN.md](./DESIGN.md).

### 1. Folder & Project Structure
The project follows Next.js App Router conventions within `src/`:
```text
src/
├── app/                  # Next.js App Router routes
│   ├── patient/          # Route: /patient (Patient Form View)
│   │   └── page.tsx      
│   ├── staff/            # Route: /staff (Staff Dashboard View)
│   │   └── page.tsx      
│   ├── split-view/       # Route: /split-view (Dual Side-by-Side Evaluator Workspace)
│   │   └── page.tsx      
│   ├── layout.tsx        # Global Root Layout
│   └── globals.css       # Tailwind v4 theme & CSS tokens
├── components/           # Modular UI and Domain components
│   ├── ui/               # shadcn/ui base components (Button, Input, Card, Label, Dialog)
│   ├── patient/          # Patient form components (PatientStepper, StepPersonalInfo, etc.)
│   └── staff/            # Staff dashboard components (PatientOverviewCard, FieldDisplay, StatusBadge)
├── lib/                  # Shared configurations & utilities
│   ├── supabase.ts       # Supabase client singleton
│   ├── realtime.ts       # Broadcast & Presence room channel manager
│   ├── schemas.ts        # Zod validation schema & domain helpers (formatters, age calculator)
│   ├── i18n/             # Internationalization dictionaries (Thai / English)
│   └── utils.ts          # Tailwind class merger (cn helper)
├── hooks/                # Custom React hooks (usePatientDraft, usePatientRealtime, useStaffRealtime)
└── store/                # Global State
    └── useStaffStore.ts  # Zustand store for handling real-time stream
```

### 2. UI/UX Design Decisions
- **Mobile-First Patient Wizard:** Grouped into 3 logical steps (1. Personal Details ➔ 2. Contact & Address ➔ 3. Emergency & Review) to reduce cognitive load down to 320px screens.
- **Inverse Marking for Accessibility:** Only optional fields are marked with soft `(Optional)` tags, eliminating visual clutter from aggressive red asterisks.
- **Accessible Touch Targets:** Minimum 44x44px clickable areas (`.touch-target` / `min-h-[44px]`) conforming to WCAG 2.5.5.
- **Smart Validation UX:** Fields validate `onBlur` or `onSubmit` rather than prematurely interrupting keystrokes with errors.
- **Desktop-Optimized Staff Dashboard:** 3-column card grid mirroring patient steps for rapid triage scannability.
- **Zero-Layout Shift (CLS = 0):** Status badges and field placeholders use fixed dimensions to eliminate UI jumps during live streaming.

### 3. Component Architecture
- **`PatientForm`:** Manages form inputs via React Hook Form, validates via Zod, and broadcasts keystroke events to Supabase Realtime channel.
- **`StaffDashboard`:** Subscribes to the Supabase channel on mount and dispatches incoming payloads into the Zustand store.
- **`useStaffStore`:** Isolates incoming WebSocket traffic from full-page re-renders; granular selectors update only the modified field.
- **`StatusBadge`:** Real-time visual badge tracking patient presence (`typing`, `idle`, `submitted`).

### 4. Real-Time Synchronization Flow
```text
[ Patient View ]                     [ Supabase Realtime ]                  [ Staff Dashboard ]
(React Hook Form)                   (Broadcast & Presence)                    (Zustand Store)
       │                                       │                                     │
       │── 1. track({ status: 'typing' }) ────>│── presence_sync ───────────────────>│ (Update Badge)
       │                                       │                                     │
       │── 2. broadcast('form-update', data) ─>│── broadcast event ─────────────────>│ (Update Store)
       │                                       │                                     │
                                                                           [ UI Re-renders Field ]
```
> **Architecture Benefit:** Data streams directly via WebSocket Broadcast without round-tripping to a database, providing sub-50ms latency with zero database read/write cost.

---

## 🧪 Evaluator Quickstart & Verification

You can verify real-time functionality in under 60 seconds:
1. Open the **[Split-Screen Demo](https://agnos-assignment-nine.vercel.app/split-view)**.
2. Type in **First Name**, **Phone Number**, or **Date of Birth** on the left (Patient View).
3. Observe the right side (Staff View) update **instantly** per keystroke with subtle field highlight indicators.
4. Stop typing for 5 seconds: notice the status pill transitions from **Actively filling in** to **Inactive (5s)**.
5. Complete Step 3 and submit: notice the status immediately becomes **Submitted**, and a Hospital Receipt Reference ID (`AGN-YYYYMMDD-XXXX`) is generated.
6. Click **"Next Patient"** on the staff dashboard to reset and prepare for the next intake.

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Node.js 20+
- npm / pnpm / yarn

### Installation
1. Clone repository:
   ```bash
   git clone https://github.com/tarsandee78/agnos-assignment.git
   cd agnos-assignment
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env.local` file at the root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   *(Note: If credentials are not provided, the application automatically falls back to browser-native `BroadcastChannel` API for full local dual-screen functionality).*
4. Run code quality checks:
   ```bash
   npm run lint        # ESLint 9 Flat Config (0 errors)
   npx tsc --noEmit    # TypeScript strict check (0 errors)
   npm run build       # Next.js 16 Turbopack production build
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open your browser:
   - Split-Screen Demo: [http://localhost:3000/split-view](http://localhost:3000/split-view)
   - Patient Form: [http://localhost:3000/patient](http://localhost:3000/patient)
   - Staff Dashboard: [http://localhost:3000/staff](http://localhost:3000/staff)

---

## 🌟 Bonus Features

- **Dual Realtime Architecture (Supabase + BroadcastChannel Fallback):** Zero-latency synchronization that operates seamlessly even in offline local environments without Supabase credentials.
- **Dual Split-Screen Workspace (`/split-view`):** Allows evaluators and reviewers to test the entire intake workflow in a single viewport.
- **Auto-Save Draft (LocalStorage):** Recovers unsubmitted patient input and current step progress if the tab is accidentally refreshed or closed.
- **Presence Tracking with Duration Counter:** Tracks patient engagement (`Actively filling in`, `Inactive for Xs`, `Submitted at HH:MM`).
- **Bilingual Internationalization (Thai / English):** Complete UI and error localization with independent language toggles persisted per interface.
- **Phone Auto-Hyphenation & Backspace Handling:** Auto-formats Thai mobile (`08X-XXX-XXXX`), Bangkok landline (`02-XXX-XXXX`), and international (`+66`) numbers with smooth backspace across delimiters.
- **Next Patient Workflow:** Dedicated staff turnover dialog to smoothly archive submitted intake and initialize a clean queue for the next patient.
