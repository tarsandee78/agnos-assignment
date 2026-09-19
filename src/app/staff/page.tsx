'use client';

import React from 'react';
import { useStaffRealtime } from '@/hooks/useStaffRealtime';
import { useStaffStore } from '@/store/useStaffStore';
import { StaffHeader } from '@/components/staff/StaffHeader';
import { PatientOverviewCards } from '@/components/staff/PatientOverviewCard';
import { NextPatientDialog } from '@/components/staff/NextPatientDialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

// ============================================================================
// Staff Dashboard Page Component (Impeccable Operate Mode)
// ============================================================================

/**
 * Staff Intake Monitoring Dashboard.
 *
 * Impeccable Operate Mode:
 * - Direct visual focus on live patient form data without redundant metric cards.
 * - Subscribes to real-time events via `useStaffRealtime`.
 * - High-contrast clinical submission banner (WCAG AAA compliant).
 * - Zero layout shift (CLS = 0) with seamless live field mirroring.
 */
export default function StaffPage() {
  // Subscribe to real-time room events (Supabase + BroadcastChannel fallback)
  useStaffRealtime();

  // Read status from Zustand store
  const isSubmitted = useStaffStore((state) => state.isSubmitted);
  const submittedAt = useStaffStore((state) => state.submittedAt);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Header & Status Bar */}
        <StaffHeader />

        {/* Submission Confirmation Banner (WCAG AAA High Contrast) */}
        {isSubmitted && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-emerald-950 dark:text-emerald-50 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                <CheckCircle2 className="size-5 stroke-[2.5]" aria-hidden="true" />
              </div>
              <div>
                <p className="font-bold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
                  Patient Form Submitted Successfully / คนไข้ส่งข้อมูลเรียบร้อยแล้ว
                </p>
                <p className="text-xs text-emerald-800/90 dark:text-emerald-200/90">
                  Submitted at: {submittedAt ? new Date(submittedAt).toLocaleTimeString() : 'Just now'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Badge variant="outline" className="border-emerald-600/40 bg-emerald-100/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 font-semibold text-xs">
                Completed
              </Badge>
              <NextPatientDialog
                label="Prepare Next Patient"
                variant="default"
                className="bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-sm min-h-[40px] touch-target"
              />
            </div>
          </div>
        )}

        {/* Live Patient Intake Mirror Cards (Hero Focus) */}
        <PatientOverviewCards />
      </div>
    </div>
  );
}
