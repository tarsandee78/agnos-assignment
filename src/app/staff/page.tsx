'use client';

import React from 'react';
import { useStaffRealtime } from '@/hooks/useStaffRealtime';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge, PatientStatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Wifi,
  WifiOff,
  Activity,
  User,
  Phone,
  ShieldAlert,
  Clock,
  CheckCircle2,
  RotateCcw,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getPatientFullName } from '@/lib/schemas';

const STEP_LABELS = {
  1: '1. Personal Details',
  2: '2. Contact Information',
  3: '3. Emergency & Review',
} as const;

export default function StaffPage() {
  const {
    patientData,
    lastFieldChanged,
    lastFieldChangedAt,
    currentStep,
    patientStatus,
    connectionStatus,
    isSubmitted,
    submittedAt,
    resetStaffState,
  } = useStaffRealtime();

  const personal = patientData?.personal;
  const contact = patientData?.contact;
  const emergency = patientData?.emergency;
  const fullName = getPatientFullName(personal);

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'CONNECTED':
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5 font-medium"
          >
            <Wifi className="size-3.5" />
            <span>Connected (Supabase)</span>
          </Badge>
        );
      case 'FALLBACK_LOCAL':
        return (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 gap-1.5 font-medium"
          >
            <Activity className="size-3.5" />
            <span>Local Fallback (BroadcastChannel)</span>
          </Badge>
        );
      case 'CONNECTING':
        return (
          <Badge
            variant="outline"
            className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 gap-1.5 font-medium animate-pulse"
          >
            <Activity className="size-3.5" />
            <span>Connecting...</span>
          </Badge>
        );
      case 'DISCONNECTED':
      default:
        return (
          <Badge
            variant="outline"
            className="border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 gap-1.5 font-medium"
          >
            <WifiOff className="size-3.5" />
            <span>Disconnected</span>
          </Badge>
        );
    }
  };

  const getPresenceBadge = () => {
    if (patientStatus === 'offline') {
      return (
        <Badge
          variant="outline"
          className="border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 gap-1.5"
        >
          <span className="size-2 rounded-full bg-zinc-400" />
          <span>Patient Offline</span>
        </Badge>
      );
    }
    return (
      <PatientStatusBadge
        status={patientStatus}
        labels={{
          typing: 'Actively filling in',
          idle: 'Inactive (idle)',
          submitted: 'Submitted',
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Header & Status Bar */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Staff Monitoring Dashboard
              </h1>
              <Badge variant="secondary" className="text-xs">
                Real-Time
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Live patient intake monitoring and presence synchronization
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {getConnectionBadge()}
            {getPresenceBadge()}
            <Button
              variant="outline"
              size="sm"
              onClick={resetStaffState}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              title="Reset intake monitor state"
            >
              <RotateCcw className="size-3.5" />
              Reset State
            </Button>
          </div>
        </header>

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
                {currentStep === 1
                  ? 'Personal details section'
                  : currentStep === 2
                  ? 'Contact information section'
                  : 'Emergency contact & review'}
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
              <div className="text-lg font-bold capitalize">
                {patientStatus === 'typing'
                  ? 'Actively filling in'
                  : patientStatus === 'idle'
                  ? 'Inactive (idle)'
                  : patientStatus}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {patientStatus === 'typing'
                  ? 'Receiving real-time typing events'
                  : patientStatus === 'idle'
                  ? 'Inactivity detected (> 5s)'
                  : patientStatus === 'submitted'
                  ? 'Intake form complete'
                  : 'No active patient detected'}
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
              <div>
                <span className="text-xs text-muted-foreground block">Full Name</span>
                <span className="font-medium">
                  {fullName || <span className="text-muted-foreground italic">Not provided</span>}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-muted-foreground block">Date of Birth</span>
                  <span className="font-medium">
                    {personal?.dateOfBirth || (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Gender</span>
                  <span className="font-medium capitalize">
                    {personal?.gender || (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-muted-foreground block">Preferred Language</span>
                  <span className="font-medium">
                    {personal?.preferredLanguage || (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Nationality</span>
                  <span className="font-medium">
                    {personal?.nationality || (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </span>
                </div>
              </div>
              {personal?.religion && (
                <div>
                  <span className="text-xs text-muted-foreground block">Religion</span>
                  <span className="font-medium">{personal.religion}</span>
                </div>
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
              <div>
                <span className="text-xs text-muted-foreground block">Phone Number</span>
                <span className="font-medium font-mono">
                  {contact?.phoneNumber || (
                    <span className="text-muted-foreground italic">Not provided</span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Email Address</span>
                <span className="font-medium">
                  {contact?.email || (
                    <span className="text-muted-foreground italic">Not provided</span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Residential Address</span>
                <p className="font-medium whitespace-pre-wrap">
                  {contact?.address || (
                    <span className="text-muted-foreground italic">Not provided</span>
                  )}
                </p>
              </div>
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
              <div>
                <span className="text-xs text-muted-foreground block">Contact Name</span>
                <span className="font-medium">
                  {emergency?.contactName || (
                    <span className="text-muted-foreground italic">Not provided</span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Relationship</span>
                <span className="font-medium">
                  {emergency?.relationship || (
                    <span className="text-muted-foreground italic">Not provided</span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Contact Phone</span>
                <span className="font-medium font-mono">
                  {emergency?.contactPhone || (
                    <span className="text-muted-foreground italic">Not provided</span>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
