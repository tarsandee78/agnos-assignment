'use client';

import React, { useState, useEffect } from 'react';
import { useStaffStore, usePatientField } from '@/store/useStaffStore';
import { PatientFormData } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { type TranslationDictionary } from '@/lib/i18n/translations';

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
  /** Field name identifier or list of identifiers for highlight matching (defaults to `${section}.${field}`) */
  fieldName?: string | string[];
  /** Whether to render value in monospace font (ideal for phone numbers) */
  mono?: boolean;
  /** Optional clickable link target (e.g. `tel:0812345678` or `mailto:...`) */
  href?: string;
  /** Optional secondary info badge (e.g. calculated age) */
  subValue?: React.ReactNode;
  /** Optional icon displayed next to the label */
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional translation dictionary */
  t?: TranslationDictionary;
  /** Additional custom CSS classes */
  className?: string;
}

// ============================================================================
// 2. Helper Functions (Surgical & Pure)
// ============================================================================

function isFieldMatch(target: string | string[] | undefined, active: string | null): boolean {
  if (!target || !active) return false;
  if (Array.isArray(target)) {
    return target.some((t) => isFieldMatch(t, active));
  }
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
 *   is modified, auto-fading after 1.5 seconds with zero layout shift.
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
  t,
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
  const [isTyping, setIsTyping] = useState<boolean>(false);

  useEffect(() => {
    if (fieldChangedAt) {
      setIsTyping(true);
      setIsGlowing(true);

      // Show brief skeleton shimmer for 400ms so staff notice the field is actively being filled
      const typingTimer = setTimeout(() => {
        setIsTyping(false);
      }, 400);

      // Keep subtle updated glow for 1.8s
      const glowTimer = setTimeout(() => {
        setIsGlowing(false);
      }, 1800);

      return () => {
        clearTimeout(typingTimer);
        clearTimeout(glowTimer);
      };
    } else {
      setIsTyping(false);
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
    <span className="text-muted-foreground/50 font-normal select-none">—</span>
  );

  return (
    <div
      data-field-name={Array.isArray(targetField) ? targetField.join(',') : targetField}
      className={cn(
        // Zero-CLS layout: constant padding, min-height and border dimensions
        'relative rounded-lg border px-3 py-2.5 transition-all duration-200 ease-out font-sans min-h-[68px] flex flex-col justify-center',
        isTyping
          ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/30 text-foreground'
          : isGlowing
          ? 'border-emerald-500/50 bg-emerald-500/10 text-foreground'
          : 'border-border/60 bg-muted/20 text-foreground hover:bg-muted/30',
        className
      )}
    >
      {/* Top row: Label, Icon, and Live Typing / Updated Indicator */}
      <div className="flex items-center justify-between gap-1.5 mb-1">
        <span className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground">
          {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
          <span>{label}</span>
        </span>

        {isTyping ? (
          <span
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary shrink-0 animate-pulse select-none"
          >
            <span className="size-1.5 rounded-full bg-primary animate-ping" aria-hidden="true" />
            <span>{t?.staff.fieldStatus?.typing ?? 'Typing...'}</span>
          </span>
        ) : isGlowing ? (
          <span
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0 transition-opacity duration-150 animate-in fade-in select-none"
          >
            <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" aria-hidden="true" />
            <span>{t?.staff.fieldStatus?.updated ?? 'Updated'}</span>
          </span>
        ) : null}
      </div>

      {/* Bottom row: Value, Skeleton Shimmer, & Optional SubValue */}
      <div className="flex flex-wrap items-baseline gap-2 min-h-[26px]">
        {isTyping ? (
          <div className="flex items-center gap-2 h-6 select-none" aria-label="Typing input...">
            <div className="h-4 w-24 sm:w-28 rounded bg-primary/20 animate-pulse" />
            <span className="inline-flex gap-1 items-center">
              <span className="size-1.5 rounded-full bg-primary animate-pulse [animation-delay:-0.3s]" />
              <span className="size-1.5 rounded-full bg-primary animate-pulse [animation-delay:-0.15s]" />
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            </span>
          </div>
        ) : (
          <div
            className={cn(
              'text-sm sm:text-base font-semibold text-foreground break-words min-w-0 flex-1 transition-all duration-300',
              isGlowing && 'animate-in fade-in zoom-in-95 duration-200',
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
        )}

        {subValue && !isTyping && (
          <div className="shrink-0 text-xs font-medium text-muted-foreground animate-in fade-in">
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
}
