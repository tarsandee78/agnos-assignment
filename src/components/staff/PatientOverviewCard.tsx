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
import { useLanguage } from '@/hooks/useLanguage';
import { type TranslationDictionary, type Language } from '@/lib/i18n/translations';

// ============================================================================
// 1. Interfaces & Configurations
// ============================================================================

export interface PatientOverviewCardsProps {
  className?: string;
  lang?: Language;
  t?: TranslationDictionary;
}

function getStepCardClass(isActive: boolean, className?: string) {
  return cn(
    'flex flex-col border-border/80 shadow-xs transition-colors duration-200 bg-card rounded-2xl overflow-hidden',
    isActive && 'border-primary/60 ring-1 ring-primary/40',
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
      badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      icon: CheckCircle2,
    };
  }

  if (filledCount > 0) {
    return {
      label: t.staff.cards.inProgress(filledCount, totalRequired),
      badgeClass: 'border-primary/25 bg-primary/10 text-primary dark:text-primary-foreground',
      icon: Clock,
    };
  }

  if (isOptional) {
    return {
      label: t.staff.cards.optional,
      badgeClass: 'border-border bg-muted/60 text-muted-foreground',
      icon: Circle,
    };
  }

  return {
    label: t.staff.cards.pending(0, totalRequired),
    badgeClass: 'border-border bg-muted/60 text-muted-foreground',
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
  completeness: CompletenessInfo;
  activeBadgeText?: string;
}

function StepCardHeader({
  stepNumber,
  title,
  subtitle,
  icon: Icon,
  isActive,
  completeness,
  activeBadgeText = 'Active',
}: StepCardHeaderProps) {
  const CompletenessIcon = completeness.icon;

  return (
    <CardHeader className="border-b border-border/60 p-4 sm:p-5 min-h-[92px] flex flex-col justify-center">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
                {stepNumber}. {title}
              </CardTitle>
              {isActive && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary border border-primary/30 uppercase tracking-wider">
                  {activeBadgeText}
                </span>
              )}
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5 truncate">
              {subtitle}
            </CardDescription>
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn('text-[11px] gap-1 py-0.5 px-2 font-medium shrink-0 self-start', completeness.badgeClass)}
        >
          <CompletenessIcon className="size-3 shrink-0" />
          <span>{completeness.label}</span>
        </Badge>
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
  const currentStep = useCurrentStep();
  const isActive = currentStep === 1;

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

  return (
    <Card className={getStepCardClass(isActive, className)}>
      <StepCardHeader
        stepNumber={1}
        title={t.staff.cards.step1Title}
        subtitle={t.staff.cards.step1Desc}
        icon={User}
        isActive={isActive}
        completeness={completeness}
        activeBadgeText={t.common.active}
      />

      <CardContent className="space-y-3 pt-4 flex-1">
        {/* Full Name Display (Key Focus) */}
        <FieldDisplay
          label={t.personal.fullName}
          value={fullName}
          fieldName="personal.firstName"
          icon={User}
        />

        {/* First & Last Name (Spacious 2-Column Split 50/50) */}
        <div className="grid grid-cols-2 gap-2.5">
          <FieldDisplay
            label={t.personal.firstName}
            section="personal"
            field="firstName"
          />
          <FieldDisplay
            label={t.personal.lastName}
            section="personal"
            field="lastName"
          />
        </div>

        {/* Middle Name (Dedicated Clean Sub-row) */}
        <FieldDisplay
          label={t.personal.middleName}
          section="personal"
          field="middleName"
        />

        {/* Date of Birth & Gender (2-Column Grid) */}
        <div className="grid grid-cols-2 gap-2.5">
          <FieldDisplay
            label={t.personal.dateOfBirth}
            value={personal?.dateOfBirth}
            fieldName="personal.dateOfBirth"
            subValue={ageLabel}
            icon={Calendar}
          />
          <FieldDisplay
            label={t.personal.gender}
            value={localizedGender}
            fieldName="personal.gender"
          />
        </div>

        {/* Preferred Language & Nationality (2-Column Grid) */}
        <div className="grid grid-cols-2 gap-2.5">
          <FieldDisplay
            label={t.personal.preferredLanguage}
            value={localizedLanguage}
            fieldName="personal.preferredLanguage"
            icon={Globe}
          />
          <FieldDisplay
            label={t.personal.nationality}
            section="personal"
            field="nationality"
          />
        </div>

        {/* Religion (Clean Full Width) */}
        <FieldDisplay
          label={t.personal.religion}
          value={localizedReligion}
          fieldName="personal.religion"
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
  const currentStep = useCurrentStep();
  const isActive = currentStep === 2;

  const requiredValues = [contact?.phoneNumber, contact?.email, contact?.address];
  const filledCount = requiredValues.filter((v) => v && v.trim().length > 0).length;
  const completeness = getCompleteness(filledCount, 3, t);

  const formattedPhone = contact?.phoneNumber ? formatPhoneNumber(contact.phoneNumber) : null;
  const phoneTelHref = contact?.phoneNumber
    ? `tel:${contact.phoneNumber.replace(/[^\d+]/g, '')}`
    : undefined;
  const emailHref = contact?.email ? `mailto:${contact.email}` : undefined;

  return (
    <Card className={getStepCardClass(isActive, className)}>
      <StepCardHeader
        stepNumber={2}
        title={t.staff.cards.step2Title}
        subtitle={t.staff.cards.step2Desc}
        icon={Phone}
        isActive={isActive}
        completeness={completeness}
        activeBadgeText={t.common.active}
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
          />
          <FieldDisplay
            label={t.contact.email}
            section="contact"
            field="email"
            href={emailHref}
            icon={Mail}
          />
        </div>

        <FieldDisplay
          label={t.contact.address}
          section="contact"
          field="address"
          icon={MapPin}
          className="min-h-[72px]"
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
  const currentStep = useCurrentStep();
  const isActive = currentStep === 3;

  const optionalValues = [
    emergency?.contactName,
    emergency?.relationship,
    emergency?.contactPhone,
  ];
  const filledCount = optionalValues.filter((v) => v && v.trim().length > 0).length;
  const completeness = getCompleteness(filledCount, 3, t, true);

  const formattedEmergencyPhone = emergency?.contactPhone
    ? formatPhoneNumber(emergency.contactPhone)
    : null;
  const emergencyPhoneHref = emergency?.contactPhone
    ? `tel:${emergency.contactPhone.replace(/[^\d+]/g, '')}`
    : undefined;

  return (
    <Card className={getStepCardClass(isActive, className)}>
      <StepCardHeader
        stepNumber={3}
        title={t.staff.cards.step3Title}
        subtitle={t.staff.cards.step3Desc}
        icon={ShieldAlert}
        isActive={isActive}
        completeness={completeness}
        activeBadgeText={t.common.active}
      />

      <CardContent className="space-y-3 pt-4 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <FieldDisplay
            label={t.emergency.contactName}
            section="emergency"
            field="contactName"
            icon={User}
          />
          <FieldDisplay
            label={t.emergency.relationship}
            section="emergency"
            field="relationship"
            icon={Heart}
          />
        </div>

        <FieldDisplay
          label={t.emergency.emergencyPhone}
          value={formattedEmergencyPhone}
          fieldName="emergency.contactPhone"
          mono
          href={emergencyPhoneHref}
          icon={Phone}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// 6. Main Container
// ============================================================================

export function PatientOverviewCards({ className, t: propT }: PatientOverviewCardsProps) {
  const defaultHook = useLanguage('agnos_lang_staff', 'th');
  const t = propT || defaultHook.t;

  return (
    <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch', className)}>
      <PersonalDetailsCard t={t} />
      <ContactDetailsCard t={t} />
      <EmergencyContactCard t={t} />
    </div>
  );
}
