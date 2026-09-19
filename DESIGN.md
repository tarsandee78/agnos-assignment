# Agnos Design System & Visual Tokens (`DESIGN.md`)

> Single Source of Truth for Visual Design, Design Tokens, and Anti-Slop Guidelines for the Agnos Healthcare Platform.

---

## 1. Design Philosophy: Clinical Health-Tech
- **Clarity over Cleverness:** Healthcare interfaces must be immediately understood under stressful clinical conditions.
- **Calm Authority:** Clean white space, structured tabular layout, and purposeful color usage without visual clutter or saturated gradients.
- **Accessible by Default:** All text meets or exceeds WCAG 2.1 AA contrast requirements ($\ge 4.5:1$ for standard text, $\ge 3:1$ for large text and UI boundaries).
- **Physical Affordance on Touch:** Generous touch targets ($\ge 44\text{px}$) designed for varied motor capabilities and mobile devices.

---

## 2. Color Palette & Token System (OKLCH)

All color tokens are implemented natively in Tailwind CSS v4 via CSS variables and `@theme inline` within `src/app/globals.css`.

### 2.1 Primary & Brand Identity
| Token | OKLCH Value | sRGB Hex Fallback | Usage | Contrast vs White |
| :--- | :--- | :--- | :--- | :--- |
| `--primary` | `oklch(0.48 0.20 260.5)` | `#0052CC` | Agnos Brand Blue, primary CTA, active states | **7.2 : 1** (WCAG AAA) |
| `--primary-foreground` | `oklch(0.99 0 0)` | `#FFFFFF` | Text on primary brand elements | — |

### 2.2 Neutrals & Surfaces (Light Mode)
| Token | OKLCH Value | Semantic Role |
| :--- | :--- | :--- |
| `--background` | `oklch(0.99 0.003 250)` | Page canvas (subtle cool medical slate tint) |
| `--foreground` | `oklch(0.18 0.02 260)` | Primary readable body text (~13:1 contrast) |
| `--card` | `oklch(1 0 0)` | Clean white surface cards |
| `--card-foreground`| `oklch(0.18 0.02 260)` | Card typography |
| `--muted` | `oklch(0.96 0.008 250)` | Secondary containers, background fills |
| `--muted-foreground` | `oklch(0.45 0.03 260)`| Secondary labels, helper hints ($\ge 4.6:1$) |
| `--border` | `oklch(0.89 0.01 250)` | Structural dividers, subtle containment |
| `--input` | `oklch(0.62 0.015 250)` | Form field borders ($\ge 3:1$ UI boundary) |
| `--ring` | `oklch(0.48 0.20 260.5)` | Accessible focus indicator outline |

### 2.3 Semantic Status & Clinical Indicators
| State / Intent | Token | OKLCH Value | Role & Usage | WCAG AA Contrast |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | `--success`<br>`--success-foreground` | `oklch(0.52 0.17 145)`<br>`oklch(0.99 0 0)` | Form submitted, validated field, online status.<br>Badge fill & foreground text. | $\ge 4.5:1$ text on white;<br>$\ge 4.5:1$ foreground on fill |
| **Warning** | `--warning`<br>`--warning-foreground` | `oklch(0.68 0.16 75)`<br>`oklch(0.18 0.03 75)` | Incomplete step pill, cautionary alerts.<br>`--warning` is pill fill; `--warning-foreground` is text. | $\ge 11.2:1$ foreground on pill;<br>$\ge 12.0:1$ text on white |
| **Inactive** | `--inactive`<br>`--inactive-foreground` | `oklch(0.85 0.015 250)`<br>`oklch(0.38 0.03 260)` | Patient idle state, calm non-alarm presence pill.<br>Avoids triage anxiety with soft neutral slate. | $\ge 5.8:1$ text on white;<br>$\ge 4.5:1$ foreground on pill |
| **Destructive** | `--destructive`<br>`--destructive-foreground` | `oklch(0.50 0.22 27)`<br>`oklch(0.99 0 0)` | Validation error, critical missing input, cancel.<br>Accessible medical red. | $\ge 4.6:1$ text on white;<br>$\ge 4.6:1$ foreground on fill |
| **Info / Active** | `--info`<br>`--info-foreground` | `oklch(0.48 0.20 260.5)`<br>`oklch(0.99 0 0)` | Active typing indicator, patient guidance note.<br>Agnos brand blue tint. | $\ge 7.2:1$ text on white;<br>$\ge 7.2:1$ foreground on fill |

> [!NOTE]
> For warning indicators, the soft amber fill (`--warning`) is strictly paired with dark amber-brown text (`--warning-foreground`), guaranteeing WCAG AA $\ge 4.5:1$ compliance and avoiding low-contrast yellow text traps.

### 2.4 Dark Mode Palette Complement
The system provides a clinical dark mode preserving high contrast without harsh pure black (`#000000`):
- Canvas: `--background: oklch(0.14 0.01 260)`
- Surface: `--card: oklch(0.18 0.015 260)`
- Brand Primary: `--primary: oklch(0.65 0.18 255)` (lifted lightness for high contrast against dark ground)
- Inactive Pill: `--inactive: oklch(0.32 0.02 260)`, `--inactive-foreground: oklch(0.78 0.015 260)`
- Warning Pill: `--warning: oklch(0.75 0.16 75)`, `--warning-foreground: oklch(0.14 0.03 75)`
- Borders: `--border: oklch(0.30 0.015 260)`

---

## 3. Typography Hierarchy

### 3.1 Typefaces & CSS Mapping
- **Primary Latin Font:** `var(--font-sans)`, `var(--font-geist-sans)`, `Inter`, ui-sans-serif, system-ui, sans-serif.
- **Thai System Fallback:** `Sarabun`, `Noto Sans Thai`, sans-serif.
- **Monospace Font:** `var(--font-geist-mono)`, ui-monospace, monospace.

### 3.2 Type Scale
| Level | Font Size | Line Height | Weight | Application |
| :--- | :--- | :--- | :--- | :--- |
| `text-xs` | `12px (0.75rem)` | `16px (1rem)` | 400/500 | Metadata, helper text, status pills |
| `text-sm` | `14px (0.875rem)`| `20px (1.25rem)` | 400/500 | Input labels, secondary descriptions |
| `text-base`| **`16px (1rem)`** | `24px (1.5rem)` | 400/500 | **Form input values (prevents iOS auto-zoom)**, body copy |
| `text-lg` | `18px (1.125rem)`| `28px (1.75rem)` | 500/600 | Section subheadings, card titles |
| `text-xl` | `20px (1.25rem)` | `28px (1.75rem)` | 600 | Modal titles, step headers |
| `text-2xl` | `24px (1.5rem)` | `32px (2rem)` | 700 | Primary view headers (/patient, /staff) |
| `text-3xl` | `30px (1.875rem)`| `36px (2.25rem)` | 700/800 | Landing page hero titles |

---

## 4. Spacing, Touch Targets & Layout Rhythm

### 4.1 Spacing Scale
Based on a predictable 4px / 8px incremental grid:
- `space-1` (4px), `space-2` (8px), `space-3` (12px), `space-4` (16px), `space-6` (24px), `space-8` (32px), `space-12` (48px).

### 4.2 Universal Accessible Touch Target (WCAG 2.5.5 / 2.5.8)
- **Minimum Interactive Dimension:** **44px $\times$ 44px**
- Utility class: `.touch-target { min-height: 44px; min-width: 44px; }`
- Global base rules enforce `min-height: 44px` on all text inputs, textareas, selects, and buttons.
- Checkboxes and radio buttons enforce `20px` visual boxes with a 44px padded hit area on coarse pointer devices.

### 4.3 Corner Radii
- `--radius: 0.625rem` (10px default)
- `rounded-sm`: `6px` (`calc(var(--radius) - 4px)`)
- `rounded-md`: `8px` (`calc(var(--radius) - 2px)`)
- `rounded-lg`: `10px` (`var(--radius)`)
- `rounded-xl`: `14px` (`calc(var(--radius) + 4px)`)
- `rounded-full`: `9999px` (Pills, badges, avatar circles)

### 4.4 Elevation & Shadows
- Avoid heavy, dark drop-shadows. Use subtle tinted elevation:
  - `shadow-sm`: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
  - `shadow-md`: `0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)`
  - `shadow-card`: `0 1px 3px 0 rgb(15 23 42 / 0.08), 0 1px 2px -1px rgb(15 23 42 / 0.08)`

---

## 5. Mode Specifications

### 5.1 Task Mode (`/patient`)
- **Target Viewport:** Mobile-first (320px to 480px, responsive to desktop).
- **Stepping:** Progress indicator displaying step number, title, and percentage.
- **Form Affordance:** Accessible focus ring (`--ring`) on active input; destructive validation hints positioned directly beneath invalid fields.

### 5.2 Operate Mode (`/staff`)
- **Target Viewport:** Desktop-optimized (1280px+).
- **Layout Stability:** Tabular structures with fixed-size skeletons ensuring **Zero Cumulative Layout Shift (CLS = 0)**.
- **Calm Presence System:**
  - **Actively filling in (`typing`):** Calm solid emerald indicator dot (`bg-emerald-500`) + "Actively filling in" (no `animate-ping`)
  - **Inactive (`idle`):** Calm neutral slate dot (`bg-slate-400` / `--inactive-foreground`) + "Inactive" (prevents false-alarm triage anxiety)
  - **Submitted (`submitted`):** Solid brand/emerald badge (`bg-primary text-white`) + "Submitted"

---

## 6. Anti-Slop Guidelines (What We Reject)

To maintain exceptional clinical craft and pass `impeccable detect`:
1. ❌ **NO Arbitrary Saturated Gradients:** No purple-to-cyan or pink-to-blue hero gradients.
2. ❌ **NO Nested Card Bloat:** Never place cards inside cards with redundant borders and drop shadows.
3. ❌ **NO Floating Low-Contrast Greys:** Never use text colors lighter than `oklch(0.45 0.03 260)` on light backgrounds.
4. ❌ **NO Tiny Touch Targets:** No interactive icon-buttons or input fields smaller than 44px.
5. ❌ **NO Font Size < 16px on Mobile Inputs:** Prevents browser zoom on iOS devices.
6. ❌ **NO Unstable Live Layouts:** Staff monitoring fields must use fixed skeletons/grids so incoming character streaming never jumps content.
