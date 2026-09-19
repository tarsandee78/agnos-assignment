# Product Context & Durable Truth

## 1. Product Identity & Purpose
**Agnos Real-Time Patient Intake & Staff Monitoring System** is a mission-critical clinical health-tech application bridging patients and healthcare staff during outpatient intake.
The system provides zero-friction, accessible personal detail intake on mobile devices for patients, paired with a high-density, real-time dashboard for triage nurses and medical registrars to oversee intake live without database overhead.

---

## 2. Target Audiences & Use Cases

### A. Patients (`/patient`)
- **Demographics:** All demographics, ranging from tech-savvy young adults to elderly patients and individuals under physical or emotional stress during hospital check-in.
- **Needs:** Low cognitive load, crystal-clear typography, accessible touch targets, and reassurance that their confidential health details are submitted securely and accurately.
- **Environment:** Mobile devices (iOS Safari, Android Chrome) in hospital waiting areas, often on cellular networks or spotty guest Wi-Fi.

### B. Medical Staff (`/staff`)
- **Demographics:** Hospital triage staff, nurses, receptionists, and medical records administrators.
- **Needs:** Rapid glanceability, high information density, live progress tracking as patients fill in details, and clear status indicators (Actively filling in, Idle, Submitted).
- **Environment:** Desktop workstations (Full HD / ultrawide monitors) with multi-window workflows where zero cumulative layout shift (CLS = 0) and low-noise presence updates are vital.

---

## 3. Core Operational Modes

### 1. Task Mode (`/patient`)
- **Design Priority:** Single-focus progression, distraction-free clinical wizard.
- **Mobile-First UX:**
  - Strict minimum touch targets: **44x44px** (`min-h-[44px]`, `min-w-[44px]`) on all interactive inputs, buttons, checkboxes, and select controls (WCAG 2.5.5 / 2.5.8).
  - Font Size: **16px (`text-base`)** minimum on all form inputs to prevent iOS Safari auto-zoom behavior.
  - Step Progression: Stepper layout dividing Personal, Contact, and Medical/Emergency information to reduce cognitive strain down to 320px viewport widths.
  - Validation UX: Validation triggered `onBlur` or `onSubmit` via Zod to avoid aggressive, premature error states while typing.

### 2. Operate Mode (`/staff`)
- **Design Priority:** Real-time visibility, fast scannability, and operational stability.
- **Desktop-Optimized Dashboard:**
  - High information density with tabular cards and clear semantic grouping.
  - **Zero Layout Shift (CLS = 0):** Stable UI containers where live-streamed keystrokes never cause visual jumping or resizing.
  - **Calm Presence System:** Subtle, non-intrusive status badges:
    - `typing` / **Actively filling in**: Pulse green indicator
    - `idle` / **Inactive**: Calm amber/gray indicator
    - `submitted` / **Submitted**: Solid emerald badge
  - Direct peer-to-peer sync via Supabase Realtime Broadcast & Presence channels (with BroadcastChannel fallback for multi-tab testing).

---

## 4. Voice, Tone & Aesthetic Principles
- **Clinical Health-Tech Minimalist:** Clean, professional, and uncluttered. Avoid decorative fluff, aggressive gradients, or playful cartoonish elements.
- **Calm & Reassuring:** Medical hospital visits inherently induce anxiety; the interface uses soothing neutrals and precise Agnos Brand Blue (`#0052CC`) to evoke trust, security, and competence.
- **Inclusive Accessibility:** Built from the foundation up to meet WCAG AA standards with minimum contrast ratio $\ge 4.5:1$ across all informational text and interactive components.
