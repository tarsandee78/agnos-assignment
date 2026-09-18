# Agnos Candidate Assignment - Real-Time Patient Intake & Staff Monitoring System

A responsive, real-time patient input form and staff dashboard built with modern web technologies, designed to streamline patient intake and live data monitoring without server overhead.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Tech Stack & Versions](#tech-stack--versions)
- [System Architecture & Planning](#system-architecture--planning)
  - [Folder & Project Structure](#folder--project-structure)
  - [UI/UX Design Decisions](#uiux-design-decisions)
  - [Component Architecture](#component-architecture)
  - [Real-Time Synchronization Flow](#real-time-synchronization-flow)
- [Features](#features)
- [Getting Started & Setup](#getting-started--setup)
- [Bonus Features](#bonus-features)

---

## 🎯 Overview

This system consists of two synchronized, real-time interfaces:
1. **Patient Form (/patient):** A mobile-first, multi-step intake wizard allowing patients to submit their personal details with immediate feedback.
2. **Staff Dashboard (/staff):** A desktop-optimized medical monitoring dashboard that reflects each field in real-time as the patient types, along with live presence status indicators (*Actively filling in*, *Inactive*, *Submitted*).

---

## 🛠 Tech Stack & Versions

This project is built using the latest 2026 bleeding-edge production stack:

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | 16.3.5 (App Router, Turbopack) | Optimized React server framework and routing |
| **React** | 19.3.0 | UI rendering engine |
| **Tailwind CSS** | 4.3.3 | Modern CSS-first atomic styling engine |
| **shadcn/ui** | 4.21.0 | Accessible and customizable UI components |
| **Zod** | 4.6.5 | Type-safe schema validation |
| **React Hook Form** | 7.88.0 | High-performance form state management |
| **Supabase JS** | 2.116.0 | Ultra-low-latency Realtime Broadcast & Presence |
| **Zustand** | 5.0.15 | Granular client state management for staff view |
| **Lucide React** | 1.47.0 | Clean iconography |

---

## 📐 System Architecture & Planning

Detailed planning documentation is available in [PLANNING.md](./PLANNING.md). Below is the executive architectural summary:

### 1. Folder & Project Structure
The project follows Next.js App Router conventions within src/:
`	ext
src/
├── app/                  # Next.js App Router routes
│   ├── patient/          # Route: /patient (Patient Form View)
│   │   └── page.tsx      
│   ├── staff/            # Route: /staff (Staff Dashboard View)
│   │   └── page.tsx      
│   ├── layout.tsx        # Global Root Layout
│   └── globals.css       # Tailwind v4 theme & CSS tokens
├── components/           # Modular UI and Domain components
│   ├── ui/               # shadcn/ui base components (Button, Input, Card, Label)
│   ├── patient/          # Patient form components (PatientForm, Stepper, etc.)
│   └── staff/            # Staff dashboard components (StaffDashboard, StatusBadge)
├── lib/                  # Shared configurations & utilities
│   ├── supabase.ts       # Supabase client initialization
│   ├── schemas.ts        # Zod validation schema (PatientFormData)
│   └── utils.ts          # Tailwind class merger (cn)
└── store/                # Global State
    └── useStaffStore.ts  # Zustand store for handling real-time stream
`

### 2. UI/UX Design Decisions
- **Mobile-First Patient Wizard:** Grouped into logical steps (1. Personal Details ➔ 2. Contact & Address ➔ 3. Emergency Contact) to reduce cognitive load and visual clutter for patients of all ages.
- **Accessible Touch Targets:** Minimum 44x44px clickable areas for effortless mobile interaction.
- **Smart Validation UX:** Fields validate onBlur or onSubmit rather than prematurely interrupting typing with errors.
- **Desktop-Optimized Staff Dashboard:** High information density utilizing cards grouped in visual parity with the patient steps, allowing medical staff to digest intake data instantly.
- **Zero-Layout Shift Indicators:** Status badges and indicators are fixed-dimension to prevent layout jumps (CLS).

### 3. Component Architecture
- PatientForm: Manages form inputs via React Hook Form, validates via Zod, and broadcasts keystroke events to Supabase Realtime channel.
- StaffDashboard: Subscribes to the Supabase channel on mount and passes incoming stream payloads into the Zustand store.
- useStaffStore: Isolates incoming websocket traffic from full-page re-renders, selectively updating only modified fields.
- StatusIndicator: Real-time visual badge tracking patient presence (	yping, idle, submitted).

### 4. Real-Time Synchronization Flow
`	ext
[ Patient View ]                     [ Supabase Realtime ]                  [ Staff Dashboard ]
(React Hook Form)                   (Broadcast & Presence)                    (Zustand Store)
       │                                       │                                     │
       │── 1. track({ status: 'typing' }) ────>│── presence_sync ───────────────────>│ (Update Badge)
       │                                       │                                     │
       │── 2. broadcast('form-update', data) ─>│── broadcast event ─────────────────>│ (Update Store)
       │                                       │                                     │
                                                                           [ UI Re-renders Field ]
`
> **Architecture Benefit:** Data streams directly via WebSocket Broadcast without round-tripping to a database, providing sub-50ms latency with zero database read/write cost.

---

## 🚀 Getting Started & Setup

### Prerequisites
- Node.js 18.18+ or 20+
- npm / pnpm / yarn

### Installation
1. Clone repository:
   `ash
   git clone <repository-url>
   cd agnos-assignment
   `
2. Install dependencies:
   `ash
   npm install
   `
3. Configure environment variables:
   Create a .env.local file at the root:
   `env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   `
4. Run the development server:
   `ash
   npm run dev
   `
5. Open your browser:
   - Patient Form: [http://localhost:3000/patient](http://localhost:3000/patient)
   - Staff Dashboard: [http://localhost:3000/staff](http://localhost:3000/staff)

---

## 🌟 Bonus Features
- **Client-to-Client Realtime (No DB Latency):** Supabase Broadcast allows true instantaneous synchronization without database write bottlenecks.
- **Auto-Save Draft (LocalStorage):** Recovers unsubmitted patient input even if the browser is accidentally closed.
- **Presence Tracking:** Staff can see when the patient is actively typing or currently idle.
- **Dark Mode Compatibility:** Medical dashboard supports dark color schemes for reduced eye strain during night shifts.
