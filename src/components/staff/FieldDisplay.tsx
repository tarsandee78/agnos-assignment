'use client';

import React, { useState, useEffect } from 'react';
import { useStaffStore, usePatientField } from '@/store/useStaffStore';
import { PatientFormData } from '@/lib/schemas';
import { cn } from '@/lib/utils';

// ============================================================================
// 1. Interfaces & Types (Small Interface - Matt Pocock)
// ============================================================================

export interface FieldDisplayProps<
  Section extends keyof PatientFormData = keyof PatientFormData,
  Field extends keyof PatientFormData[Section] = keyof PatientFormData[Section]
> {
  /** Label for the field (e.g. "First Name / ชื่อจริง") */
  label: string;
  /** Section key in patient form (optional when value is supplied directly) */
  section?: Section;
  /** Field key within the section */
  field?: Field;
  /** Explicit value override (e.g. for computed full name) */
  value?: React.ReactNode | string | null;
  /** Field name identifier for highlight matching (defaults to `${section}.${field}`) */
  fieldName?: string;
  /** Whether to render value in monospace font (ideal for phone numbers) */
  mono?: boolean;
  /** Optional clickable link target (e.g. `tel:0812345678` or `mailto:...`) */
  href?: string;
  /** Optional secondary info badge (e.g. calculated age) */
  subValue?: React.ReactNode;
  /** Optional icon displayed next to the label */
  icon?: React.ComponentType<{ className?: string }>;
  /** Additional custom CSS classes */
  className?: string;
}

// ============================================================================
// 2. Helper Functions (Surgical & Pure)
// ============================================================================

function isFieldMatch(target: string | undefined, active: string | null): boolean {
  if (!target || !active) return false;
  if (target === active) return true;
  const strippedTarget = target.replace(/^(personal|contact|emergency)\./, '');
  const strippedActive = active.replace(/^(personal|contact|emergency)\./, '');
  return strippedTarget === strippedActive;
}

// ============================================================================
// 3. FieldDisplay Component (Deep Module)
// ============================================================================

/**
 * Atomic Field Display Component for the Staff Intake Monitor.
 *
 * Deep Module Architecture:
 * - Granular Selectors: Consumes field data via `usePatientField` and isolates keystroke
 *   highlighting using conditional selection (`isFieldMatch ? lastFieldChangedAt : null`).
 *   Unrelated fields NEVER re-render on keystrokes.
 * - Subtle Pulse & Glow Highlight: Illuminates with an emerald accent glow when this field
 *   is modified, auto-fading after 2.5 seconds with zero layout shift.
 * - Accessible UX: WCAG 44x44px minimum touch targets on links, fallback dashes (—).
 */
export function FieldDisplay<
  Section extends keyof PatientFormData,
  Field extends keyof PatientFormData[Section]
>({
  label,
  section,
  field,
  value: propValue,
  fieldName,
  mono = false,
  href,
  subValue,
  icon: Icon,
  className,
}: FieldDisplayProps<Section, Field>) {
  // Read value via granular selector if section & field are provided
  const storeValue = section && field ? usePatientField(section, field) : undefined;
  const displayValue = propValue !== undefined ? propValue : storeValue;

  const targetField = fieldName ?? (section && field ? `${section}.${String(field)}` : undefined);

  // Conditional selector: only returns timestamp if THIS field was modified, else returns null.
  // This completely stops other fields from re-rendering on keystrokes.
  const fieldChangedAt = useStaffStore((state) =>
    isFieldMatch(targetField, state.lastFieldChanged) ? state.lastFieldChangedAt : null
  );

  const [isGlowing, setIsGlowing] = useState<boolean>(false);

  useEffect(() => {
    if (fieldChangedAt) {
      setIsGlowing(true);
      const timer = setTimeout(() => {
        setIsGlowing(false);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setIsGlowing(false);
    }
  }, [fieldChangedAt]);

  const hasValue =
    displayValue !== undefined &&
    displayValue !== null &&
    (typeof displayValue !== 'string' || displayValue.trim().length > 0);

  const renderedValue: React.ReactNode = hasValue ? (
    typeof displayValue === 'string' || React.isValidElement(displayValue) ? (
      (displayValue as React.ReactNode)
    ) : (
      String(displayValue)
    )
  ) : (
    <span className="text-muted-foreground/60 italic font-normal">—</span>
  );

  return (
    <div
      data-field-name={targetField}
      className={cn(
        // Zero-CLS layout: constant padding and border dimensions
        'relative rounded-lg border px-3 py-2.5 transition-all duration-700 ease-out',
        isGlowing
          ? 'border-emerald-500/60 bg-emerald-500/12 text-emerald-950 dark:text-emerald-50 ring-2 ring-emerald-500/25 shadow-[0_0_14px_rgba(16,185,129,0.22)]'
          : 'border-border/50 bg-muted/25 text-foreground hover:bg-muted/40',
        className
      )}
    >
      {/* Top row: Label, Icon, and Live Typing Indicator */}
      <div className="flex items-center justify-between gap-1.5 mb-1">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
          <span>{label}</span>
        </span>

        {isGlowing && (
          <span
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse shrink-0"
          >
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>Updated</span>
          </span>
        )}
      </div>

      {/* Bottom row: Value & Optional SubValue */}
      <div className="flex flex-wrap items-baseline gap-2">
        <div
          className={cn(
            'text-sm font-semibold text-foreground break-words min-w-0 flex-1',
            mono && 'font-mono tracking-tight'
          )}
        >
          {href && hasValue ? (
            <a
              href={href}
              className="text-primary hover:underline hover:text-primary/90 inline-flex items-center min-h-[44px] py-1 text-sm font-semibold touch-target transition-colors"
            >
              {renderedValue}
            </a>
          ) : (
            renderedValue
          )}
        </div>

        {subValue && (
          <div className="shrink-0 text-xs font-medium text-muted-foreground">
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
}
