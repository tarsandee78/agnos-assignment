import React from 'react';
import { cn } from '@/lib/utils';
import type { PatientPresenceStatus } from '@/lib/realtime';
import { type TranslationDictionary } from '@/lib/i18n/translations';

// ============================================================================
// 1. Types & Interfaces
// ============================================================================

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: PatientPresenceStatus;
  elapsedSeconds?: number;
  submittedAt?: string | null;
  className?: string;
  t?: TranslationDictionary;
}

// ============================================================================
// 2. Status Configurations (Colors & Indicator Dots)
// ============================================================================

interface StatusConfig {
  defaultLabel: string;
  badgeClass: string;
  dotClass: string;
}

const STATUS_CONFIGS: Record<PatientPresenceStatus, StatusConfig> = {
  typing: {
    defaultLabel: 'Actively filling in',
    badgeClass:
      'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    dotClass: 'bg-emerald-500',
  },
  idle: {
    defaultLabel: 'Inactive',
    badgeClass:
      'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 tabular-nums',
    dotClass: 'bg-amber-500',
  },
  submitted: {
    defaultLabel: 'Submitted',
    badgeClass:
      'border-primary/30 bg-primary/10 text-primary',
    dotClass: 'bg-primary',
  },
  offline: {
    defaultLabel: 'Waiting for patient',
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
 * Consolidates presence state and active duration into a single accessible badge.
 * Maintains zero layout shift across state transitions.
 */
export function StatusBadge({
  status,
  elapsedSeconds,
  submittedAt,
  className,
  t,
  ...props
}: StatusBadgeProps) {
  const config = STATUS_CONFIGS[status] ?? STATUS_CONFIGS.offline;

  let label = t?.staff.presence[status] ?? config.defaultLabel;

  if (status === 'idle' && elapsedSeconds !== undefined && elapsedSeconds > 0) {
    const formattedElapsed =
      elapsedSeconds < 60
        ? `${elapsedSeconds}s`
        : `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`;
    label = t?.staff.time.inactiveFor(formattedElapsed) ?? `Inactive (${formattedElapsed})`;
  } else if (status === 'submitted') {
    const formattedTime = submittedAt
      ? new Date(submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    if (formattedTime) {
      label = t?.staff.time.submittedAt(formattedTime) ?? `Submitted (${formattedTime})`;
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        // Zero-CLS layout: fixed width, centered content, no layout shifts across states
        'inline-flex min-w-[155px] sm:min-w-[170px] h-9 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5',
        'text-xs font-semibold whitespace-nowrap select-none transition-colors duration-150',
        config.badgeClass,
        className
      )}
      {...props}
    >
      {status === 'typing' ? (
        <span className="relative flex size-2 shrink-0" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
        </span>
      ) : (
        <span
          className={cn('size-2 rounded-full shrink-0 transition-colors duration-200', config.dotClass)}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </div>
  );
}
