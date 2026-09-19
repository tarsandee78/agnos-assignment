import React from 'react';
import { cn } from '@/lib/utils';
import type { PatientPresenceStatus } from '@/lib/realtime';
import { type TranslationDictionary } from '@/lib/i18n/translations';

// ============================================================================
// 1. Types & Interfaces
// ============================================================================

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: PatientPresenceStatus;
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
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    dotClass: 'bg-emerald-500',
  },
  idle: {
    defaultLabel: 'Inactive',
    badgeClass:
      'border-inactive bg-inactive/30 text-inactive-foreground',
    dotClass: 'bg-inactive-foreground/70',
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
 * Supports localized status labels and maintains zero layout shift across state changes.
 */
export function StatusBadge({
  status,
  className,
  t,
  ...props
}: StatusBadgeProps) {
  const config = STATUS_CONFIGS[status] ?? STATUS_CONFIGS.offline;
  const label = t?.staff.presence[status] ?? config.defaultLabel;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        // Zero-CLS layout: fixed width, centered content, no layout shifts across states
        'inline-flex min-w-[155px] items-center justify-center gap-1.5 rounded-full border px-3 py-1',
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
      <span>{label}</span>
    </div>
  );
}
