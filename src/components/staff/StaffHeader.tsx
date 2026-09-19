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
// 2. Connection Status Configuration & Sub-component
// ============================================================================

function getConnectionConfig(
  status: RealtimeConnectionStatus,
  t?: TranslationDictionary
) {
  const map: Record<
    RealtimeConnectionStatus,
    { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    CONNECTED: {
      label: t?.staff.connection.connected ?? 'Connected',
      badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      icon: Wifi,
    },
    FALLBACK_LOCAL: {
      label: t?.staff.connection.fallback ?? 'Local Fallback',
      badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
      icon: Activity,
    },
    CONNECTING: {
      label: t?.staff.connection.connecting ?? 'Connecting...',
      badgeClass: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 animate-pulse',
      icon: Activity,
    },
    DISCONNECTED: {
      label: t?.staff.connection.disconnected ?? 'Disconnected',
      badgeClass: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
      icon: WifiOff,
    },
  };
  return map[status] ?? map.DISCONNECTED;
}

function ConnectionStatusBadge({
  status,
  t,
}: {
  status: RealtimeConnectionStatus;
  t?: TranslationDictionary;
}) {
  const config = getConnectionConfig(status, t);
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn('h-9 px-3 gap-1.5 font-medium whitespace-nowrap text-xs select-none', config.badgeClass)}
    >
      <Icon className="size-3.5 shrink-0" />
      <span>{config.label}</span>
    </Badge>
  );
}

// ============================================================================
// 3. StaffHeader Component
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
  const lastFieldChangedAt = useLastFieldChangedAt();
  const isSubmitted = useStaffStore((s) => s.isSubmitted);
  const submittedAt = useStaffStore((s) => s.submittedAt);

  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    if (patientStatus !== 'idle') return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [patientStatus]);

  const referenceTime = lastFieldChangedAt ?? now;
  const elapsedSeconds = Math.max(0, Math.floor((now - referenceTime) / 1000));
  const effectiveStatus = isSubmitted ? 'submitted' : patientStatus;

  return (
    <header
      className={cn(
        'flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b pb-5',
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

      {/* Real-time Status Badges & Controls (Unified Single Row on Desktop) */}
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 sm:gap-2.5 shrink-0">
        {onLanguageChange && (
          <LanguageToggle
            currentLang={lang}
            onLanguageChange={onLanguageChange}
          />
        )}

        <ConnectionStatusBadge status={connectionStatus} t={t} />

        {/* Consolidated Zero-CLS Status Badge with integrated elapsed time */}
        <StatusBadge
          status={effectiveStatus}
          elapsedSeconds={elapsedSeconds}
          submittedAt={submittedAt}
          t={t}
        />

        {/* Next Patient / Clear Session Action */}
        <NextPatientDialog t={t} />
      </div>
    </header>
  );
}
