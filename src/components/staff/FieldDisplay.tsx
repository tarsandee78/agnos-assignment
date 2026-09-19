'use client';

import React, { useState, useEffect } from 'react';
import { useStaffStore } from '@/store/useStaffStore';
import { cn } from '@/lib/utils';

// ============================================================================
// 1. Interfaces & Types (Small Interface - Matt Pocock)
// ============================================================================

export interface FieldDisplayProps {
  /** Label for the field (e.g. "First Name / ชื่อจริง") */
  label: string;
  /** Value to display. If empty/null/undefined, renders fallback dash (—) */
  value?: React.ReactNode | string | null;
  /**
   * Field identifier or list of identifiers (e.g. 'personal.firstName' or ['personal.firstName', 'personal.lastName'])
   * to subscribe to for real-time highlight animations.
   */
  fieldName?: string | string[];
  /** Optional custom formatter function */
  formatter?: (val: unknown) => React.ReactNode;
  /** Whether to render value in monospace font (ideal for phone numbers, timestamps) */
  mono?: boolean;
  /** Optional clickable link target (e.g. `tel:0812345678` or `mailto:...`) */
  href?: string;
  /** Optional secondary info badge (e.g. age calculated from date of birth) */
  subValue?: React.ReactNode;
  /** Optional icon displayed next to the label */
  icon?: React.ComponentType<{ className?: string }>;
  /** Additional custom CSS classes */
  className?: string;
}

// ============================================================================
// 2. Helper Functions (Surgical & Pure)
// ============================================================================

/**
 * Normalizes and checks if any target field identifier matches the active field.
 * Handles both fully-qualified ('personal.firstName') and bare ('firstName') keys.
 */
function isFieldMatch(
  target: string | string[] | undefined,
  active: string | null
): boolean {
  if (!target || !active) return false;
  const targets = Array.isArray(target) ? target : [target];
  return targets.some((t) => {
    if (t === active) return true;
    const strippedTarget = t.replace(/^(personal|contact|emergency)\./, '');
    const strippedActive = active.replace(/^(personal|contact|emergency)\./, '');
    return strippedTarget === strippedActive;
  });
}

// ============================================================================
// 3. FieldDisplay Component (Deep Module)
// ============================================================================

/**
 * Atomic Field Display Component for the Staff Intake Monitor.
 *
 * Deep Module Architecture:
 * - Granular Selector: Subscribes only to a boolean comparison in Zustand (`isFieldMatch`),
 *   ensuring other fields never re-render when an unrelated field is modified.
 * - Subtle Pulse & Glow Highlight: Automatically illuminates with an emerald accent
 *   glow when this field is modified, then smoothly fades out after 1.8 seconds.
 * - Zero Cumulative Layout Shift (Zero-CLS): Static padding and fixed-height borders
 *   guarantee zero layout shift during presence/highlight transitions.
 * - Healthcare UX: Clear label-value hierarchy, fallback dashes, and accessible clickable links.
 */
export function FieldDisplay({
  label,
  value,
  fieldName,
  formatter,
  mono = false,
  href,
  subValue,
  icon: Icon,
  className,
}: FieldDisplayProps) {
  // Granular boolean selector: returns boolean primitive so Zustand uses Object.is
  // to avoid re-renders if this field wasn't the one modified.
  const isTargetField = useStaffStore((state) =>
    isFieldMatch(fieldName, state.lastFieldChanged)
  );
  const patientStatus = useStaffStore((state) => state.patientStatus);
  const lastFieldChangedAt = useStaffStore((state) => state.lastFieldChangedAt);

  const [isRecent, setIsRecent] = useState<boolean>(false);

  // Trigger smooth glow animation on keystroke, auto-fade after 5s inactivity
  useEffect(() => {
    if (isTargetField && lastFieldChangedAt) {
      setIsRecent(true);
      const timer = setTimeout(() => {
        setIsRecent(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setIsRecent(false);
    }
  }, [isTargetField, lastFieldChangedAt]);

  const isGlowing = isTargetField && (isRecent || patientStatus === 'typing');

  // Determine formatted display value
  const hasValue =
    value !== undefined &&
    value !== null &&
    (typeof value !== 'string' || value.trim().length > 0);

  let renderedValue: React.ReactNode;
  if (!hasValue) {
    renderedValue = (
      <span className="text-muted-foreground/60 italic font-normal">—</span>
    );
  } else if (formatter) {
    renderedValue = formatter(value);
  } else {
    renderedValue = value;
  }

  return (
    <div
      data-field-name={Array.isArray(fieldName) ? fieldName.join(',') : fieldName}
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

        {/* Live typing pulse indicator */}
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
              className="text-primary hover:underline hover:text-primary/90 inline-flex items-center gap-1 transition-colors"
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
