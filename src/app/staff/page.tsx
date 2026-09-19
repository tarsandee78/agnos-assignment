'use client';

import React from 'react';
import { useStaffRealtime } from '@/hooks/useStaffRealtime';
import { useStaffStore } from '@/store/useStaffStore';
import { StaffHeader } from '@/components/staff/StaffHeader';
import { StatusBadge } from '@/components/staff/StatusBadge';
import { PatientOverviewCards } from '@/components/staff/PatientOverviewCard';
import { NextPatientDialog } from '@/components/staff/NextPatientDialog';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { PatientPresenceStatus } from '@/lib/realtime';

// ============================================================================
// 1. Constants & Display Configurations
// ============================================================================

const STEP_LABELS: Record<number, string> = {
  1: '1. Personal Details',
  2: '2. Contact Information',
  3: '3. Emergency & Review',
};

const STEP_DESCRIPTIONS: Record<number, string> = {
  1: 'Personal details section',
  2: 'Contact information section',
  3: 'Emergency contact & review',
};

const PATIENT_STATUS_DESCRIPTIONS: Record<PatientPresenceStatus, string> = {
  typing: 'Receiving real-time typing events',
  idle: 'Inactivity detected (> 5s)',
  submitted: 'Intake form complete',
  offline: 'No active patient detected',
};

// ============================================================================
// 2. Staff Dashboard Page Component
// ============================================================================

/**
 * Staff Monitoring Dashboard Page.
 *
 * Architecture:
 * - Subscribes to real-time events via `useStaffRealtime`.
 * - Employs deep domain modules: `StaffHeader`, `StatusBadge`, and `PatientOverviewCards`.
 * - Encapsulates all granular keystroke mirroring and field highlight animations
 *   inside `FieldDisplay` and `PatientOverviewCards`, keeping this page declarative and clean.
 */
export default function StaffPage() {
  // Subscribe to real-time room events (Supabase + BroadcastChannel fallback)
  useStaffRealtime();

  // Read status & progress state from Zustand store
  const lastFieldChanged = useStaffStore((state) => state.lastFieldChanged);
  const lastFieldChangedAt = useStaffStore((state) => state.lastFieldChangedAt);
  const currentStep = useStaffStore((state) => state.currentStep);
  const patientStatus = useStaffStore((state) => state.patientStatus);
  const isSubmitted = useStaffStore((state) => state.isSubmitted);
  const submittedAt = useStaffStore((state) => state.submittedAt);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Header & Status Bar */}
        <StaffHeader />

        {/* Submission Confirmation Banner */}
        {isSubmitted && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-200 shadow-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-semibold text-sm">
                  Patient Form Submitted Successfully
                </p>
                <p className="text-xs opacity-90">
                  Submitted at: {submittedAt ? new Date(submittedAt).toLocaleTimeString() : 'Just now'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                Completed
              </Badge>
              <NextPatientDialog
                label="Prepare Next Patient"
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card size="sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Current Intake Step
              </CardTitle>
              <Layers className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {STEP_LABELS[currentStep] || `Step ${currentStep}`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {STEP_DESCRIPTIONS[currentStep] || ''}
              </p>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Last Field Modified
              </CardTitle>
              <Sparkles className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold font-mono truncate">
                {lastFieldChanged || 'No input yet'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {lastFieldChangedAt
                  ? `Updated at ${new Date(lastFieldChangedAt).toLocaleTimeString()}`
                  : 'Waiting for patient keystrokes'}
              </p>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Patient Status
              </CardTitle>
              <Clock className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="pt-0.5">
                <StatusBadge status={patientStatus} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {PATIENT_STATUS_DESCRIPTIONS[patientStatus] || ''}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Live Patient Intake Mirror Cards (High-Density 3-Step Overview) */}
        <PatientOverviewCards />
      </div>
    </div>
  );
}
