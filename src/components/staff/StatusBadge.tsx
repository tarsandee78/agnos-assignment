import React from 'react';
import { cn } from '@/lib/utils';
import type { PatientPresenceStatus } from '@/lib/realtime';

// ============================================================================
// 1. Types & Interfaces
// ============================================================================

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: PatientPresenceStatus;
  className?: string;
}

// ============================================================================
// 2. Status Configurations (Colors, Labels & Indicator Dots)
// ============================================================================

interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

const STATUS_CONFIGS: Record<PatientPresenceStatus, StatusConfig> = {
  typing: {
    label: 'Actively filling in',
    badgeClass:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    dotClass: 'bg-emerald-500',
  },
  idle: {
    label: 'Inactive',
    badgeClass:
      'border-slate-300/70 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300',
    dotClass: 'bg-slate-400 dark:bg-slate-500',
  },
  submitted: {
    label: 'Submitted',
    badgeClass:
      'border-primary/30 bg-primary/10 text-primary',
    dotClass: 'bg-primary',
  },
  offline: {
    label: 'Waiting for patient',
    badgeClass:
      'border-border bg-muted/60 text-muted-foreground',
    dotClass: 'bg-muted-foreground/50',
  },
};

// ============================================================================
// 3. StatusBadge Component (Zero-CLS Design)
// ============================================================================

/**
 * Zero-CLS Patient Presence Status Badge.
 *
 * Designed with a rock-solid width (`w-[160px] min-w-[160px]`) and centered flex layout
 * to ensure Cumulative Layout Shift (CLS) = 0 during presence transitions between
 * 'typing', 'idle', 'submitted', and 'offline'.
 */
export function StatusBadge({
  status,
  className,
  ...props
}: StatusBadgeProps) {
  const config = STATUS_CONFIGS[status] ?? STATUS_CONFIGS.offline;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        // Zero-CLS layout: fixed width, centered content, no layout shifts across states
        'inline-flex w-[160px] min-w-[160px] items-center justify-center gap-1.5 rounded-full border px-3 py-1',
        'text-xs font-semibold whitespace-nowrap select-none transition-colors duration-150',
        config.badgeClass,
        className
      )}
      {...props}
    >
      <span
        className={cn('size-2 rounded-full shrink-0 transition-colors duration-200', config.dotClass)}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </div>
  );
}
