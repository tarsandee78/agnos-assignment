'use client';

import React, { useState, useEffect } from 'react';
import {
  useStaffStore,
  usePatientStatus,
  useConnectionStatus,
  useLastFieldChangedAt,
} from '@/store/useStaffStore';
import { StatusBadge } from './StatusBadge';
import { NextPatientDialog } from './NextPatientDialog';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Badge } from '@/components/ui/badge';
import { DEFAULT_ROOM_ID, RealtimeConnectionStatus } from '@/lib/realtime';
import { cn } from '@/lib/utils';
import {
  Wifi,
  WifiOff,
  Activity,
  Clock,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { type Language, type TranslationDictionary } from '@/lib/i18n/translations';

// ============================================================================
// 1. Types & Interfaces
// ============================================================================

export interface StaffHeaderProps {
  roomId?: string;
  className?: string;
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
  t?: TranslationDictionary;
}

// ============================================================================
// 2. Activity / Inactivity Time Indicator (Isolated Sub-component)
// ============================================================================

function ActivityTimeIndicator({ t }: { t?: TranslationDictionary }) {
  const patientStatus = usePatientStatus();
  const lastFieldChangedAt = useLastFieldChangedAt();
  const isSubmitted = useStaffStore((s) => s.isSubmitted);
  const submittedAt = useStaffStore((s) => s.submittedAt);

  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    // Only tick when in idle state where elapsed seconds must increment live
    if (patientStatus !== 'idle') {
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [patientStatus]);

  if (isSubmitted || patientStatus === 'submitted') {
    const formattedTime = submittedAt
      ? new Date(submittedAt).toLocaleTimeString()
      : 'Just now';
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
        <CheckCircle2 className="size-3.5 shrink-0" />
        <span>{t?.staff.time.submittedAt(formattedTime) ?? `Submitted at ${formattedTime}`}</span>
      </span>
    );
  }

  if (patientStatus === 'typing') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
        <Clock className="size-3.5 shrink-0 text-emerald-600" />
        <span>{t?.staff.time.activeNow ?? 'Active just now'}</span>
      </span>
    );
  }

  if (patientStatus === 'idle') {
    const referenceTime = lastFieldChangedAt ?? now;
    const elapsedSeconds = Math.max(0, Math.floor((now - referenceTime) / 1000));

    const formattedElapsed =
      elapsedSeconds < 60
        ? `${elapsedSeconds}s`
        : `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`;

    return (
      <span className="inline-flex items-center gap-1 text-xs text-inactive-foreground font-medium tabular-nums">
        <Clock className="size-3.5 shrink-0 text-inactive-foreground/80" />
        <span>{t?.staff.time.inactiveFor(formattedElapsed) ?? `Inactive for ${formattedElapsed}`}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="size-3.5 shrink-0" />
      <span>{t?.staff.presence.offline ?? 'Waiting for patient'}</span>
    </span>
  );
}

// ============================================================================
// 3. Connection Status Configuration & Sub-component
// ============================================================================

function ConnectionStatusBadge({
  status,
  t,
}: {
  status: RealtimeConnectionStatus;
  t?: TranslationDictionary;
}) {
  let label = 'Disconnected';
  let badgeClass = 'border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400';
  let Icon = WifiOff;

  if (status === 'CONNECTED') {
    label = t?.staff.connection.connected ?? 'Connected (Supabase)';
    badgeClass = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    Icon = Wifi;
  } else if (status === 'FALLBACK_LOCAL') {
    label = t?.staff.connection.fallback ?? 'Local Fallback (BroadcastChannel)';
    badgeClass = 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400';
    Icon = Activity;
  } else if (status === 'CONNECTING') {
    label = t?.staff.connection.connecting ?? 'Connecting...';
    badgeClass = 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 animate-pulse';
    Icon = Activity;
  }

  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 font-medium whitespace-nowrap', badgeClass)}
    >
      <Icon className="size-3.5 shrink-0" />
      <span>{label}</span>
    </Badge>
  );
}

// ============================================================================
// 4. StaffHeader Component
// ============================================================================

export function StaffHeader({
  roomId = DEFAULT_ROOM_ID,
  className,
  lang = 'th',
  onLanguageChange,
  t,
}: StaffHeaderProps) {
  const patientStatus = usePatientStatus();
  const connectionStatus = useConnectionStatus();

  return (
    <header
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5',
        className
      )}
    >
      {/* Title & Context Information */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {t?.staff.dashboardTitle ?? 'Staff Monitoring Dashboard'}
          </h1>
          <Badge variant="secondary" className="gap-1 text-xs">
            <Radio className="size-3 text-emerald-500" />
            <span>{t?.staff.realtime ?? 'Real-Time'}</span>
          </Badge>
          <Badge
            variant="outline"
            className="text-xs text-muted-foreground font-mono"
            title={`Active Room: ${roomId}`}
          >
            {t?.staff.room ?? 'Room'}: {roomId}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {t?.staff.dashboardSubtitle ?? 'Live patient intake monitoring and presence synchronization'}
        </p>
      </div>

      {/* Real-time Status Badges & Controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {onLanguageChange && (
          <LanguageToggle
            currentLang={lang}
            onLanguageChange={onLanguageChange}
          />
        )}

        <ConnectionStatusBadge status={connectionStatus} t={t} />

        {/* Zero-CLS Status Badge */}
        <StatusBadge status={patientStatus} t={t} />

        {/* Inactivity / Activity Duration Indicator */}
        <div className="flex items-center px-2.5 py-1.5 rounded-md bg-muted/40 border text-xs min-h-[36px]">
          <ActivityTimeIndicator t={t} />
        </div>

        {/* Next Patient / Clear Session Action */}
        <NextPatientDialog t={t} />
      </div>
    </header>
  );
}
