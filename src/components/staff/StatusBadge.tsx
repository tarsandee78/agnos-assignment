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
  hasPing?: boolean;
}

const STATUS_CONFIGS: Record<PatientPresenceStatus, StatusConfig> = {
  typing: {
    label: 'Actively filling in',
    badgeClass:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
    hasPing: true,
  },
  idle: {
    label: 'Inactive',
    badgeClass:
      'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    dotClass: 'bg-amber-500',
    hasPing: false,
  },
  submitted: {
    label: 'Submitted',
    badgeClass:
      'border-primary/30 bg-primary/10 text-primary',
    dotClass: 'bg-primary',
    hasPing: false,
  },
  offline: {
    label: 'Waiting for patient',
    badgeClass:
      'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
    dotClass: 'bg-zinc-400 dark:bg-zinc-500',
    hasPing: false,
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
      <span className="relative flex size-2 shrink-0 items-center justify-center" aria-hidden="true">
        {config.hasPing && (
          <span
            className={cn(
              'absolute inline-flex size-full animate-ping rounded-full opacity-75',
              config.dotClass
            )}
          />
        )}
        <span className={cn('relative inline-flex size-2 rounded-full', config.dotClass)} />
      </span>
      <span>{config.label}</span>
    </div>
  );
}
