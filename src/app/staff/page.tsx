'use client';

import React from 'react';
import { useStaffRealtime } from '@/hooks/useStaffRealtime';
import { useStaffStore } from '@/store/useStaffStore';
import { StaffHeader } from '@/components/staff/StaffHeader';
import { StatusBadge } from '@/components/staff/StatusBadge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Phone,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getPatientFullName } from '@/lib/schemas';
import type { PatientPresenceStatus } from '@/lib/realtime';

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

interface FieldItemProps {
  label: string;
  value?: string | null;
  mono?: boolean;
}

function FieldItem({ label, value, mono = false }: FieldItemProps) {
  return (
    <div>
      <span className="text-xs text-muted-foreground block">{label}</span>
      <span className={mono ? 'font-medium font-mono' : 'font-medium'}>
        {value?.trim() ? value : <span className="text-muted-foreground italic">—</span>}
      </span>
    </div>
  );
}

export default function StaffPage() {
  // Subscribe to real-time events via custom hook
  useStaffRealtime();

  // Read state directly from store
  const patientData = useStaffStore((state) => state.patientData);
  const lastFieldChanged = useStaffStore((state) => state.lastFieldChanged);
  const lastFieldChangedAt = useStaffStore((state) => state.lastFieldChangedAt);
  const currentStep = useStaffStore((state) => state.currentStep);
  const patientStatus = useStaffStore((state) => state.patientStatus);
  const isSubmitted = useStaffStore((state) => state.isSubmitted);
  const submittedAt = useStaffStore((state) => state.submittedAt);

  const personal = patientData?.personal;
  const contact = patientData?.contact;
  const emergency = patientData?.emergency;
  const fullName = getPatientFullName(personal);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Header & Status Bar */}
        <StaffHeader />

        {/* Submission Confirmation Banner */}
        {isSubmitted && (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-200">
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="flex-1">
              <p className="font-semibold text-sm">
                Patient Form Submitted Successfully
              </p>
              <p className="text-xs opacity-90">
                Submitted at: {submittedAt ? new Date(submittedAt).toLocaleTimeString() : 'Just now'}
              </p>
            </div>
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
              Completed
            </Badge>
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

        {/* Live Patient Intake Mirror Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Step 1: Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="size-4 text-primary" />
                <CardTitle>1. Personal Details</CardTitle>
              </div>
              <CardDescription>Name, birth date, and identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <FieldItem label="Full Name" value={fullName} />
              <div className="grid grid-cols-2 gap-2">
                <FieldItem label="Date of Birth" value={personal?.dateOfBirth} />
                <FieldItem
                  label="Gender"
                  value={personal?.gender ? personal.gender.toUpperCase() : null}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FieldItem label="Preferred Language" value={personal?.preferredLanguage} />
                <FieldItem label="Nationality" value={personal?.nationality} />
              </div>
              {personal?.religion && (
                <FieldItem label="Religion" value={personal.religion} />
              )}
            </CardContent>
          </Card>

          {/* Step 2: Contact Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                <CardTitle>2. Contact Details</CardTitle>
              </div>
              <CardDescription>Phone, email, and residential address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <FieldItem label="Phone Number" value={contact?.phoneNumber} mono />
              <FieldItem label="Email Address" value={contact?.email} />
              <FieldItem label="Residential Address" value={contact?.address} />
            </CardContent>
          </Card>

          {/* Step 3: Emergency Contact */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-4 text-primary" />
                <CardTitle>3. Emergency Contact</CardTitle>
              </div>
              <CardDescription>Primary emergency representative</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <FieldItem label="Contact Name" value={emergency?.contactName} />
              <FieldItem label="Relationship" value={emergency?.relationship} />
              <FieldItem label="Contact Phone" value={emergency?.contactPhone} mono />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
