'use client';

import React from 'react';
import { useStaffStore, useCurrentStep } from '@/store/useStaffStore';
import { FieldDisplay } from './FieldDisplay';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  User,
  Phone,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Circle,
  Mail,
  MapPin,
  Calendar,
  Globe,
  Heart,
} from 'lucide-react';
import {
  formatPhoneNumber,
  getPatientFullName,
  calculatePatientAge,
} from '@/lib/schemas';
import { translations, type TranslationDictionary, type Language } from '@/lib/i18n/translations';

// ============================================================================
// 1. Interfaces & Configurations
// ============================================================================

export interface PatientOverviewCardsProps {
  className?: string;
  lang?: Language;
  t?: TranslationDictionary;
}

function getStepCardClass(isActive: boolean, isCompleted: boolean, className?: string) {
  return cn(
    'flex flex-col shadow-xs transition-all duration-300 bg-card rounded-2xl overflow-hidden relative border',
    isActive
      ? 'border-primary ring-2 ring-primary/40 shadow-[0_0_22px_rgba(59,130,246,0.25)] animate-blue-wave'
      : isCompleted
      ? 'card-green-glow bg-emerald-500/[0.015]'
      : 'border-border/80',
    className
  );
}

interface CompletenessInfo {
  label: string;
  badgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

function getCompleteness(
  filledCount: number,
  totalRequired: number,
  t: TranslationDictionary,
  isOptional = false
): CompletenessInfo {
  if (filledCount === totalRequired) {
    return {
      label: isOptional
        ? t.staff.cards.provided(filledCount, totalRequired)
        : t.staff.cards.complete(filledCount, totalRequired),
      badgeClass: 'border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-500/40 font-semibold',
      icon: CheckCircle2,
    };
  }

  if (filledCount > 0) {
    return {
      label: t.staff.cards.inProgress(filledCount, totalRequired),
      badgeClass: 'border-blue-600/30 bg-blue-50 text-blue-900 dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-500/40 font-semibold',
      icon: Clock,
    };
  }

  if (isOptional) {
    return {
      label: t.staff.cards.optional,
      badgeClass: 'border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-medium',
      icon: Circle,
    };
  }

  return {
    label: t.staff.cards.pending(0, totalRequired),
    badgeClass: 'border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-medium',
    icon: Circle,
  };
}

// ============================================================================
// 2. Shared Step Card Header (Equal Heights & Clean Layout)
// ============================================================================

interface StepCardHeaderProps {
  stepNumber: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  isCompleted?: boolean;
  completeness: CompletenessInfo;
  activeBadgeText?: string;
  completedBadgeText?: string;
}

function StepCardHeader({
  stepNumber,
  title,
  subtitle,
  icon: Icon,
  isActive,
  isCompleted = false,
  completeness,
  activeBadgeText = 'Active',
  completedBadgeText = 'Completed',
}: StepCardHeaderProps) {
  const CompletenessIcon = completeness.icon;

  return (
    <CardHeader className="border-b border-border/60 p-4 sm:p-5 flex flex-col justify-between min-h-[108px] relative">
      {/* Tier 1: Top Bar with Completeness (Left) & Top-Rightmost ACTIVE / Completed status (Right) */}
      <div className="flex items-center justify-between gap-2 w-full">
        <Badge
          variant="outline"
          className={cn(
            'text-[11px] gap-1.5 py-0.5 px-2.5 font-semibold shrink-0 select-none shadow-2xs',
            completeness.badgeClass
          )}
        >
          <CompletenessIcon className="size-3 shrink-0" />
          <span>{completeness.label}</span>
        </Badge>

        <div className="flex items-center shrink-0">
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground shadow-xs uppercase tracking-wider animate-pulse select-none">
              <span className="size-1.5 rounded-full bg-white animate-ping" />
              <span>{activeBadgeText}</span>
            </span>
          ) : isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-500/30 uppercase tracking-wider select-none">
              <CheckCircle2 className="size-3 stroke-[2.5]" />
              <span>{completedBadgeText}</span>
            </span>
          ) : (
            <div className="h-5" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Tier 2: Step Icon + Title + Subtitle Row (Directly below Tier 1) */}
      <div className="flex items-start gap-2.5 mt-2.5 w-full min-w-0">
        <div
          className={cn(
            'relative flex size-9 shrink-0 items-center justify-center rounded-lg transition-all mt-0.5',
            isActive
              ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30'
              : isCompleted
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="size-4 stroke-[2.5]" aria-hidden="true" />
          ) : (
            <Icon className="size-4" aria-hidden="true" />
          )}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground leading-snug">
            {stepNumber}. {title}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5 leading-normal">
            {subtitle}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}

// ============================================================================
// 3. Step 1: Personal Details Card (Spacious 2-Column Grid)
// ============================================================================

export function PersonalDetailsCard({
  className,
  t,
}: {
  className?: string;
  t: TranslationDictionary;
}) {
  const personal = useStaffStore((state) => state.patientData?.personal);
  const isSubmitted = useStaffStore((state) => state.isSubmitted);
  const currentStep = useCurrentStep();
  const isActive = !isSubmitted && currentStep === 1;

  const requiredValues = [
    personal?.firstName,
    personal?.lastName,
    personal?.dateOfBirth,
    personal?.gender,
    personal?.preferredLanguage,
    personal?.nationality,
  ];
  const filledCount = requiredValues.filter((v) => v && v.trim().length > 0).length;
  const completeness = getCompleteness(filledCount, 6, t);

  const fullName = getPatientFullName(personal);
  const ageLabel = calculatePatientAge(personal?.dateOfBirth);

  const localizedGender = personal?.gender
    ? t.personal.genderOptions[personal.gender as keyof typeof t.personal.genderOptions] || personal.gender
    : null;

  const localizedLanguage = personal?.preferredLanguage
    ? t.personal.languageOptions[personal.preferredLanguage as keyof typeof t.personal.languageOptions] || personal.preferredLanguage
    : null;

  const localizedReligion = personal?.religion
    ? t.personal.religionOptions[personal.religion as keyof typeof t.personal.religionOptions] || personal.religion
    : personal?.religion === ''
    ? t.personal.religionOptions.None
    : null;

  const isCompleted = filledCount === 6;

  return (
    <Card className={getStepCardClass(isActive, isCompleted, className)}>
      <StepCardHeader
        stepNumber={1}
        title={t.staff.cards.step1Title}
        subtitle={t.staff.cards.step1Desc}
        icon={User}
        isActive={isActive}
        isCompleted={isCompleted}
        completeness={completeness}
        activeBadgeText={t.common.active}
        completedBadgeText={t.common.completed}
      />

      <CardContent className="space-y-3 pt-4 flex-1">
        {/* Full Name Display (Key Focus: tracks firstName, middleName, and lastName) */}
        <FieldDisplay
          label={t.personal.fullName}
          value={fullName}
          fieldName={['personal.firstName', 'personal.middleName', 'personal.lastName']}
          icon={User}
          t={t}
        />

        {/* First & Last Name (Spacious 2-Column Split 50/50) */}
        <div className="grid grid-cols-2 gap-2.5">
          <FieldDisplay
            label={t.personal.firstName}
            section="personal"
            field="firstName"
            t={t}
          />
          <FieldDisplay
            label={t.personal.lastName}
            section="personal"
            field="lastName"
            t={t}
          />
        </div>

        {/* Middle Name (Dedicated Clean Sub-row) */}
        <FieldDisplay
          label={t.personal.middleName}
          section="personal"
          field="middleName"
          t={t}
        />

        {/* Date of Birth & Gender (2-Column Grid) */}
        <div className="grid grid-cols-2 gap-2.5">
          <FieldDisplay
            label={t.personal.dateOfBirth}
            value={personal?.dateOfBirth}
            fieldName="personal.dateOfBirth"
            subValue={ageLabel}
            icon={Calendar}
            t={t}
          />
          <FieldDisplay
            label={t.personal.gender}
            value={localizedGender}
            fieldName="personal.gender"
            t={t}
          />
        </div>

        {/* Preferred Language & Nationality (2-Column Grid) */}
        <div className="grid grid-cols-2 gap-2.5">
          <FieldDisplay
            label={t.personal.preferredLanguage}
            value={localizedLanguage}
            fieldName="personal.preferredLanguage"
            icon={Globe}
            t={t}
          />
          <FieldDisplay
            label={t.personal.nationality}
            section="personal"
            field="nationality"
            t={t}
          />
        </div>

        {/* Religion (Clean Full Width) */}
        <FieldDisplay
          label={t.personal.religion}
          value={localizedReligion}
          fieldName="personal.religion"
          t={t}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// 4. Step 2: Contact Information Card
// ============================================================================

export function ContactDetailsCard({
  className,
  t,
}: {
  className?: string;
  t: TranslationDictionary;
}) {
  const contact = useStaffStore((state) => state.patientData?.contact);
  const isSubmitted = useStaffStore((state) => state.isSubmitted);
  const currentStep = useCurrentStep();
  const isActive = !isSubmitted && currentStep === 2;

  const requiredValues = [contact?.phoneNumber, contact?.email, contact?.address];
  const filledCount = requiredValues.filter((v) => v && v.trim().length > 0).length;
  const completeness = getCompleteness(filledCount, 3, t);

  const formattedPhone = contact?.phoneNumber ? formatPhoneNumber(contact.phoneNumber) : null;
  const phoneTelHref = contact?.phoneNumber
    ? `tel:${contact.phoneNumber.replace(/[^\d+]/g, '')}`
    : undefined;
  const emailHref = contact?.email ? `mailto:${contact.email}` : undefined;

  const isCompleted = filledCount === 3;

  return (
    <Card className={getStepCardClass(isActive, isCompleted, className)}>
      <StepCardHeader
        stepNumber={2}
        title={t.staff.cards.step2Title}
        subtitle={t.staff.cards.step2Desc}
        icon={Phone}
        isActive={isActive}
        isCompleted={isCompleted}
        completeness={completeness}
        activeBadgeText={t.common.active}
        completedBadgeText={t.common.completed}
      />

      <CardContent className="space-y-3 pt-4 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <FieldDisplay
            label={t.contact.phoneNumber}
            value={formattedPhone}
            fieldName="contact.phoneNumber"
            mono
            href={phoneTelHref}
            icon={Phone}
            t={t}
          />
          <FieldDisplay
            label={t.contact.email}
            section="contact"
            field="email"
            href={emailHref}
            icon={Mail}
            t={t}
          />
        </div>

        <FieldDisplay
          label={t.contact.address}
          section="contact"
          field="address"
          icon={MapPin}
          className="min-h-[72px]"
          t={t}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// 5. Step 3: Emergency Contact Card
// ============================================================================

export function EmergencyContactCard({
  className,
  t,
}: {
  className?: string;
  t: TranslationDictionary;
}) {
  const emergency = useStaffStore((state) => state.patientData?.emergency);
  const isSubmitted = useStaffStore((state) => state.isSubmitted);
  const currentStep = useCurrentStep();
  const isActive = !isSubmitted && currentStep === 3;

  const optionalValues = [
    emergency?.contactName,
    emergency?.relationship,
    emergency?.contactPhone,
  ];
  const filledCount = optionalValues.filter((v) => v && v.trim().length > 0).length;
  const isCompleted = filledCount === 3 || (isSubmitted && filledCount > 0);
  const completeness = getCompleteness(filledCount, 3, t, true);

  const formattedEmergencyPhone = emergency?.contactPhone
    ? formatPhoneNumber(emergency.contactPhone)
    : null;
  const emergencyPhoneHref = emergency?.contactPhone
    ? `tel:${emergency.contactPhone.replace(/[^\d+]/g, '')}`
    : undefined;

  return (
    <Card className={getStepCardClass(isActive, isCompleted, className)}>
      <StepCardHeader
        stepNumber={3}
        title={t.staff.cards.step3Title}
        subtitle={t.staff.cards.step3Desc}
        icon={ShieldAlert}
        isActive={isActive}
        isCompleted={isCompleted}
        completeness={completeness}
        activeBadgeText={t.common.active}
        completedBadgeText={t.common.completed}
      />

      <CardContent className="space-y-3 pt-4 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <FieldDisplay
            label={t.emergency.contactName}
            section="emergency"
            field="contactName"
            icon={User}
            t={t}
          />
          <FieldDisplay
            label={t.emergency.relationship}
            section="emergency"
            field="relationship"
            icon={Heart}
            t={t}
          />
        </div>

        <FieldDisplay
          label={t.emergency.emergencyPhone}
          value={formattedEmergencyPhone}
          fieldName="emergency.contactPhone"
          mono
          href={emergencyPhoneHref}
          icon={Phone}
          t={t}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// 6. Main Container
// ============================================================================

export function PatientOverviewCards({ className, t }: PatientOverviewCardsProps) {
  const activeT = t || translations.th;

  return (
    <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch', className)}>
      <PersonalDetailsCard t={activeT} />
      <ContactDetailsCard t={activeT} />
      <EmergencyContactCard t={activeT} />
    </div>
  );
}
