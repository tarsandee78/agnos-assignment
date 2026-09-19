# Product Context & Durable Truth (`PRODUCT.md`)

## 1. Product Identity & Purpose
**Agnos Real-Time Patient Intake & Staff Monitoring System** is a mission-critical clinical health-tech application bridging patients and healthcare personnel during hospital outpatient intake.
The system provides zero-friction, accessible personal detail intake on mobile devices for patients, paired with a high-density, real-time dashboard for triage nurses and medical registrars to oversee intake live without database overhead.

---

## 2. Target Audiences & Use Cases

### A. Patients (`/patient`)
- **Demographics:** Outpatients across all age groups (from digital natives to elderly patients and individuals experiencing acute physical or emotional discomfort).
- **Primary Need:** Single-task focus, low cognitive strain, accessible touch affordances, and reassurance of confidential, error-free submission.
- **Context:** Typically operated on personal mobile devices (iOS Safari, Android Chrome) in hospital reception or waiting areas.

### B. Medical Staff (`/staff`)
- **Demographics:** Hospital triage nurses, check-in administrators, and medical records personnel.
- **Primary Need:** Instant scannability, dense real-time intake tracking, zero distraction from UI jitter, and calm patient status visibility.
- **Context:** High-throughput desktop workstations (Full HD / Ultrawide) managing concurrent outpatient queues.

---

## 3. Operational Constraints
1. **Zero Database Overhead (Direct Peer-to-Peer Sync):** Form state streams directly between clients using Supabase Realtime (Broadcast and Presence). No sensitive draft data is permanently stored in a remote database until formal submission.
2. **Local Multi-Tab Fallback:** When internet connectivity is offline or Supabase credentials are not configured, the system must seamlessly fall back to the browser's native `BroadcastChannel` API for local dual-screen evaluation.
3. **Unstable Network Resilience:** Mobile network connections in hospital waiting rooms fluctuate; presence tracking and broadcast reconnection must self-heal gracefully without page reloads.
4. **Zero Layout Shift (CLS = 0):** On the staff dashboard, continuous keystroke streaming must never cause visual reflows, jumps, or accordion expansions.

---

## 4. Core Operational Modes

### 4.1 Task Mode (`/patient`)
- **Focus:** Mobile-first, stepper-based linear intake flow.
- **Functional Requirements:**
  - Enforce minimum 44x44px touch targets on all interactive elements to prevent miss-clicks.
  - Set minimum 16px font size on all input fields to prevent iOS Safari auto-zooming.
  - Defer validation errors to `onBlur` and `onSubmit` to prevent aggressive, premature red states while typing.
  - Multi-step organization (Personal, Contact, Emergency/Medical) to minimize on-screen clutter down to 320px screens.

### 4.2 Operate Mode (`/staff`)
- **Focus:** High-density, real-time monitoring matrix.
- **Functional Requirements:**
  - Fixed-dimension cards and tabular structures that hold incoming live data without layout shifts.
  - Calm, ambient presence status tracking:
    - **Actively filling in (`typing`):** Calm solid presence indicator (no `animate-ping`).
    - **Inactive (`idle`):** Muted calm indicator signaling pause without triggering false alarms.
    - **Submitted (`submitted`):** Clear confirmation indicator upon final patient submission.

---

## 5. Voice, Tone & Aesthetic Identity
- **Clinical Health-Tech Minimalist:** Utilitarian, clean, structured, and professional. Free of ornamental gradients, unnecessary drop shadows, and whimsical animations.
- **Calm & Reassuring:** Medical hospital check-in can be stressful. Visual treatments must evoke reliability, precision, and privacy through generous white space and Agnos Brand Blue (`#0052CC`).
- **Inclusive Accessibility:** Built to conform strictly with WCAG 2.1 AA standards across typography, interactive target sizing, and color contrast.
