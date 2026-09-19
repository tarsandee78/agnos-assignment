'use client';

import React, { useState, useEffect } from 'react';
import {
  useStaffStore,
  usePatientStatus,
  useConnectionStatus,
  useLastFieldChangedAt,
} from '@/store/useStaffStore';
import { StatusBadge } from './StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DEFAULT_ROOM_ID, RealtimeConnectionStatus } from '@/lib/realtime';
import { cn } from '@/lib/utils';
import {
  Wifi,
  WifiOff,
  Activity,
  RotateCcw,
  Clock,
  CheckCircle2,
  Radio,
} from 'lucide-react';

// ============================================================================
// 1. Types & Interfaces
// ============================================================================

export interface StaffHeaderProps {
  roomId?: string;
  className?: string;
}

// ============================================================================
// 2. Activity / Inactivity Time Indicator (Isolated Sub-component)
// ============================================================================

/**
 * Isolated timer component that tracks inactivity or last-active duration.
 * Runs a 1-second interval only during idle state to prevent re-rendering the header or page.
 */
function ActivityTimeIndicator() {
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
        <span>Submitted at {formattedTime}</span>
      </span>
    );
  }

  if (patientStatus === 'typing') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
        <Clock className="size-3.5 shrink-0" />
        <span>Active just now</span>
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
      <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium tabular-nums">
        <Clock className="size-3.5 shrink-0" />
        <span>Inactive for {formattedElapsed}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="size-3.5 shrink-0" />
      <span>No active session</span>
    </span>
  );
}

// ============================================================================
// 3. Connection Status Configuration & Sub-component
// ============================================================================

interface ConnectionConfig {
  label: string;
  badgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CONNECTION_CONFIGS: Record<RealtimeConnectionStatus, ConnectionConfig> = {
  CONNECTED: {
    label: 'Connected (Supabase)',
    badgeClass:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    icon: Wifi,
  },
  FALLBACK_LOCAL: {
    label: 'Local Fallback (BroadcastChannel)',
    badgeClass:
      'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    icon: Activity,
  },
  CONNECTING: {
    label: 'Connecting...',
    badgeClass:
      'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 animate-pulse',
    icon: Activity,
  },
  DISCONNECTED: {
    label: 'Disconnected',
    badgeClass:
      'border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
    icon: WifiOff,
  },
};

function ConnectionStatusBadge({ status }: { status: RealtimeConnectionStatus }) {
  const config = CONNECTION_CONFIGS[status] ?? CONNECTION_CONFIGS.DISCONNECTED;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 font-medium whitespace-nowrap', config.badgeClass)}
    >
      <Icon className="size-3.5 shrink-0" />
      <span>{config.label}</span>
    </Badge>
  );
}

// ============================================================================
// 4. StaffHeader Component
// ============================================================================

/**
 * Modular Staff Dashboard Header.
 *
 * Encapsulates system title, room status, connection badges, Zero-CLS patient presence badge,
 * elapsed inactivity timer, and state reset actions. Complies with 44px healthcare touch targets.
 */
export function StaffHeader({
  roomId = DEFAULT_ROOM_ID,
  className,
}: StaffHeaderProps) {
  const patientStatus = usePatientStatus();
  const connectionStatus = useConnectionStatus();
  const resetStaffState = useStaffStore((state) => state.resetStaffState);

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
            Staff Monitoring Dashboard
          </h1>
          <Badge variant="secondary" className="gap-1 text-xs">
            <Radio className="size-3 text-emerald-500" />
            <span>Real-Time</span>
          </Badge>
          <Badge
            variant="outline"
            className="text-xs text-muted-foreground font-mono"
            title={`Active Room: ${roomId}`}
          >
            Room: {roomId}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Live patient intake monitoring and presence synchronization
        </p>
      </div>

      {/* Real-time Status Badges & Controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <ConnectionStatusBadge status={connectionStatus} />

        {/* Zero-CLS Status Badge */}
        <StatusBadge status={patientStatus} />

        {/* Inactivity / Activity Duration Indicator (visible on all viewports) */}
        <div className="flex items-center px-2.5 py-1.5 rounded-md bg-muted/40 border text-xs min-h-[36px]">
          <ActivityTimeIndicator />
        </div>

        {/* Reset State Button (Accessible 44x44px touch target per AGENTS.md §4.4) */}
        <Button
          variant="outline"
          size="sm"
          onClick={resetStaffState}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground min-h-[44px] px-3 touch-target"
          title="Reset intake monitor state"
        >
          <RotateCcw className="size-3.5" />
          <span>Reset State</span>
        </Button>
      </div>
    </header>
  );
}
